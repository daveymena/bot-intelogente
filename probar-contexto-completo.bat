@echo off
echo ========================================
echo TEST: Contexto Completo - Todos los Productos
echo ========================================
echo.
echo Probando 5 escenarios diferentes:
echo 1. Busqueda especifica nueva
echo 2. Referencias al contexto
echo 3. Cambio de producto
echo 4. Preguntas sobre uso
echo 5. Multiples productos
echo.

npx tsx scripts/test-contexto-completo-productos.ts

echo.
echo ========================================
echo Test completado
echo ========================================
pause
