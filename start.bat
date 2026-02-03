@echo off
title Car Repair System

echo ========================================
echo   Car Repair System
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found
    echo.
    echo Please install Node.js first:
    echo 1. Visit https://nodejs.org/
    echo 2. Download and install LTS version
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo Node.js is installed
echo.

REM Go to script directory
cd /d "%~dp0"

REM Create necessary directories
if not exist "data" mkdir data
if not exist "photos" mkdir photos

REM Start server
echo Starting server...
echo Open in browser: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

node server-simple.js

echo.
echo ========================================
echo Server stopped
echo ========================================
pause
