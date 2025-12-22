@echo off
cls
echo ========================================
echo   PRUEBA DE LM STUDIO
echo ========================================
echo.
echo Este script probara:
echo   1. Conexion a LM Studio
echo   2. Modelos disponibles
echo   3. Generacion de respuestas
echo   4. Velocidad de respuesta
echo.
echo IMPORTANTE:
echo   - Abre LM Studio ANTES de continuar
echo   - Carga un modelo (phi-2 recomendado)
echo   - Activa el servidor API en Settings
echo.
pause

echo.
echo Ejecutando prueba...
echo.

npx tsx scripts/test-lmstudio-solo.ts

echo.
echo ========================================
echo   PRUEBA COMPLETADA
echo ========================================
pause
