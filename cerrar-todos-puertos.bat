@echo off
echo ========================================
echo CERRANDO TODOS LOS PUERTOS DEL BOT
echo ========================================
echo.

echo Buscando procesos en puertos comunes...
echo.

REM Puerto 3000 (Next.js)
echo Cerrando puerto 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo Matando proceso %%a
    taskkill /F /PID %%a 2>nul
)

REM Puerto 4000 (Server alternativo)
echo Cerrando puerto 4000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4000') do (
    echo Matando proceso %%a
    taskkill /F /PID %%a 2>nul
)

REM Puerto 5000 (Posible servidor)
echo Cerrando puerto 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    echo Matando proceso %%a
    taskkill /F /PID %%a 2>nul
)

REM Puerto 8080 (Posible servidor)
echo Cerrando puerto 8080...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080') do (
    echo Matando proceso %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo Cerrando procesos de Node.js...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM nodemon.exe 2>nul

echo.
echo ========================================
echo PUERTOS CERRADOS
echo ========================================
echo.
echo Puedes iniciar el bot ahora con:
echo npm run dev
echo.
pause
