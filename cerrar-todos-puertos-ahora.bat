@echo off
echo ========================================
echo CERRAR TODOS LOS PUERTOS
echo ========================================
echo.
echo Cerrando puertos: 3000, 4000, 5000
echo.

echo Buscando procesos en puerto 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo Matando proceso %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo Buscando procesos en puerto 4000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4000') do (
    echo Matando proceso %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo Buscando procesos en puerto 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    echo Matando proceso %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo Buscando procesos de Node.js...
taskkill /F /IM node.exe 2>nul

echo.
echo ========================================
echo Puertos cerrados
echo ========================================
echo.
echo Ahora puedes iniciar el servidor limpio:
echo npm run dev
echo.
pause
