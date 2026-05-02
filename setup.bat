@echo off
REM LocalEats - Quick Start Setup Script for Windows

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         LocalEats - Quick Start Setup                         ║
echo ║     Zero Commission Food Delivery for Kahalgaon              ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Node.js is not installed. Please install from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js version:
node --version
echo ✓ npm version:
npm --version
echo.

REM Setup Backend
echo 📦 Setting up Backend...
cd local-eats-server

if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo ⚠️  Please edit .env with your credentials
    echo.
)

echo Installing backend dependencies...
call npm install

echo ✓ Backend setup complete!
echo.

REM Setup Frontend
echo 📦 Setting up Frontend...
cd ..\local-eats-client

if not exist ".env.local" (
    echo Creating .env.local file...
    copy .env.example .env.local
    echo ⚠️  Please edit .env.local with your API URL and tokens
    echo.
)

echo Installing frontend dependencies...
call npm install

echo ✓ Frontend setup complete!
echo.

REM Final instructions
echo ╔════════════════════════════════════════════════════════════════╗
echo ✓ Setup Complete!
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 📝 Next Steps:
echo.
echo 1. Configure Environment Variables:
echo    - Backend: Edit local-eats-server\.env
echo    - Frontend: Edit local-eats-client\.env.local
echo.
echo 2. Start Backend:
echo    cd local-eats-server
echo    npm run dev
echo.
echo 3. Start Frontend (in a new terminal):
echo    cd local-eats-client
echo    npm run dev
echo.
echo 4. Open http://localhost:3000 in your browser
echo.
echo 🆘 Need Help?
echo    Email: support@localeatskahalgaon.com
echo.
pause
