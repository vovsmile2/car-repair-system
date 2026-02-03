@echo off
setlocal enabledelayedexpansion

REM Use Windows code page 936 (GBK) for Chinese display
chcp 936 >nul
title 汽车维修管理系统

cls
echo ========================================
echo.
echo [ Car Repair System ]
echo [ 汽车维修管理系统 ]
echo.
echo ========================================
echo.

REM 检查Node.js是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] 错误: 未检测到Node.js
    echo.
    echo 请先安装Node.js:
    echo   1. 访问 https://nodejs.org/
    echo   2. 下载并安装 LTS 版本
    echo   3. 重新运行此脚本
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js 已安装
echo.

REM 进入脚本所在目录
cd /d "%~dp0"

REM 创建必要的目录
if not exist "data" mkdir data
if not exist "photos" mkdir photos

REM 启动服务器
echo [INFO] 正在启动服务器...
echo [INFO] 请在浏览器打开: http://localhost:3000
echo.
echo [TIP] 按 Ctrl+C 可以停止服务器
echo.
echo ========================================
echo.

node server-simple.js

echo.
echo ========================================
echo [INFO] 服务器已停止
echo ========================================
pause
