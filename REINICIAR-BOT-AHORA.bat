@echo off
echo ========================================
echo   REINICIANDO BOT DE WHATSAPP
echo ========================================
echo.

echo [1/3] Deteniendo procesos en puertos 3000 y 4000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000') do taskkill /F /PID %%a 2>nul
timeout /t 2 /nobreak >nul

echo [2/3] Limpiando cache de Node...
if exist .next rmdir /s /q .next 2>nul
timeout /t 1 /nobreak >nul

echo [3/3] Iniciando servidor...
echo.
echo ========================================
echo   SERVIDOR INICIANDO...
echo   Espera a ver: "Ready in X.Xs"
echo ========================================
echo.

npm run dev
