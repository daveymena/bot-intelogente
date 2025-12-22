@echo off
echo ========================================
echo  GENERAR LINKS DE PAGO - TODOS LOS CURSOS
echo ========================================
echo.
echo Este script genera links de pago para
echo TODOS los cursos y megapacks digitales
echo.
echo Generando...
echo.

npx tsx scripts/generar-links-todos-cursos.ts

echo.
echo ========================================
echo  Links generados
echo ========================================
echo.
echo Los links son dinamicos y se generan
echo automaticamente cuando el cliente
echo pregunta por un producto.
echo.
pause
