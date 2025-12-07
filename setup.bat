@echo off
REM KoolITs POS - Automated Setup Script for Windows
REM This script automates the installation and setup process

echo.
echo ===================================================
echo.
echo           KoolITs POS - Setup Script            
echo.
echo ===================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo npm version:
npm --version
echo.

REM Check if we're in the right directory
if not exist package.json (
    echo ERROR: package.json not found
    echo Please run this script from the koolits-pos-react directory
    pause
    exit /b 1
)

echo Installing dependencies...
echo This may take a few minutes...
echo.

call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Dependencies installed successfully!
    echo.
) else (
    echo.
    echo Failed to install dependencies
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    if exist .env.example (
        copy .env.example .env >nul
    ) else (
        echo VITE_API_URL=https://backend-vert-delta-99.vercel.app/api > .env
    )
    echo .env file created
    echo.
)

echo ===================================================
echo.
echo              Setup Complete! 🎉                  
echo.
echo ===================================================
echo.
echo Quick Start Commands:
echo.
echo   Start Development Server:
echo   npm run dev
echo.
echo   Build for Production:
echo   npm run build
echo.
echo   Deploy to Vercel:
echo   vercel
echo.
echo Documentation:
echo   - QUICKSTART.md  - Get started in 5 minutes
echo   - README.md      - Full documentation
echo   - DEPLOYMENT.md  - Deployment guide
echo.
echo Default Login Credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo IMPORTANT:
echo   Make sure the backend API has the admin account created.
echo   Send POST request to: /api/auth/setup
echo.
echo Need help? Check the documentation files above!
echo.

pause
