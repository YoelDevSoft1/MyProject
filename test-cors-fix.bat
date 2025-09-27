@echo off
echo ========================================
echo   SMD VITAL - Testing CORS Fix
echo ========================================

echo.
echo 1. Testing backend health endpoint...
curl -X GET "http://localhost:8000/health" -H "accept: application/json"

echo.
echo.
echo 2. Testing backend root endpoint...
curl -X GET "http://localhost:8000/" -H "accept: application/json"

echo.
echo.
echo 3. Testing CORS preflight for /me endpoint...
curl -X OPTIONS "http://localhost:8000/me" ^
  -H "Origin: http://localhost:3001" ^
  -H "Access-Control-Request-Method: GET" ^
  -H "Access-Control-Request-Headers: authorization,content-type"

echo.
echo.
echo 4. Testing CORS preflight for /google endpoint...
curl -X OPTIONS "http://localhost:8000/google" ^
  -H "Origin: http://localhost:3001" ^
  -H "Access-Control-Request-Method: POST" ^
  -H "Access-Control-Request-Headers: authorization,content-type"

echo.
echo.
echo ========================================
echo   Test completed!
echo ========================================
pause
