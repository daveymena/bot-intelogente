@echo off
echo ========================================
echo VERIFICACION SISTEMA COMPLETO FINAL
echo ========================================
echo.

echo [1/3] Verificando servicios...
echo.

echo Verificando ConversationLearningService...
if exist "src\lib\conversation-learning-service.ts" (
    echo   [OK] conversation-learning-service.ts
) else (
    echo   [ERROR] conversation-learning-service.ts NO ENCONTRADO
    exit /b 1
)

echo Verificando IntentDetectionService...
if exist "src\lib\intent-detection-service.ts" (
    echo   [OK] intent-detection-service.ts
) else (
    echo   [ERROR] intent-detection-service.ts NO ENCONTRADO
    exit /b 1
)

echo Verificando ObjectionHandlerService...
if exist "src\lib\objection-handler-service.ts" (
    echo   [OK] objection-handler-service.ts
) else (
    echo   [ERROR] objection-handler-service.ts NO ENCONTRADO
    exit /b 1
)

echo.
echo [2/3] Verificando integracion en orquestador...
echo.

findstr /C:"ConversationLearningService" src\agents\orchestrator.ts >nul
if %errorlevel% equ 0 (
    echo   [OK] ConversationLearningService integrado
) else (
    echo   [ERROR] ConversationLearningService NO integrado
    exit /b 1
)

findstr /C:"IntentDetectionService" src\agents\orchestrator.ts >nul
if %errorlevel% equ 0 (
    echo   [OK] IntentDetectionService integrado
) else (
    echo   [ERROR] IntentDetectionService NO integrado
    exit /b 1
)

findstr /C:"ObjectionHandlerService" src\agents\orchestrator.ts >nul
if %errorlevel% equ 0 (
    echo   [OK] ObjectionHandlerService integrado
) else (
    echo   [ERROR] ObjectionHandlerService NO integrado
    exit /b 1
)

echo.
echo [3/3] Ejecutando tests...
echo.

npx tsx test-sistema-completo-final.ts

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo VERIFICACION COMPLETADA EXITOSAMENTE
    echo ========================================
    echo.
    echo Todos los sistemas estan funcionando correctamente!
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR EN LA VERIFICACION
    echo ========================================
    echo.
    echo Revisa los logs arriba para mas detalles.
    echo.
    exit /b 1
)

pause
