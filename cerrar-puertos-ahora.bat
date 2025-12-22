@echo off
echo ========================================
echo CERRANDO PUERTOS 3000 Y 4000
echo ========================================
echo.

echo [1/2] Buscando procesos en puerto 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Matando proceso %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo [2/2] Buscando procesos en puerto 4000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000') do (
    echo Matando proceso %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo ========================================
echo PUERTOS CERRADOS
echo ========================================
echo.
echo Puertos 3000 y 4000 liberados.
echo Ahora puedes iniciar el servidor con: npm run dev
echo.
pause
