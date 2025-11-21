@echo off
echo ========================================
echo  SUBIENDO CORRECCIONES RESPONSIVE A GIT
echo ========================================
echo.

echo [1/5] Agregando archivos modificados...
git add .

echo.
echo [2/5] Creando commit...
git commit -m "fix: Correcciones responsive movil y logo en links compartidos

- Agregado viewport correcto para dispositivos moviles
- Mejorado responsive en dashboard y landing pages
- Asegurado logo en Open Graph para links compartidos
- Corregidos errores de build TypeScript
- Optimizado layout para pantallas pequenas"

echo.
echo [3/5] Verificando estado...
git status

echo.
echo [4/5] Subiendo a GitHub...
git push origin main

echo.
echo [5/5] Verificando push...
git log --oneline -5

echo.
echo ========================================
echo  LISTO PARA EASYPANEL
echo ========================================
echo.
echo Ahora puedes:
echo 1. Ir a Easypanel
echo 2. Hacer pull del repositorio
echo 3. Rebuild de la aplicacion
echo.
pause
