@echo off
echo ========================================
echo  TEST: SOLO IA (SIN PLANTILLAS LOCALES)
echo ========================================
echo.
echo Qwen2.5 maneja TODO:
echo - Saludos
echo - Busquedas
echo - Pagos
echo - Conversaciones
echo.

npx tsx scripts/test-solo-ia.ts

echo.
echo ========================================
echo  TEST COMPLETADO
echo ========================================
pause
