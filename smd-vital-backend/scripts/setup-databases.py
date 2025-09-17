24#!/usr/bin/env python3
"""
SMD Vital - Database Setup Script
=================================

Script para configurar todas las bases de datos y ejecutar migraciones.

Author: Backend Team
"""

import asyncio
import os
import sys
import subprocess
from pathlib import Path
from typing import List, Dict
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Configuración de bases de datos
DATABASE_CONFIGS = {
    'auth': {
        'name': 'smdvital_auth',
        'description': 'Base de datos de autenticación y usuarios',
        'service_path': 'services/auth'
    },
    'users': {
        'name': 'smdvital_users', 
        'description': 'Base de datos de perfiles de usuario',
        'service_path': 'services/users'
    },
    'appointments': {
        'name': 'smdvital_appointments',
        'description': 'Base de datos de citas médicas',
        'service_path': 'services/appointments'
    },
    'medical_records': {
        'name': 'smdvital_medical_records',
        'description': 'Base de datos de registros médicos',
        'service_path': 'services/medical-records'
    },
    'payments': {
        'name': 'smdvital_payments',
        'description': 'Base de datos de pagos y facturación',
        'service_path': 'services/payments'
    },
    'notifications': {
        'name': 'smdvital_notifications',
        'description': 'Base de datos de notificaciones',
        'service_path': 'services/notifications'
    }
}

# Configuración de conexión
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_USER = os.getenv('DB_USER', 'smdvital')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'smdvital_password_2024')
DB_ADMIN_USER = os.getenv('DB_ADMIN_USER', 'smdvital')
DB_ADMIN_PASSWORD = os.getenv('DB_ADMIN_PASSWORD', 'smdvital_password_2024')


def get_project_root() -> Path:
    """Obtener la raíz del proyecto"""
    return Path(__file__).parent.parent


def create_databases():
    """Crear todas las bases de datos necesarias"""
    print("🗄️  Creando bases de datos...")
    
    try:
        # Conectar como administrador
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_ADMIN_USER,
            password=DB_ADMIN_PASSWORD,
            database='smdvital'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Crear usuario principal si no existe
        cursor.execute(f"""
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '{DB_USER}') THEN
                    CREATE USER {DB_USER} WITH PASSWORD '{DB_PASSWORD}';
                    ALTER USER {DB_USER} CREATEDB;
                END IF;
            END
            $$;
        """)
        print(f"✅ Usuario '{DB_USER}' configurado")
        
        # Crear cada base de datos
        for service, config in DATABASE_CONFIGS.items():
            db_name = config['name']
            
            # Verificar si la base de datos existe
            cursor.execute("""
                SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s
            """, (db_name,))
            
            if cursor.fetchone():
                print(f"⚠️  Base de datos '{db_name}' ya existe")
            else:
                # Crear base de datos
                cursor.execute(f'CREATE DATABASE "{db_name}" OWNER {DB_USER}')
                print(f"✅ Base de datos '{db_name}' creada - {config['description']}")
        
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"❌ Error creando bases de datos: {e}")
        sys.exit(1)


def run_alembic_migrations():
    """Ejecutar migraciones de Alembic para cada servicio"""
    print("\n🔄 Ejecutando migraciones de base de datos...")
    
    project_root = get_project_root()
    
    for service, config in DATABASE_CONFIGS.items():
        service_path = project_root / config['service_path']
        
        if not (service_path / 'alembic').exists():
            print(f"⚠️  No hay configuración de Alembic para {service}")
            continue
        
        print(f"\n📦 Procesando {service}...")
        
        # Configurar variables de entorno para Alembic
        env = os.environ.copy()
        env['DATABASE_URL'] = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{config['name']}"
        
        try:
            # Cambiar al directorio del servicio
            os.chdir(service_path)
            
            # Ejecutar upgrade
            result = subprocess.run(
                ['alembic', 'upgrade', 'head'],
                env=env,
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                print(f"✅ Migraciones aplicadas para {service}")
                if result.stdout:
                    print(f"   {result.stdout.strip()}")
            else:
                print(f"❌ Error en migraciones para {service}:")
                print(f"   {result.stderr}")
                
        except subprocess.CalledProcessError as e:
            print(f"❌ Error ejecutando Alembic para {service}: {e}")
        except FileNotFoundError:
            print(f"⚠️  Alembic no encontrado. Instala con: pip install alembic")
        finally:
            # Volver al directorio raíz
            os.chdir(project_root)


def create_initial_admin_user():
    """Crear usuario administrador inicial"""
    print("\n👤 Creando usuario administrador inicial...")
    
    # TODO: Implementar creación de usuario admin
    # Esto se haría después de que el servicio de auth esté funcionando
    print("⚠️  Creación de admin pendiente - se realizará después del primer inicio")


def verify_database_connections():
    """Verificar que todas las conexiones de base de datos funcionan"""
    print("\n🔍 Verificando conexiones de base de datos...")
    
    for service, config in DATABASE_CONFIGS.items():
        try:
            conn = psycopg2.connect(
                host=DB_HOST,
                port=DB_PORT,
                user=DB_USER,
                password=DB_PASSWORD,
                database=config['name']
            )
            
            cursor = conn.cursor()
            cursor.execute('SELECT version()')
            version = cursor.fetchone()[0]
            
            cursor.close()
            conn.close()
            
            print(f"✅ Conexión exitosa a {config['name']}")
            
        except psycopg2.Error as e:
            print(f"❌ Error conectando a {config['name']}: {e}")


def show_database_info():
    """Mostrar información de las bases de datos creadas"""
    print(f"\n📊 Información de bases de datos:")
    print(f"{'='*60}")
    print(f"Host: {DB_HOST}:{DB_PORT}")
    print(f"Usuario: {DB_USER}")
    print(f"{'='*60}")
    
    for service, config in DATABASE_CONFIGS.items():
        print(f"🗄️  {config['name']}")
        print(f"   📝 {config['description']}")
        print(f"   🔗 postgresql://{DB_USER}@{DB_HOST}:{DB_PORT}/{config['name']}")
        print()


def main():
    """Función principal"""
    print("🚀 SMD Vital - Configuración de Base de Datos")
    print("=" * 50)
    
    # Verificar que PostgreSQL esté disponible
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_ADMIN_USER,
            password=DB_ADMIN_PASSWORD,
            database='smdvital'
        )
        conn.close()
        print("✅ PostgreSQL disponible")
    except psycopg2.Error as e:
        print(f"❌ No se puede conectar a PostgreSQL: {e}")
        print("   Asegúrate de que PostgreSQL esté ejecutándose")
        sys.exit(1)
    
    # Ejecutar configuración
    create_databases()
    run_alembic_migrations()
    verify_database_connections()
    create_initial_admin_user()
    show_database_info()
    
    print("\n🎉 Configuración de base de datos completada!")
    print("\n📝 Próximos pasos:")
    print("   1. Iniciar los servicios con Docker Compose")
    print("   2. Crear usuario administrador desde la API")
    print("   3. Configurar datos iniciales según sea necesario")


if __name__ == "__main__":
    main()
