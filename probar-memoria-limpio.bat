@echo off
echo ========================================
echo   TEST SISTEMA MEMORIA COMPARTIDA
echo ========================================
echo.

echo Limpiando cache de Node.js...
if exist node_modules\.cache rmdir /s /q node_modules\.cache 2>nul

echo Probando que el bot NO se olvide del producto...
echo.

node test-memoria-compartida.js

echo.
echo ========================================
pause
