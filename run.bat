@echo off
title Energya Cables 3D - Live Local Server
chcp 65001 >nul
echo ========================================================
echo   Starting Energya Cables 3D Local Server...
echo ========================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
