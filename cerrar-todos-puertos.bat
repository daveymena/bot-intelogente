@echo off
chcp 65001 >nul
cls

echo ═══════════════════════════════════════════════════════════════════════════════
echo 🔴 CERRAR PROCESOS EN PUERTOS COMUNES
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
echo Este script cerrará procesos en los siguientes puertos:
echo   - Puerto 3000 (Next.js default)
echo   - Puerto 4000 (Tu bot)
echo   - Puerto 5000 (Otros servicios)
echo.
pause
echo.

REM Puerto 3000
echo 🔍 Buscando proceso en puerto 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo ✅ Encontrado PID: %%a
    taskkill /F /PID %%a 2>nul
    if errorlevel 1 (
        echo ⚠️  No se pudo cerrar
    ) else (
        echo ✅ Cerrado exitosamente
    )
)

echo.

REM Puerto 4000
echo 🔍 Buscando proceso en puerto 4000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000 ^| findstr LISTENING') do (
    echo ✅ Encontrado PID: %%a
    taskkill /F /PID %%a 2>nul
    if errorlevel 1 (
        echo ⚠️  No se pudo cerrar
    ) else (
        echo ✅ Cerrado exitosamente
    )
)

echo.

REM Puerto 5000
echo 🔍 Buscando proceso en puerto 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo ✅ Encontrado PID: %%a
    taskkill /F /PID %%a 2>nul
    if errorlevel 1 (
        echo ⚠️  No se pudo cerrar
    ) else (
        echo ✅ Cerrado exitosamente
    )
)

echo.
echo ═══════════════════════════════════════════════════════════════════════════════
echo ✅ Proceso completado
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
echo Ahora puedes iniciar tu bot con: npm run dev
echo.
pause
