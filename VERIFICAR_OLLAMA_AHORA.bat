@echo off
echo ========================================
echo   VERIFICACION COMPLETA DE OLLAMA
echo ========================================
echo.

echo [1/3] Detectando modelos disponibles...
echo.
npx tsx scripts/detectar-modelos-ollama.ts

echo.
echo.
echo [2/3] Verificando configuracion...
echo.
npx tsx scripts/verificar-ollama-simple.ts

echo.
echo.
echo [3/3] Probando generacion de texto...
echo.
npx tsx scripts/test-solo-ollama.ts

echo.
echo ========================================
echo   VERIFICACION COMPLETADA
echo ========================================
echo.
echo Siguiente paso:
echo   npx tsx scripts/test-ollama-orchestrator.ts
echo.
pause
