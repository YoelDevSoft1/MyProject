#!/usr/bin/env python3
"""
Script para actualizar la configuración de CORS en todos los servicios
"""

import os
import re

# Configuración de CORS actualizada
CORS_CONFIG = '''# CORS Middleware - Necesario para desarrollo directo
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:3003",
        "http://127.0.0.1:5173",
        "http://192.168.0.104:3000",
        "http://192.168.0.104:3001",
        "http://192.168.0.104:3002",
        "http://192.168.0.104:3003",
        "http://192.168.0.104:5173",
        "http://192.168.1.9:3000",
        "http://192.168.1.9:3001",
        "http://192.168.1.9:3002",
        "http://192.168.1.9:3003",
        "http://192.168.1.9:5173",
        "https://smdvitalbogota.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)'''

# Servicios a actualizar
services = [
    'appointments',
    'medical-records', 
    'notifications',
    'payments'
]

def update_cors_in_file(file_path):
    """Actualiza la configuración de CORS en un archivo"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Patrón para encontrar la configuración de CORS existente
        cors_pattern = r'# CORS Middleware.*?allow_headers=\["\*"\],\s*\)'
        
        # Reemplazar la configuración de CORS
        new_content = re.sub(cors_pattern, CORS_CONFIG, content, flags=re.DOTALL)
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✅ Actualizado: {file_path}")
            return True
        else:
            print(f"⚠️  No se encontró configuración CORS en: {file_path}")
            return False
            
    except Exception as e:
        print(f"❌ Error actualizando {file_path}: {e}")
        return False

def main():
    """Función principal"""
    print("🔄 Actualizando configuración de CORS en todos los servicios...")
    
    updated_count = 0
    
    # Actualizar cada servicio
    for service in services:
        file_path = f"services/{service}/main.py"
        if os.path.exists(file_path):
            if update_cors_in_file(file_path):
                updated_count += 1
        else:
            print(f"⚠️  Archivo no encontrado: {file_path}")
    
    print(f"\n✅ Proceso completado. {updated_count} archivos actualizados.")
    print("🔄 Reiniciando servicios...")

if __name__ == "__main__":
    main()


