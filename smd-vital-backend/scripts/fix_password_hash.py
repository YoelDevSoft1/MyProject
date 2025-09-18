#!/usr/bin/env python3
"""
Script para corregir el hash de la contraseña en la base de datos
"""

import bcrypt
import asyncio
import asyncpg

async def fix_password_hash():
    # Conectar a la base de datos
    conn = await asyncpg.connect(
        host='localhost',
        port=5432,
        user='smdvital',
        password='smdvital_password_2024',
        database='smdvital'
    )
    
    try:
        # Generar hash correcto para la contraseña 'test123'
        password = 'test123'
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        
        print(f"Hash generado: {hashed}")
        
        # Actualizar el usuario de prueba
        await conn.execute("""
            UPDATE users 
            SET password_hash = $1 
            WHERE email = 'test@smdvital.com'
        """, hashed)
        
        print("Hash actualizado en la base de datos")
        
        # Verificar que se actualizó
        result = await conn.fetchrow("""
            SELECT email, password_hash 
            FROM users 
            WHERE email = 'test@smdvital.com'
        """)
        
        print(f"Usuario actualizado: {result['email']}")
        print(f"Nuevo hash: {result['password_hash']}")
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(fix_password_hash())
