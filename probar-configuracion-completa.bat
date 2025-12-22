@echo off
echo ========================================
echo   TEST SISTEMA DE CONFIGURACION
echo ========================================
echo.
echo Verificando que TODAS las configuraciones
echo se guarden correctamente en la BD...
echo.

node test-configuracion-completa.js

echo.
echo ========================================
echo   TEST COMPLETADO
echo ========================================
echo.
echo Para ver los datos guardados:
echo   npx prisma studio
echo.
pause
