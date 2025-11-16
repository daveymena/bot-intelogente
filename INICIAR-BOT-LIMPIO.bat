@echo off
echo ========================================
echo   INICIANDO BOT (MODO LIMPIO)
echo ========================================
echo.

echo [1/2] Cerrando puerto 4000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000 ^| findstr LISTENING') do (
    echo Cerrando proceso %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo [OK] Puerto liberado
echo.

echo [2/2] Esperando 2 segundos...
timeout /t 2 /nobreak >nul

echo.
echo [OK] Iniciando bot...
echo ========================================
echo.

npm run dev
