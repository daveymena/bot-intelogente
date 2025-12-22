@echo off
echo ========================================
echo  PROBAR TOLERANCIA A ERRORES
echo ========================================
echo.
echo Este script prueba que el bot entienda:
echo - Errores ortograficos (curzo, piyano)
echo - Variaciones (mega pack, idioma)
echo - Sinonimos (laptop, compu)
echo.
echo Ejecutando tests...
echo.

npx tsx test-tolerancia-errores.ts

echo.
echo ========================================
echo  Tests completados
echo ========================================
pause
