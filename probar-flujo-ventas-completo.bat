@echo off
echo ========================================
echo PRUEBA PROFUNDA DE FLUJO DE VENTAS
echo ========================================
echo.
echo Probando:
echo - Productos digitales vs fisicos
echo - Objeciones de precio
echo - Manejo de contexto
echo - Metodos de pago
echo.
echo Iniciando pruebas...
echo.

npx tsx scripts/test-flujo-ventas-completo.ts

echo.
echo ========================================
echo PRUEBAS COMPLETADAS
echo ========================================
pause
