@echo off
echo ========================================
echo IMPORTAR PRODUCTOS A LA BASE DE DATOS
echo ========================================
echo.

echo 1. Importando megapacks...
node agregar-megapacks-completo-fixed.js

echo.
echo 2. Verificando productos importados...
node ver-todos-productos-ahora.js

echo.
echo ========================================
echo PRODUCTOS IMPORTADOS EXITOSAMENTE
echo ========================================
echo.
echo Ahora puedes probar el bot con:
echo   - "curso de piano"
echo   - "laptop asus"
echo   - "moto pulsar"
echo.
pause
