@echo off
title Expense Tracker

echo Starting Expense Tracker...

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

start "Backend"  powershell -NoExit -Command "cd '%~dp0backend';  dotnet run"
start "Frontend" powershell -NoExit -Command "cd '%~dp0frontend'; npm start"

timeout /t 8 /nobreak > nul
start http://localhost:4200
