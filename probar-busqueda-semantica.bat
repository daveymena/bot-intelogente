@echo off
echo ========================================
echo   TEST BUSQUEDA SEMANTICA CON OLLAMA
echo ========================================
echo.
echo Probando que el sistema entiende:
echo - Contexto completo
echo - Errores ortograficos
echo - Intenciones implicitas
echo - Sinonimos y variaciones
echo.
echo ========================================
echo.
npx tsx test-busqueda-semantica.js
echo.
pause
