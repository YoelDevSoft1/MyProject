@echo off
echo ========================================
echo   SMD VITAL - Starting Auth Service
echo ========================================

cd "smd-vital-backend\services\auth"

echo Installing dependencies...
pip install fastapi uvicorn pydantic email-validator python-multipart PyJWT bcrypt

echo Starting Auth Service (Simplified) on port 8000...
python main_simple.py

pause
