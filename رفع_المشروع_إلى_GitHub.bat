@echo off
title Energya Cables 3D - GitHub Deploy Tool
chcp 65001 >nul
echo ========================================================
echo   Energya Cables 3D - رفع المشروع إلى GitHub و GitHub Pages
echo ========================================================
echo.

set "PATH=%PATH%;C:\Program Files\Git\cmd;C:\Program Files\Git\bin;%LOCALAPPDATA%\Programs\Git\cmd"

git --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] Git غير متاح حاليا في الـ PATH.
    echo يمكنك سحب وإفلات مجلد المشروع مباشرة على GitHub عبر المتصفح.
    pause
    exit /b
)

echo [1/4] تهيئة مستودع Git...
if not exist ".git" (
    git init
    git branch -M main
)

echo [2/4] إضافة الملفات المحدثة...
git add -A

echo [3/4] إنشاء التحديث (Commit)...
git commit -m "Update: Remove MC machines, set KM default unit, and prepare for GitHub Pages"

echo.
echo ========================================================
echo أدخل رابط المستودع الخاص بك على GitHub
echo مثال: https://github.com/iva101010/energya-cables-3d.git
echo ========================================================
set /p REPO_URL="رابط الـ Repository (اضغط Enter للتخطي إذا كان مربوطاً مسبقاً): "

if not "%REPO_URL%"=="" (
    git remote remove origin >nul 2>&1
    git remote add origin %REPO_URL%
)

echo.
echo [4/4] جاري رفع التحديثات إلى GitHub...
git push -u origin main

echo.
echo ========================================================
echo   تم بنجاح!
echo   لتفعيل رابط الموقع المباشر (GitHub Pages):
echo   1. ادخل على صفحة المستودع في GitHub
echo   2. اذهب إلى Settings ثم Pages
echo   3. من قسم Build and deployment:
echo      اختر Source: Deploy from a branch
echo      واختر Branch: main وبجانبه: / (root)
echo   4. اضغط Save
echo   خلال دقيقة سيظهر الرابط في الأعلى:
echo   https://iva101010.github.io/اسم-المستودع/
echo ========================================================
pause
