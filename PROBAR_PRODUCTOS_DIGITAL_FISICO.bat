@echo off
echo ========================================
echo TEST: Productos Digitales vs Fisicos
echo ========================================
echo.
echo Verificando que el bot maneje correctamente:
echo - Productos digitales: NO recogida/envio
echo - Productos fisicos: SI recogida/envio
echo.
pause

npx tsx scripts/test-producto-digital-vs-fisico.ts

echo.
echo ========================================
echo Test completado
echo ========================================
pause
