@echo off
echo ========================================
echo VERIFICACION PRE-DEPLOY
echo ========================================
echo.

echo [1/4] Verificando sistema completo...
node DIAGNOSTICO_PRODUCCION_COMPLETO.js

echo.
echo ========================================
echo [2/4] Probando IA con Groq...
echo ========================================
node test-groq-conversacional-completo.js

echo.
echo ========================================
echo [3/4] Verificando productos...
echo ========================================
node diagnosticar-productos.js

echo.
echo ========================================
echo [4/4] Verificando usuarios...
echo ========================================
node diagnosticar-usuarios.js

echo.
echo ========================================
echo VERIFICACION COMPLETADA
echo ========================================
echo.
echo Lee los resultados arriba.
echo Si todo esta OK, puedes desplegar a produccion.
echo.
echo Archivos importantes:
echo - LEER_PRIMERO_PRODUCCION.txt
echo - INSTRUCCIONES_DEPLOY_PRODUCCION.md
echo - RESUMEN_SISTEMA_PRODUCCION.md
echo.
pause
