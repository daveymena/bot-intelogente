@echo off
echo ========================================
echo   SISTEMA DE CATEGORIZACION INTELIGENTE
echo ========================================
echo.
echo Este script va a:
echo 1. Actualizar la base de datos
echo 2. Categorizar todos tus productos con IA
echo 3. Mostrar estadisticas completas
echo.
echo Tiempo estimado: 2-3 minutos
echo.
pause

echo.
echo [1/2] Actualizando base de datos...
echo.
call npm run categorize:push

echo.
echo ========================================
echo   CATEGORIZACION COMPLETADA
echo ========================================
echo.
echo Proximos pasos:
echo 1. Revisa las estadisticas arriba
echo 2. Verifica tus productos en el dashboard
echo 3. El bot ahora usara categorias inteligentes
echo.
pause
