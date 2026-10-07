@echo off
echo ======================================================
echo   Starting Full-Stack Student Management System
echo ======================================================
echo.

echo 1. Starting Backend API Server (Port 5000)...
start "Backend API Server" cmd /k "cd /d "%~dp0backend" && npm.cmd start"

timeout /t 2 /nobreak >nul

echo 2. Starting Frontend Vite Server (Port 5173)...
start "Frontend Vite Server" cmd /k "cd /d "%~dp0frontend" && npm.cmd run dev"

echo.
echo ======================================================
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:5173
echo   MongoDB:  mongodb://127.0.0.1:27017/student_manage_sys
echo ======================================================
echo.
pause
