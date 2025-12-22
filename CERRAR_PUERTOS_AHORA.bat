@echo off
chcp 65001 >nul
echo ========================================
echo   CERRANDO PUERTOS OCUPADOS
echo ========================================
echo.

REM Cerrar puerto 3000
echo [1/3] Cerrando puerto 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo   └─ Proceso encontrado: %%a
    taskkill /F /PID %%a 2>nul
)

REM Cerrar puerto 4000
echo.
echo [2/3] Cerrando puerto 4000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4000 ^| findstr LISTENING') do (
    echo   └─ Proceso encontrado: %%a
    taskkill /F /PID %%a 2>nul
)

REM Cerrar todos los procesos Node.js
echo.
echo [3/3] Cerrando procesos Node.js...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo   └─ ✓ Procesos Node.js cerrados
) else (
    echo   └─ No hay procesos Node.js activos
)

echo.
echo ========================================
echo   ✓ PUERTOS LIBERADOS
echo ========================================
echo.
echo Esperando 2 segundos...
timeout /t 2 /nobreak >nul

echo.
echo Verificando puertos...
netstat -ano | findstr ":3000 :4000"
if %errorlevel% neq 0 (
    echo   └─ ✓ Puertos libres
)

echo.
echo ========================================
echo   LISTO PARA INICIAR
echo ========================================
echo.
echo Ejecuta: npm run dev
echo.
pause
