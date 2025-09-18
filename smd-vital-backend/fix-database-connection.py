#!/usr/bin/env python3
"""
SMD Vital - Script para diagnosticar y solucionar problemas de conexión a la base de datos
"""

import asyncio
import asyncpg
import os
import sys
import subprocess
import time
from datetime import datetime

# Configuración de la base de datos
DATABASE_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'smdvital',
    'user': 'smdvital',
    'password': 'smdvital_password_2024'
}

def print_status(message, status="INFO"):
    """Imprimir mensaje con timestamp y estado"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {status}: {message}")

def check_docker_status():
    """Verificar si Docker está ejecutándose"""
    try:
        result = subprocess.run(['docker', 'ps'], capture_output=True, text=True)
        if result.returncode == 0:
            print_status("Docker está ejecutándose correctamente")
            return True
        else:
            print_status("Docker no está ejecutándose", "ERROR")
            return False
    except FileNotFoundError:
        print_status("Docker no está instalado o no está en el PATH", "ERROR")
        return False

def check_postgres_container():
    """Verificar si el contenedor de PostgreSQL está ejecutándose"""
    try:
        result = subprocess.run(['docker', 'ps', '--filter', 'name=smd_vital_postgres'], 
                              capture_output=True, text=True)
        if 'smd_vital_postgres' in result.stdout:
            print_status("Contenedor de PostgreSQL está ejecutándose")
            return True
        else:
            print_status("Contenedor de PostgreSQL no está ejecutándose", "WARNING")
            return False
    except Exception as e:
        print_status(f"Error al verificar contenedor de PostgreSQL: {e}", "ERROR")
        return False

def start_postgres_container():
    """Iniciar el contenedor de PostgreSQL"""
    try:
        print_status("Iniciando contenedor de PostgreSQL...")
        result = subprocess.run(['docker-compose', '-f', 'docker-compose.simple.yml', 'up', '-d', 'postgres'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print_status("Contenedor de PostgreSQL iniciado correctamente")
            return True
        else:
            print_status(f"Error al iniciar PostgreSQL: {result.stderr}", "ERROR")
            return False
    except Exception as e:
        print_status(f"Error al ejecutar docker-compose: {e}", "ERROR")
        return False

async def test_database_connection():
    """Probar la conexión a la base de datos"""
    try:
        print_status("Probando conexión a la base de datos...")
        conn = await asyncpg.connect(**DATABASE_CONFIG)
        await conn.close()
        print_status("Conexión a la base de datos exitosa")
        return True
    except Exception as e:
        print_status(f"Error de conexión a la base de datos: {e}", "ERROR")
        return False

async def create_databases():
    """Crear las bases de datos necesarias"""
    try:
        print_status("Creando bases de datos...")
        
        # Conectar a la base de datos por defecto
        conn = await asyncpg.connect(
            host=DATABASE_CONFIG['host'],
            port=DATABASE_CONFIG['port'],
            database='postgres',  # Base de datos por defecto
            user=DATABASE_CONFIG['user'],
            password=DATABASE_CONFIG['password']
        )
        
        # Lista de bases de datos a crear
        databases = [
            'smdvital_auth',
            'smdvital_users', 
            'smdvital_appointments',
            'smdvital_medical_records',
            'smdvital_payments',
            'smdvital_notifications'
        ]
        
        for db_name in databases:
            try:
                await conn.execute(f'CREATE DATABASE {db_name};')
                print_status(f"Base de datos '{db_name}' creada")
            except asyncpg.DuplicateDatabaseError:
                print_status(f"Base de datos '{db_name}' ya existe")
        
        await conn.close()
        print_status("Bases de datos creadas correctamente")
        return True
        
    except Exception as e:
        print_status(f"Error al crear bases de datos: {e}", "ERROR")
        return False

def check_network_connectivity():
    """Verificar conectividad de red"""
    try:
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex((DATABASE_CONFIG['host'], DATABASE_CONFIG['port']))
        sock.close()
        
        if result == 0:
            print_status("Puerto 5432 está abierto y accesible")
            return True
        else:
            print_status("Puerto 5432 no está accesible", "WARNING")
            return False
    except Exception as e:
        print_status(f"Error al verificar conectividad: {e}", "ERROR")
        return False

async def main():
    """Función principal de diagnóstico y reparación"""
    print_status("=== SMD VITAL - Diagnóstico de Base de Datos ===")
    
    # 1. Verificar Docker
    if not check_docker_status():
        print_status("Por favor, instala e inicia Docker antes de continuar", "ERROR")
        return False
    
    # 2. Verificar contenedor de PostgreSQL
    if not check_postgres_container():
        print_status("Intentando iniciar contenedor de PostgreSQL...")
        if not start_postgres_container():
            print_status("No se pudo iniciar PostgreSQL. Verifica la configuración de Docker", "ERROR")
            return False
        
        # Esperar a que PostgreSQL esté listo
        print_status("Esperando a que PostgreSQL esté listo...")
        time.sleep(10)
    
    # 3. Verificar conectividad de red
    if not check_network_connectivity():
        print_status("Problema de conectividad de red. Verifica la configuración", "WARNING")
    
    # 4. Probar conexión a la base de datos
    if not await test_database_connection():
        print_status("Intentando crear bases de datos...")
        if not await create_databases():
            print_status("No se pudieron crear las bases de datos", "ERROR")
            return False
        
        # Probar conexión nuevamente
        if not await test_database_connection():
            print_status("Aún hay problemas de conexión después de crear las bases de datos", "ERROR")
            return False
    
    print_status("=== Diagnóstico completado exitosamente ===")
    print_status("La base de datos está funcionando correctamente")
    print_status("Puedes ahora iniciar los servicios del backend")
    
    return True

if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print_status("Operación cancelada por el usuario", "WARNING")
        sys.exit(1)
    except Exception as e:
        print_status(f"Error inesperado: {e}", "ERROR")
        sys.exit(1)

