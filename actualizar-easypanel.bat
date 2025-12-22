@echo off
echo ========================================
echo   ACTUALIZAR EASYPANEL
echo ========================================
echo.
echo Subiendo cambios a GitHub...
echo.

REM Agregar todos los archivos
git add .

REM Commit con mensaje
git commit -m "feat: Demo interactiva + Reseteo WhatsApp + fix: Responsive mobile optimizado"

REM Push a main
git push origin main

echo.
echo ========================================
echo   CAMBIOS SUBIDOS EXITOSAMENTE
echo ========================================
echo.
echo Easypanel detectara los cambios y
echo desplegara automaticamente en unos minutos.
echo.
echo Puedes ver el progreso en:
echo https://easypanel.io
echo.
pause
