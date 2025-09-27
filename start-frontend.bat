@echo off
echo ========================================
echo   SMD VITAL - Starting Frontend
echo ========================================

cd "horizon-ui-chakra-main"

echo Installing dependencies...
npm install

echo Starting Frontend on port 3001...
npm start

pause
