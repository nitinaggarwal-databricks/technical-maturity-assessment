@echo off
REM CoP Portal - Local Setup Script (Windows)
REM This script sets up and launches the entire application locally

echo ==========================================
echo   CoP Portal - Local Setup
echo ==========================================
echo.

REM Check prerequisites
echo Checking prerequisites...

where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is required but not installed. Please install Docker Desktop.
    exit /b 1
)

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is required but not installed. Please install Node.js 18+.
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is required but not installed.
    exit /b 1
)

echo [OK] All prerequisites met
echo.

REM Start PostgreSQL
echo Starting PostgreSQL database...
docker compose up -d db

REM Wait for database
echo Waiting for database to be ready...
timeout /t 5 /nobreak >nul

echo [OK] Database is ready
echo.

REM Backend setup
echo Setting up backend...
cd backend

if not exist "node_modules\" (
    echo    Installing backend dependencies...
    call npm install
) else (
    echo    Dependencies already installed
)

echo    Generating Prisma client...
call npm run prisma:generate

echo    Running database migrations...
call npm run prisma:migrate

echo    Seeding database...
call npm run prisma:seed

echo [OK] Backend setup complete
echo.

REM Frontend setup
echo Setting up frontend...
cd ..\frontend

if not exist "node_modules\" (
    echo    Installing frontend dependencies...
    call npm install
) else (
    echo    Dependencies already installed
)

echo [OK] Frontend setup complete
echo.

cd ..

REM All done
echo.
echo ==========================================
echo   Setup Complete!
echo ==========================================
echo.
echo To start the application:
echo.
echo    Terminal 1 - Backend:
echo    cd backend ^&^& npm run start:dev
echo.
echo    Terminal 2 - Frontend:
echo    cd frontend ^&^& npm run dev
echo.
echo Then open: http://localhost:3000
echo.
echo ==========================================
pause


