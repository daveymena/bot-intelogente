@echo off
echo ========================================
echo TEST: Correccion de Contexto Productos
echo ========================================
echo.
echo Probando que el bot mantenga el contexto
echo cuando el cliente pide "mas informacion"
echo.
pause

npx tsx scripts/test-contexto-producto-corregido.ts

echo.
echo ========================================
echo Test completado
echo ========================================
pause
