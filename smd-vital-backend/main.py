"""
SMD Vital Backend - Main Entry Point
====================================
Punto de entrada principal para el backend de SMD Vital.
Redirige al servicio de autenticación.
"""

import sys
import os
from pathlib import Path

# Agregar el directorio de servicios al path
services_path = Path(__file__).parent / "services"
sys.path.insert(0, str(services_path))

# Importar y ejecutar el servicio de autenticación
from auth.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
