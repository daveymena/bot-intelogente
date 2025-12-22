@echo off
chcp 65001 >nul
cls
echo ========================================
echo   SMART SALES BOT PRO
echo   Inicio Limpio del Sistema
echo ========================================
echo.

echo [Paso 1/4] Cerrando puertos ocupados...
echo.

REM Cerrar todos los procesos Node.js
taskkill /F /IM node.exe 2>nul >nul
timeout /t 1 /nobreak >nul

REM Cerrar puerto 3000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a 2>nul >nul
)

REM Cerrar puerto 4000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a 2>nul >nul
)

echo   ✓ Puertos liberados
echo.

echo [Paso 2/4] Verificando puertos...
netstat -ano | findstr ":3000 :4000" >nul
if %errorlevel% neq 0 (
    echo   ✓ Puertos 3000 y 4000 disponibles
) else (
    echo   ⚠️  Algunos puertos aún ocupados, reintentando...
    timeout /t 2 /nobreak >nul
    taskkill /F /IM node.exe 2>nul >nul
)
echo.

echo [Paso 3/4] Limpiando caché...
if exist .next\cache (
    rmdir /s /q .next\cache 2>nul
    echo   ✓ Caché limpiado
) else (
    echo   ✓ No hay caché para limpiar
)
echo.

echo [Paso 4/4] Iniciando servidor...
echo.
echo ========================================
echo   SERVIDOR INICIANDO
echo ========================================
echo.
echo Dashboard: http://localhost:3000
echo API: http://localhost:4000
echo.
echo Presiona Ctrl+C para detener
echo ========================================
echo.

npm run dev
