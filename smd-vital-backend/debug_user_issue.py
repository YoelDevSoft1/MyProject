#!/usr/bin/env python3
"""
SMD Vital - Debug de Problema de Usuario
========================================
Script para diagnosticar por qué el backend devuelve datos undefined
"""

import asyncio
import asyncpg
import jwt
import os
from datetime import datetime

# Configuración
JWT_SECRET = os.getenv("JWT_SECRET", "smd_vital_secret_key_2024_change_in_production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
DATABASE_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'smdvital_auth',
    'user': 'smdvital',
    'password': 'smdvital_password_2024'
}

def print_status(message, status="INFO"):
    """Imprimir mensaje con timestamp y estado"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {status}: {message}")

async def test_database_connection():
    """Probar conexión a la base de datos"""
    try:
        print_status("Probando conexión a la base de datos...")
        conn = await asyncpg.connect(**DATABASE_CONFIG)
        
        # Verificar si la tabla users existe
        result = await conn.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'users'
            );
        """)
        
        if result:
            print_status("✅ Tabla 'users' existe")
            
            # Contar usuarios
            count = await conn.fetchval("SELECT COUNT(*) FROM users")
            print_status(f"📊 Total de usuarios en la base de datos: {count}")
            
            # Mostrar usuarios existentes
            users = await conn.fetch("SELECT id, email, username, role FROM users LIMIT 5")
            if users:
                print_status("👥 Usuarios existentes:")
                for user in users:
                    print_status(f"  - ID: {user['id']}, Email: {user['email']}, Username: {user['username']}, Role: {user['role']}")
            else:
                print_status("⚠️  No hay usuarios en la base de datos")
        else:
            print_status("❌ Tabla 'users' no existe", "ERROR")
            
        await conn.close()
        return True
        
    except Exception as e:
        print_status(f"❌ Error de conexión a la base de datos: {e}", "ERROR")
        return False

async def test_jwt_token():
    """Probar decodificación de JWT"""
    try:
        print_status("Probando decodificación de JWT...")
        
        # Simular un token JWT válido
        test_payload = {
            "sub": "test_user_123",
            "email": "test@example.com",
            "role": "user",
            "exp": datetime.utcnow().timestamp() + 3600  # 1 hora
        }
        
        token = jwt.encode(test_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        print_status(f"✅ Token JWT generado: {token[:50]}...")
        
        # Decodificar el token
        decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        print_status(f"✅ Token decodificado correctamente: {decoded}")
        
        return True
        
    except Exception as e:
        print_status(f"❌ Error con JWT: {e}", "ERROR")
        return False

async def create_test_user():
    """Crear un usuario de prueba"""
    try:
        print_status("Creando usuario de prueba...")
        
        conn = await asyncpg.connect(**DATABASE_CONFIG)
        
        # Verificar si ya existe
        existing = await conn.fetchrow("SELECT id FROM users WHERE email = $1", "test@example.com")
        if existing:
            print_status("✅ Usuario de prueba ya existe")
            await conn.close()
            return True
        
        # Crear usuario de prueba
        user_id = "test_user_123"
        now = datetime.utcnow()
        
        await conn.execute("""
            INSERT INTO users (id, email, username, role, is_active, is_verified, 
                             first_name, last_name, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        """, user_id, "test@example.com", "testuser", "user", True, True,
        "Test", "User", now, now)
        
        print_status("✅ Usuario de prueba creado correctamente")
        await conn.close()
        return True
        
    except Exception as e:
        print_status(f"❌ Error al crear usuario de prueba: {e}", "ERROR")
        return False

async def test_user_lookup():
    """Probar búsqueda de usuario"""
    try:
        print_status("Probando búsqueda de usuario...")
        
        conn = await asyncpg.connect(**DATABASE_CONFIG)
        
        # Buscar usuario por ID
        user = await conn.fetchrow("SELECT * FROM users WHERE id = $1", "test_user_123")
        
        if user:
            print_status("✅ Usuario encontrado:")
            print_status(f"  - ID: {user['id']}")
            print_status(f"  - Email: {user['email']}")
            print_status(f"  - Username: {user['username']}")
            print_status(f"  - First Name: {user['first_name']}")
            print_status(f"  - Last Name: {user['last_name']}")
            print_status(f"  - Role: {user['role']}")
        else:
            print_status("❌ Usuario no encontrado", "ERROR")
            
        await conn.close()
        return user is not None
        
    except Exception as e:
        print_status(f"❌ Error al buscar usuario: {e}", "ERROR")
        return False

async def main():
    """Función principal de diagnóstico"""
    print_status("=== SMD VITAL - Debug de Problema de Usuario ===")
    
    # 1. Probar conexión a la base de datos
    if not await test_database_connection():
        print_status("No se puede continuar sin conexión a la base de datos", "ERROR")
        return False
    
    # 2. Probar JWT
    if not await test_jwt_token():
        print_status("Problema con JWT, pero continuando...", "WARNING")
    
    # 3. Crear usuario de prueba
    if not await create_test_user():
        print_status("No se pudo crear usuario de prueba", "ERROR")
        return False
    
    # 4. Probar búsqueda de usuario
    if not await test_user_lookup():
        print_status("No se pudo buscar usuario", "ERROR")
        return False
    
    print_status("=== Diagnóstico completado ===")
    print_status("Si todos los tests pasaron, el problema puede estar en:")
    print_status("1. El token JWT del frontend contiene un user_id inválido")
    print_status("2. El usuario no existe en la base de datos")
    print_status("3. Hay un problema de sincronización entre frontend y backend")
    
    return True

if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        exit(0 if success else 1)
    except KeyboardInterrupt:
        print_status("Operación cancelada por el usuario", "WARNING")
        exit(1)
    except Exception as e:
        print_status(f"Error inesperado: {e}", "ERROR")
        exit(1)

