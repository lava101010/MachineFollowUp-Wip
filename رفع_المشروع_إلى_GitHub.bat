@echo off
title Energya Cables 3D - GitHub Deploy Tool
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0push_to_github.ps1"
