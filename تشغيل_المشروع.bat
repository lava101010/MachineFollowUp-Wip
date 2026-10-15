@echo off
title Energya Cables 3D - Live Local Server
chcp 65001 >nul
echo ========================================================
echo   جاري تشغيل خادم محلي لمصنع إنيرجيا للكابلات 3D...
echo ========================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
