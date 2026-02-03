# Car Repair System Launcher - PowerShell Script
# 汽车维修管理系统启动脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan
Write-Host "  Car Repair System" -ForegroundColor Cyan
Write-Host "  汽车维修管理系统" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue

if (-not $nodeInstalled) {
    Write-Host "[ERROR] Node.js not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js:" -ForegroundColor Yellow
    Write-Host "1. Visit https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "2. Download and install LTS version" -ForegroundColor Yellow
    Write-Host "3. Run this script again" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[OK] Node.js is installed" -ForegroundColor Green
Write-Host ""

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Create directories
if (-not (Test-Path "data")) {
    New-Item -ItemType Directory -Path "data" | Out-Null
}

if (-not (Test-Path "photos")) {
    New-Item -ItemType Directory -Path "photos" | Out-Null
}

# Start server
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting server..." -ForegroundColor Cyan
Write-Host "Open browser: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    node server-simple.js
} finally {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Server stopped" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Read-Host "Press Enter to exit"
}
