@echo off
REM Script de démarrage pour ResumeSection (Windows)
REM Usage: start.bat

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   ResumeSection - Setup
echo ========================================
echo.

REM Check if running from root directory
if not exist "README.md" (
    echo ERROR: Veuillez executer ce script depuis le dossier racine du projet
    pause
    exit /b 1
)

REM Backend Setup
echo [1/2] Configuration du backend...
if not exist "backend\venv" (
    cd backend
    python -m venv venv
    call venv\Scripts\activate.bat
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    cd ..
    echo OK - Environnement backend cree
) else (
    echo OK - Environnement backend existant
)

REM Frontend Setup
echo.
echo [2/2] Configuration du frontend...
if not exist "frontend\node_modules" (
    cd frontend
    call npm install
    cd ..
    echo OK - Dependencies frontend installees
) else (
    echo OK - Dependencies frontend existantes
)

REM Completion message
echo.
echo ========================================
echo   Configuration terminee !
echo ========================================
echo.
echo Pour demarrer l'application, ouvrez DEUX invites de commande :
echo.
echo TERMINAL 1 (Backend):
echo   cd backend
echo   venv\Scripts\activate.bat
echo   python app.py
echo.
echo TERMINAL 2 (Frontend):
echo   cd frontend
echo   npm run dev
echo.
echo L'application sera disponible a:
echo   http://localhost:5173
echo.
echo Pour la premiere connexion:
echo   Username: admin
echo   Password: (que vous definissez)
echo.
pause
