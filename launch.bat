@echo off
title Car Repair System Launcher

echo ========================================
echo   Car Repair System
echo   汽车维修管理系统
echo ========================================
echo.

rem Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found
    echo.
    echo Please install Node.js:
    echo 1. Visit https://nodejs.org/
    echo 2. Download and install LTS version
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js is installed
echo.

rem Go to script directory
cd /d "%~dp0"

rem Create directories
if not exist "data" mkdir data
if not exist "photos" mkdir photos

rem Start server
echo ========================================
echo Starting server...
echo Open browser: http://localhost:3000
echo.
echo Press Ctrl+C to stop server
echo ========================================
echo.

node server-simple.js

echo.
echo ========================================
echo Server stopped
echo ========================================
pause
