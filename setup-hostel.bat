@echo off
REM THE BOYS HOSTEL - Quick Setup Script for Windows
REM This script helps you set up the hostel management system

echo.
echo ============================================
echo THE BOYS HOSTEL - Setup Script
echo ============================================
echo.

REM Check if .env exists
if exist ".env" (
    echo [OK] .env file already exists
) else (
    echo [CREATING] .env file...
    (
        echo # THE BOYS HOSTEL - Database Configuration
        echo DATABASE_URL=postgresql://postgres:LQwsyYAHyqKeXaubDhWfZWRNHaCIljYu@turntable.proxy.rlwy.net:25917/railway
        echo.
        echo # Node Environment
        echo NODE_ENV=development
        echo.
        echo # Session Secret
        echo SESSION_SECRET=your-secret-key-change-this-in-production
        echo.
        echo # Email Configuration
        echo RESEND_API_KEY=your-resend-api-key
        echo EMAIL_FROM=noreply@theboyshostel.com
        echo.
        echo # App Configuration
        echo APP_NAME=THE BOYS HOSTEL
        echo APP_URL=http://localhost:5000
        echo.
        echo # Port
        echo PORT=5000
    ) > .env
    echo [OK] .env file created
)

echo.
echo [INSTALLING] Dependencies...
call npm install

echo.
echo ============================================
echo DATABASE MIGRATION
echo ============================================
echo.
echo To run the database migration, use one of these options:
echo.
echo Option 1: Using psql (if installed)
echo   psql postgresql://postgres:LQwsyYAHyqKeXaubDhWfZWRNHaCIljYu@turntable.proxy.rlwy.net:25917/railway -f server/migrations/hostel_transformation.sql
echo.
echo Option 2: Using Railway CLI (if installed)
echo   railway run psql DATABASE_URL -f server/migrations/hostel_transformation.sql
echo.
echo Option 3: Manual - Copy SQL from server/migrations/hostel_transformation.sql
echo   and paste into Railway's database query interface
echo.
echo [WARNING] Please run the migration before starting the app!
echo.

set /p migration="Have you run the database migration? (y/n): "
if /i "%migration%"=="y" (
    echo.
    echo ============================================
    echo LOGO UPDATE REMINDER
    echo ============================================
    echo Don't forget to replace these logo files in client/public/:
    echo   - CalmKaaj_App_Icon.png
    echo   - CalmKaaj_Circular_Logo.png
    echo   - CalmKaaj_Orange_Logo.png
    echo   - ck-logo.png
    echo   - logo-main.png
    echo.
    echo [STARTING] Development server...
    call npm run dev
) else (
    echo.
    echo Please run the database migration first, then run:
    echo   npm run dev
    echo.
)

pause

