@echo off
echo ========================================
echo Subiendo cambios a Git
echo ========================================
echo.

echo [1/4] Agregando archivos...
git add .

echo.
echo [2/4] Creando commit...
git commit -m "fix: resolver conflicto de rutas dinamicas y mejorar formato de tienda"

echo.
echo [3/4] Subiendo a GitHub...
git push origin main

echo.
echo [4/4] Listo!
echo.
echo ========================================
echo Cambios subidos exitosamente
echo Easypanel iniciara el deploy automatico
echo ========================================
pause
