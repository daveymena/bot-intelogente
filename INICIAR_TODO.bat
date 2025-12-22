@echo off
chcp 65001 >nul
cls

REM Cerrar todos los procesos Node.js
taskkill /F /IM node.exe 2>nul >nul
timeout /t 1 /nobreak >nul

REM Cerrar puertos específicos
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul >nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul >nul

timeout /t 2 /nobreak >nul

echo Iniciando servidor...
npm run dev
