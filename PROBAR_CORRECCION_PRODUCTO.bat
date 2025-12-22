@echo off
echo ========================================
echo PROBAR CORRECCION SELECCION PRODUCTO
echo ========================================
echo.
echo Este script prueba que el bot seleccione
echo el producto correcto cuando el usuario
echo especifica "el curso de piano completo"
echo.
echo Presiona cualquier tecla para continuar...
pause > nul

npx tsx scripts/test-seleccion-producto-especifico.ts

echo.
echo ========================================
echo Test completado
echo ========================================
pause
