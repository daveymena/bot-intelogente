@echo off
echo.
echo ========================================
echo   REINICIO LIMPIO DEL SERVIDOR
echo ========================================
echo.

echo 1. Cerrando puerto 4000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4000') do (
    echo    Cerrando proceso %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo 2. Cerrando puerto 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo    Cerrando proceso %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo 3. Cerrando procesos Node.js...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM tsx.exe 2>nul

echo.
echo ========================================
echo   PUERTOS LIBERADOS
echo ========================================
echo.
echo Iniciando servidor en 3 segundos...
timeout /t 3 /nobreak >nul

echo.
npm run dev
