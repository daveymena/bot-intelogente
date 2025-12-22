@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════════
echo   VERIFICACIÓN COMPLETA DE FOTOS
echo ═══════════════════════════════════════════════════════════
echo.
echo Este script ejecutará dos verificaciones:
echo.
echo 1. Verificación de URLs y archivos
echo 2. Test de envío por WhatsApp
echo.
echo ═══════════════════════════════════════════════════════════
echo.
pause

echo.
echo ═══════════════════════════════════════════════════════════
echo   1/2 - VERIFICANDO URLs Y ARCHIVOS
echo ═══════════════════════════════════════════════════════════
echo.
node verificar-envio-fotos-completo.js

echo.
echo ═══════════════════════════════════════════════════════════
echo   2/2 - TEST DE ENVÍO POR WHATSAPP
echo ═══════════════════════════════════════════════════════════
echo.
node test-envio-fotos-whatsapp.js

echo.
echo ═══════════════════════════════════════════════════════════
echo   VERIFICACIÓN COMPLETADA
echo ═══════════════════════════════════════════════════════════
echo.
echo Revisa los resultados arriba para ver:
echo.
echo ✅ Productos con fotos OK
echo ⚠️  Productos con problemas
echo ℹ️  Productos sin fotos
echo.
echo Si hay problemas, revisa las URLs en la base de datos
echo.
pause
