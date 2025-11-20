@echo off
echo.
echo ========================================
echo   CERRANDO PUERTO 4000
echo ========================================
echo.

echo Buscando procesos en puerto 4000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4000') do (
    echo Proceso encontrado: %%a
    taskkill /F /PID %%a
)

echo.
echo ========================================
echo   PUERTO 4000 LIBERADO
echo ========================================
echo.
pause
