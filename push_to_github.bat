@echo off
echo ========================================
echo BUERNIX TECH - GitHub Push Script
echo ========================================
echo.

cd /d "c:\Users\mathi\Downloads\BUERNIX_TECH"

echo [1/7] Configuring Git user...
git config --global user.name "Buermat"
git config --global user.email "mathias@buernix.com"

echo [2/7] Initializing Git repository...
git init

echo [3/7] Adding all files...
git add .

echo [4/7] Creating initial commit...
git commit -m "Initial commit: BUERNIX TECH Platform v1.0 - Complete Admin Panel + Public Website"

echo [5/7] Adding remote repository...
git remote add origin https://github.com/Buermat/BUERNIX_TECH.git

echo [6/7] Renaming branch to main...
git branch -M main

echo [7/7] Pushing to GitHub...
git push -u origin main --force

echo.
echo ========================================
echo SUCCESS! Code pushed to GitHub
echo Repository: https://github.com/Buermat/BUERNIX_TECH
echo ========================================
echo.
pause
