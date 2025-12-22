@echo off
echo ========================================
echo SUBIENDO TIENDA NUEVA A GIT
echo ========================================
echo.

echo [1/4] Agregando archivos...
git add src/app/tienda/
git add src/app/api/products/public/
git add src/app/api/products/[id]/
git add TIENDA_NUEVA_EASYPANEL.md
git add SUBIR_TIENDA_NUEVA.bat

echo.
echo [2/4] Creando commit...
git commit -m "feat: Nueva tienda moderna con botones de pago dinamicos - Estilo SmartJoys"

echo.
echo [3/4] Subiendo a GitHub...
git push origin main

echo.
echo [4/4] LISTO!
echo.
echo ========================================
echo SIGUIENTE PASO:
echo ========================================
echo 1. Ve a Easypanel
echo 2. Click en "Rebuild"
echo 3. Espera 3-5 minutos
echo 4. Limpia cache: Ctrl + Shift + R
echo 5. Visita: /tienda
echo ========================================
echo.
pause
