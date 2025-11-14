@echo off
echo ========================================
echo ARREGLANDO HISTORIAL Y SUBIENDO A GITHUB
echo ========================================
echo.

echo [1/4] Reseteando al ultimo commit limpio en GitHub...
git reset --hard d71b48e

echo.
echo [2/4] Agregando todos los cambios nuevos...
git add .

echo.
echo [3/4] Creando nuevo commit limpio...
git commit -m "feat: Sistema de webhooks de pagos + emails de confirmacion"

echo.
echo [4/4] Subiendo a GitHub...
git push origin main --force

echo.
echo ========================================
echo LISTO! Codigo subido exitosamente
echo ========================================
pause
