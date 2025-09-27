"""
SMD VITAL - Health Metrics Service
==================================
Servicio específico para métricas de salud usando SQLAlchemy síncrono
"""

import uvicorn
from health_metrics import app

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8007)


