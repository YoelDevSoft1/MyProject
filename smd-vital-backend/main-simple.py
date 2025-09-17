"""
SMD Vital Backend - Simple Main for Debugging
============================================
Versión simplificada para debugging en RENDER.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Crear la aplicación FastAPI
app = FastAPI(
    title="SMD Vital API",
    description="API para el sistema médico digital SMD Vital",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios exactos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "SMD Vital API está funcionando!",
        "status": "success",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "smd-vital-backend",
        "version": "1.0.0"
    }

@app.get("/test")
async def test_endpoint():
    return {
        "message": "Endpoint de prueba funcionando",
        "database_url": "configured" if os.getenv("DATABASE_URL") else "not_configured"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
