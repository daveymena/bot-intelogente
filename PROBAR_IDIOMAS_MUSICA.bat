@echo off
echo ========================================
echo TEST: IDIOMAS VS MUSICA
echo ========================================
echo.
echo Verificando que el bot no confunda idiomas con musica...
echo.

npx tsx scripts/test-idiomas-vs-musica.ts

echo.
echo ========================================
echo TEST COMPLETADO
echo ========================================
echo.
pause
