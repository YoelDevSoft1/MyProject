"""
SMD Vital - Medical Records Database Manager
===========================================

Gestor de base de datos para el servicio de historiales médicos.
Maneja conexiones, transacciones y operaciones de base de datos.
"""

import os
import asyncio
from typing import Optional, Dict, Any, List
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
import asyncpg
import logging

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Gestor de base de datos para el servicio de historiales médicos"""
    
    def __init__(self):
        self.engine = None
        self.async_engine = None
        self.session_factory = None
        self.async_session_factory = None
        
        # Configuración de base de datos
        self.database_url = os.getenv(
            "DATABASE_URL", 
            "postgresql+asyncpg://smdvital:smdvital_password_2024@postgres:5432/smdvital_medical_records"
        )
        
        # URL síncrona para operaciones que requieren SQLAlchemy síncrono
        self.sync_database_url = self.database_url.replace("+asyncpg", "")
    
    async def init_engine(self):
        """Inicializar motores de base de datos"""
        try:
            # Motor asíncrono
            self.async_engine = create_async_engine(
                self.database_url,
                echo=False,
                pool_pre_ping=True,
                pool_recycle=300,
                pool_size=10,
                max_overflow=20
            )
            
            # Factory de sesiones asíncronas
            self.async_session_factory = async_sessionmaker(
                self.async_engine,
                class_=AsyncSession,
                expire_on_commit=False
            )
            
            # Motor síncrono para operaciones específicas
            self.engine = create_engine(
                self.sync_database_url,
                echo=False,
                pool_pre_ping=True,
                pool_recycle=300,
                pool_size=5,
                max_overflow=10
            )
            
            # Factory de sesiones síncronas
            self.session_factory = sessionmaker(
                bind=self.engine,
                autocommit=False,
                autoflush=False
            )
            
            # Probar conexión
            await self.test_connection()
            
            logger.info("Database engines initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing database engines: {e}")
            raise
    
    async def test_connection(self):
        """Probar conexión a la base de datos"""
        try:
            async with self.async_engine.begin() as conn:
                result = await conn.execute(text("SELECT 1"))
                logger.info("Database connection test successful")
        except Exception as e:
            logger.error(f"Database connection test failed: {e}")
            raise
    
    async def get_session(self):
        """Obtener sesión asíncrona de base de datos"""
        if not self.async_session_factory:
            raise RuntimeError("Database not initialized. Call init_engine() first.")
        
        return self.async_session_factory()
    
    def get_sync_session(self):
        """Obtener sesión síncrona de base de datos"""
        if not self.session_factory:
            raise RuntimeError("Database not initialized. Call init_engine() first.")
        
        return self.session_factory()
    
    async def fetch_one(self, query: str, params: List[Any] = None) -> Optional[Dict[str, Any]]:
        """Ejecutar consulta y obtener un resultado"""
        try:
            async with self.async_engine.begin() as conn:
                result = await conn.execute(text(query), params or [])
                row = result.fetchone()
                return dict(row._mapping) if row else None
        except Exception as e:
            logger.error(f"Error executing query: {e}")
            raise
    
    async def fetch_all(self, query: str, params: List[Any] = None) -> List[Dict[str, Any]]:
        """Ejecutar consulta y obtener todos los resultados"""
        try:
            async with self.async_engine.begin() as conn:
                result = await conn.execute(text(query), params or [])
                rows = result.fetchall()
                return [dict(row._mapping) for row in rows]
        except Exception as e:
            logger.error(f"Error executing query: {e}")
            raise
    
    async def execute(self, query: str, params: List[Any] = None) -> int:
        """Ejecutar consulta de modificación y retornar número de filas afectadas"""
        try:
            async with self.async_engine.begin() as conn:
                result = await conn.execute(text(query), params or [])
                return result.rowcount
        except Exception as e:
            logger.error(f"Error executing query: {e}")
            raise
    
    async def execute_many(self, query: str, params_list: List[List[Any]]) -> int:
        """Ejecutar consulta múltiples veces con diferentes parámetros"""
        try:
            total_rows = 0
            async with self.async_engine.begin() as conn:
                for params in params_list:
                    result = await conn.execute(text(query), params)
                    total_rows += result.rowcount
                return total_rows
        except Exception as e:
            logger.error(f"Error executing batch query: {e}")
            raise
    
    async def execute_transaction(self, operations: List[Dict[str, Any]]) -> bool:
        """Ejecutar múltiples operaciones en una transacción"""
        try:
            async with self.async_engine.begin() as conn:
                for operation in operations:
                    query = operation.get('query')
                    params = operation.get('params', [])
                    await conn.execute(text(query), params)
                return True
        except Exception as e:
            logger.error(f"Error executing transaction: {e}")
            return False
    
    async def create_tables(self):
        """Crear tablas de la base de datos"""
        try:
            from models.database import Base
            async with self.async_engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.error(f"Error creating tables: {e}")
            raise
    
    async def drop_tables(self):
        """Eliminar todas las tablas"""
        try:
            from models.database import Base
            async with self.async_engine.begin() as conn:
                await conn.run_sync(Base.metadata.drop_all)
            logger.info("Database tables dropped successfully")
        except Exception as e:
            logger.error(f"Error dropping tables: {e}")
            raise
    
    async def health_check(self) -> Dict[str, Any]:
        """Verificar salud de la base de datos"""
        try:
            # Verificar conexión
            await self.test_connection()
            
            # Obtener información de la base de datos
            db_info = await self.fetch_one("SELECT version() as version")
            
            # Verificar tablas principales
            tables_query = """
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('medical_records', 'medical_documents', 'lab_results', 'prescriptions')
            """
            tables = await self.fetch_all(tables_query)
            
            return {
                "status": "healthy",
                "database_version": db_info.get('version', 'Unknown'),
                "tables_found": len(tables),
                "tables": [table['table_name'] for table in tables]
            }
            
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e)
            }
    
    async def get_connection_info(self) -> Dict[str, Any]:
        """Obtener información de conexión"""
        try:
            # Obtener estadísticas de conexión
            stats_query = """
                SELECT 
                    count(*) as total_connections,
                    count(*) FILTER (WHERE state = 'active') as active_connections,
                    count(*) FILTER (WHERE state = 'idle') as idle_connections
                FROM pg_stat_activity 
                WHERE datname = current_database()
            """
            stats = await self.fetch_one(stats_query)
            
            # Obtener información de la base de datos
            db_info = await self.fetch_one("SELECT current_database() as database_name, current_user as user_name")
            
            return {
                "database_name": db_info.get('database_name'),
                "user_name": db_info.get('user_name'),
                "total_connections": stats.get('total_connections', 0),
                "active_connections": stats.get('active_connections', 0),
                "idle_connections": stats.get('idle_connections', 0)
            }
            
        except Exception as e:
            logger.error(f"Error getting connection info: {e}")
            return {"error": str(e)}
    
    async def close(self):
        """Cerrar conexiones de base de datos"""
        try:
            if self.async_engine:
                await self.async_engine.dispose()
            if self.engine:
                self.engine.dispose()
            logger.info("Database connections closed")
        except Exception as e:
            logger.error(f"Error closing database connections: {e}")
    
    def __del__(self):
        """Destructor para cerrar conexiones"""
        if hasattr(self, 'engine') and self.engine:
            self.engine.dispose()


