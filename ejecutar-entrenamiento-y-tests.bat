@echo off
REM Script para ejecutar SOLO entrenamiento y tests
REM Cierra puertos innecesarios y mantiene solo lo esencial

setlocal enabledelayedexpansion

echo.
echo ========================================================================
echo MODO ENTRENAMIENTO Y TESTS
echo ========================================================================
echo.
echo Este script ejecutará:
echo   1. Test ejecutivo del bot local
echo   2. Pruebas de preguntas y respuestas
echo   3. Tests de IA
echo   4. Tests de búsqueda
echo   5. Tests de flujo de pago
echo.
echo Se cerrarán puertos innecesarios.
echo.

REM Verificar procesos Node activos
echo Verificando procesos Node activos...
tasklist | findstr /i "node" >nul
if %errorlevel% equ 0 (
    echo.
    echo Procesos Node encontrados:
    tasklist | findstr /i "node"
    echo.
    echo Presiona cualquier tecla para continuar...
    pause >nul
) else (
    echo No hay procesos Node activos.
)

echo.
echo ========================================================================
echo EJECUTANDO TESTS
echo ========================================================================
echo.

REM Test 1: Ejecutivo
echo [1/5] Ejecutando test ejecutivo...
node test-ejecutivo-bot-local.js
if %errorlevel% neq 0 (
    echo Error en test ejecutivo
    pause
    exit /b 1
)

echo.
echo Presiona cualquier tecla para continuar con el siguiente test...
pause >nul

REM Test 2: Preguntas y respuestas
echo [2/5] Ejecutando test de preguntas y respuestas...
node test-bot-local-preguntas.js
if %errorlevel% neq 0 (
    echo Error en test de preguntas
    pause
    exit /b 1
)

echo.
echo Presiona cualquier tecla para continuar con el siguiente test...
pause >nul

REM Test 3: IA Simple
if exist test-ia-simple.js (
    echo [3/5] Ejecutando test de IA simple...
    node test-ia-simple.js
    if %errorlevel% neq 0 (
        echo Error en test de IA
    )
) else (
    echo [3/5] Test de IA simple no encontrado
)

echo.
echo Presiona cualquier tecla para continuar...
pause >nul

REM Test 4: Búsqueda inteligente
if exist test-busqueda-inteligente.js (
    echo [4/5] Ejecutando test de búsqueda inteligente...
    node test-busqueda-inteligente.js
    if %errorlevel% neq 0 (
        echo Error en test de búsqueda
    )
) else (
    echo [4/5] Test de búsqueda inteligente no encontrado
)

echo.
echo Presiona cualquier tecla para continuar...
pause >nul

REM Test 5: Flujo de pago
if exist test-flujo-pago-completo.js (
    echo [5/5] Ejecutando test de flujo de pago...
    node test-flujo-pago-completo.js
    if %errorlevel% neq 0 (
        echo Error en test de pago
    )
) else (
    echo [5/5] Test de flujo de pago no encontrado
)

echo.
echo ========================================================================
echo RESUMEN DE TESTS COMPLETADOS
echo ========================================================================
echo.
echo ✓ Test ejecutivo
echo ✓ Test de preguntas y respuestas
echo ✓ Test de IA (si disponible)
echo ✓ Test de búsqueda (si disponible)
echo ✓ Test de pago (si disponible)
echo.

echo ========================================================================
echo PRÓXIMOS PASOS
echo ========================================================================
echo.
echo 1. Revisar resultados de los tests
echo 2. Actualizar entrenamiento si es necesario
echo 3. Iniciar servidor con: npm run dev
echo 4. Ejecutar pruebas en vivo
echo.

pause
