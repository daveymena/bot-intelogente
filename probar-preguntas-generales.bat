@echo off
echo.
echo ========================================
echo   TEST DE PREGUNTAS GENERALES
echo ========================================
echo.
echo Probando preguntas que NO son sobre productos...
echo.

npx tsx scripts/test-preguntas-generales.ts

echo.
echo ========================================
echo   PRUEBAS COMPLETADAS
echo ========================================
echo.
pause
