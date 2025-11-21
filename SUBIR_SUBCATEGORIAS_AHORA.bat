@echo off
echo ========================================
echo SUBIR SISTEMA DE SUBCATEGORIAS
echo ========================================
echo.

echo [1/3] Agregando archivos al repositorio...
git add .
echo.

echo [2/3] Creando commit...
git commit -m "feat: Sistema de subcategorias implementado - Mejora busqueda de productos

- Agregada deteccion automatica de categoria desde query
- Penalizacion por categoria incorrecta (-50 puntos)
- Bonus por subcategoria correcta (+15 puntos)
- 113 productos con subcategorias asignadas
- 37 productos corregidos
- Scripts de asignacion y correccion creados
- Documentacion completa

Resuelve: Confusion de productos en busquedas (ej: tintas al buscar portatiles)"
echo.

echo [3/3] Subiendo a GitHub...
git push origin main
echo.

echo ========================================
echo COMPLETADO
echo ========================================
echo.
echo Siguiente paso:
echo 1. Ir a Easypanel
echo 2. Hacer pull del repositorio
echo 3. Rebuild de la aplicacion
echo.
pause
