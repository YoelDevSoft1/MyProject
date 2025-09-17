#!/usr/bin/env python3
"""
Script para hashear las contraseñas existentes en la base de datos
"""

import asyncio
import asyncpg
import bcrypt
import os

# Configuración de la base de datos
DATABASE_URL = 'postgresql://smdvital:smdvital_password_2024@postgres:5432/smdvital_users'

def hash_password(password: str) -> str:
    """Hashea la contraseña usando bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

async def fix_passwords():
    """Hashea todas las contraseñas en texto plano en la base de datos."""
    try:
        # Conectar a la base de datos
        conn = await asyncpg.connect(DATABASE_URL)
        
        # Obtener todos los usuarios con contraseñas en texto plano
        users = await conn.fetch("""
            SELECT id, email, password_hash 
            FROM users 
            WHERE password_hash IS NOT NULL 
            AND password_hash NOT LIKE '$2b$%'
        """)
        
        print(f"Encontrados {len(users)} usuarios con contraseñas en texto plano")
        
        # Hashear cada contraseña
        for user in users:
            user_id = user['id']
            email = user['email']
            plain_password = user['password_hash']
            
            # Hashear la contraseña
            hashed_password = hash_password(plain_password)
            
            # Actualizar en la base de datos
            await conn.execute("""
                UPDATE users 
                SET password_hash = $1 
                WHERE id = $2
            """, hashed_password, user_id)
            
            print(f"Contraseña hasheada para {email}")
        
        print("✅ Todas las contraseñas han sido hasheadas correctamente")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if 'conn' in locals():
            await conn.close()

if __name__ == "__main__":
    asyncio.run(fix_passwords())
