@echo off
echo ========================================
echo  TEST QWEN2.5:3B CON BASE CONOCIMIENTO
echo ========================================
echo.
echo Modelo: qwen2.5:3b-instruct
echo Usando: knowledge-base-compact.json
echo.

npx tsx scripts/test-qwen-knowledge-base.ts

echo.
echo ========================================
echo  TEST COMPLETADO
echo ========================================
pause
