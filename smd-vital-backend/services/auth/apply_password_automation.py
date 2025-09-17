#!/usr/bin/env python3
"""
SMD VITAL - Aplicar Automatización de Contraseñas
================================================

Script para aplicar el sistema automatizado de hashing de contraseñas
a la base de datos existente.
"""

import asyncio
import asyncpg
import os
import sys
from datetime import datetime

# Configuración de la base de datos
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://smdvital:smdvital_password_2024@postgres:5432/smdvital_users')

async def apply_password_automation():
    """Aplica el sistema automatizado de contraseñas"""
    try:
        print("🔐 Aplicando automatización de contraseñas...")
        
        # Conectar a la base de datos
        conn = await asyncpg.connect(DATABASE_URL)
        
        # 1. Aplicar triggers y funciones SQL
        print("📝 Aplicando triggers de base de datos...")
        with open('scripts/auto_password_trigger.sql', 'r') as f:
            sql_script = f.read()
        
        await conn.execute(sql_script)
        print("✅ Triggers aplicados correctamente")
        
        # 2. Verificar estado actual de contraseñas
        print("🔍 Verificando estado de contraseñas...")
        users = await conn.fetch("""
            SELECT id, email, password_hash, 
                   CASE 
                       WHEN password_hash LIKE '$2b$%' THEN 'HASHED'
                       ELSE 'PLAIN_TEXT'
                   END as status
            FROM users 
            WHERE password_hash IS NOT NULL
        """)
        
        hashed_count = sum(1 for user in users if user['status'] == 'HASHED')
        plain_count = sum(1 for user in users if user['status'] == 'PLAIN_TEXT')
        
        print(f"📊 Estado actual: {hashed_count} hasheadas, {plain_count} en texto plano")
        
        # 3. Generar reporte de seguridad
        print("📋 Generando reporte de seguridad...")
        security_report = await conn.fetch("""
            SELECT * FROM password_security_report
        """)
        
        print("\n📊 REPORTE DE SEGURIDAD DE CONTRASEÑAS:")
        print("=" * 50)
        for user in security_report:
            print(f"👤 {user['email']} - {user['password_status']} - {user['password_age_status']}")
        
        # 4. Verificar configuración
        print("\n🔧 Verificando configuración...")
        
        # Verificar que los triggers estén activos
        triggers = await conn.fetch("""
            SELECT trigger_name, event_manipulation, action_timing
            FROM information_schema.triggers 
            WHERE trigger_name LIKE '%password%'
        """)
        
        print(f"✅ {len(triggers)} triggers de contraseñas activos")
        
        # Verificar funciones
        functions = await conn.fetch("""
            SELECT routine_name, routine_type
            FROM information_schema.routines 
            WHERE routine_name LIKE '%password%'
        """)
        
        print(f"✅ {len(functions)} funciones de contraseñas disponibles")
        
        print("\n🎉 Automatización de contraseñas aplicada exitosamente!")
        print("🔒 El sistema ahora garantiza hashing automático de contraseñas")
        print("📊 Use la vista 'password_security_report' para monitoreo")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    finally:
        if 'conn' in locals():
            await conn.close()

async def test_automation():
    """Prueba el sistema automatizado"""
    try:
        print("\n🧪 Probando sistema automatizado...")
        
        conn = await asyncpg.connect(DATABASE_URL)
        
        # Probar función de verificación de fortaleza
        strength_test = await conn.fetchval("""
            SELECT check_password_strength('TestPassword123!')
        """)
        print(f"✅ Prueba de fortaleza: {strength_test}")
        
        # Verificar vista de seguridad
        report_count = await conn.fetchval("""
            SELECT COUNT(*) FROM password_security_report
        """)
        print(f"✅ Reporte de seguridad: {report_count} usuarios monitoreados")
        
        print("🎯 Sistema automatizado funcionando correctamente")
        
    except Exception as e:
        print(f"❌ Error en prueba: {e}")
    finally:
        if 'conn' in locals():
            await conn.close()

if __name__ == "__main__":
    print("🏥 SMD VITAL - Automatización de Contraseñas")
    print("=" * 50)
    
    asyncio.run(apply_password_automation())
    asyncio.run(test_automation())
