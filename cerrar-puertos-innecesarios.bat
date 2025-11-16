@echo off
REM Cerrar puertos innecesarios y mantener solo entrenamiento y tests

setlocal enabledelayedexpansion

echo.
echo ========================================================================
echo CIERRE DE PUERTOS INNECESARIOS
echo ========================================================================
echo.
echo Este script cerrará procesos Node innecesarios
echo Mantendrá solo: Entrenamiento y Tests
echo.

REM Mostrar procesos actuales
echo Procesos Node actuales:
tasklist | findstr /i "node"

echo.
echo ========================================================================
echo SELECCIONA QUE DESEAS HACER
echo ========================================================================
echo.
echo 1. Ver puertos activos
echo 2. Cerrar TODOS los procesos Node
echo 3. Cerrar puerto específico
echo 4. Mantener solo puerto 4000 (Bot Local)
echo 5. Salir
echo.

set /p opcion="Selecciona una opción (1-5): "

if "%opcion%"=="1" goto ver_puertos
if "%opcion%"=="2" goto cerrar_todos
if "%opcion%"=="3" goto cerrar_especifico
if "%opcion%"=="4" goto mantener_4000
if "%opcion%"=="5" goto salir

echo Opción inválida
goto fin

:ver_puertos
echo.
echo ========================================================================
echo PUERTOS ACTIVOS
echo ========================================================================
echo.
netstat -ano | findstr "LISTENING"
echo.
echo Descripción de puertos:
echo   3000  - Next.js Dev Server
echo   4000  - Bot Local / API
echo   5432  - PostgreSQL
echo   8000  - Ollama
echo.
pause
goto fin

:cerrar_todos
echo.
echo ========================================================================
echo CERRANDO TODOS LOS PROCESOS NODE
echo ========================================================================
echo.
taskkill /F /IM node.exe
if %errorlevel% equ 0 (
    echo ✓ Procesos Node cerrados
) else (
    echo ✗ No hay procesos Node activos
)
echo.
pause
goto fin

:cerrar_especifico
echo.
echo ========================================================================
echo CERRAR PUERTO ESPECÍFICO
echo ========================================================================
echo.
set /p puerto="Ingresa el número de puerto a cerrar: "

echo.
echo Buscando proceso en puerto %puerto%...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%puerto%') do (
    set pid=%%a
)

if defined pid (
    echo Encontrado PID: %pid%
    echo Cerrando proceso...
    taskkill /PID %pid% /F
    if %errorlevel% equ 0 (
        echo ✓ Puerto %puerto% cerrado
    ) else (
        echo ✗ Error al cerrar puerto
    )
) else (
    echo ✗ No se encontró proceso en puerto %puerto%
)
echo.
pause
goto fin

:mantener_4000
echo.
echo ========================================================================
echo MANTENER SOLO PUERTO 4000 (BOT LOCAL)
echo ========================================================================
echo.
echo Cerrando otros procesos Node...
echo.

REM Obtener todos los PIDs de Node
for /f "tokens=2" %%a in ('tasklist ^| findstr node') do (
    set pid=%%a
    REM Verificar si el proceso está en puerto 4000
    netstat -ano | findstr %pid% | findstr :4000 >nul
    if %errorlevel% neq 0 (
        echo Cerrando PID: %pid%
        taskkill /PID %pid% /F >nul 2>&1
    )
)

echo.
echo ✓ Procesos innecesarios cerrados
echo ✓ Puerto 4000 (Bot Local) mantenido
echo.
pause
goto fin

:salir
echo.
echo Saliendo...
echo.
exit /b 0

:fin
echo.
echo ========================================================================
echo ESTADO ACTUAL
echo ========================================================================
echo.
echo Procesos Node activos:
tasklist | findstr /i "node"
echo.
echo Puertos en uso:
netstat -ano | findstr "LISTENING" | findstr "3000\|4000\|5432\|8000"
echo.
pause
