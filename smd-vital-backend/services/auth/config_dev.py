# SMD Vital Auth Service - Development Configuration
# ================================================

import os

# Database Configuration (usando SQLite para desarrollo simple)
DATABASE_URL = "sqlite:///./smd_vital_dev.db"

# JWT Configuration
JWT_SECRET = "smd_vital_dev_secret_key_2024"
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 horas

# CORS Configuration
CORS_ORIGINS = ["http://localhost:3000", "http://localhost:3001"]

# Development Settings
DEBUG = True
ENVIRONMENT = "development"

# Google OAuth (opcional para desarrollo)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
