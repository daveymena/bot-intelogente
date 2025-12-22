@echo off
echo ========================================
echo 🔄 REINICIAR BOT PARA APLICAR CAMBIOS
echo ========================================
echo.

echo ⚠️ Los cambios están en el código pero el servidor
echo    está corriendo con la versión ANTERIOR
echo.

echo ========================================
echo 🛑 PASO 1: DETENER SERVIDOR
echo ========================================
echo.

echo Presiona Ctrl+C en la ventana del servidor
echo O cierra la ventana de npm run dev
echo.

pause

echo.
echo ========================================
echo 🚀 PASO 2: INICIAR SERVIDOR
echo ========================================
echo.

echo Ejecutando npm run dev...
echo.

npm run dev
