@echo off
echo ========================================
echo   VERIFICAR IMPORTS CRITICOS
echo ========================================
echo.
echo Buscando imports en el motor de conversacion...
echo.

findstr /n "ProductScorer" src\lib\intelligent-conversation-engine.ts
findstr /n "DynamicProductIntelligence" src\lib\intelligent-conversation-engine.ts
findstr /n "ResponseValidator" src\lib\intelligent-conversation-engine.ts

echo.
echo ========================================
if %ERRORLEVEL% EQU 0 (
    echo   RESULTADO: IMPORTS PRESENTES
    echo   Estado: OK
) else (
    echo   RESULTADO: IMPORTS FALTANTES
    echo   Ejecuta: RESTAURAR-IMPORTS-AHORA.bat
)
echo ========================================
echo.
pause
