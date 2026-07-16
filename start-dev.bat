@echo off
REM NyxBeacon Startup Script
REM This script starts the backend server and frontend client

echo.
echo ╔════════════════════════════════════════════════╗
echo ║  NyxBeacon Hospital Bed Board System           ║
echo ║  Starting Development Servers...                ║
echo ╚════════════════════════════════════════════════╝
echo.

REM Check if PostgreSQL database is configured
echo Checking database connection...
node packages\server\node_modules\.bin\node -e "require('dotenv').config(); console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Configured' : '✗ Missing');"

echo.
echo Starting servers in 3 seconds...
echo.
timeout /t 3 /nobreak

REM Start both servers concurrently
cd packages\client
start "NyxBeacon Frontend" npm run dev

cd ..\server
start "NyxBeacon Backend" npm run dev

cd ..\..

echo.
echo ╔════════════════════════════════════════════════╗
echo ║  Servers Starting...                           ║
echo ║                                                ║
echo ║  Frontend: http://localhost:5173               ║
echo ║  Backend:  http://localhost:3000               ║
echo ║  Health:   http://localhost:3000/health        ║
echo ║                                                ║
echo ║  Close these windows to stop the servers.      ║
echo ╚════════════════════════════════════════════════╝
echo.

pause
