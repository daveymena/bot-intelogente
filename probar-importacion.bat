@echo off
echo ========================================
echo   PRUEBA DE IMPORTACION DE PRODUCTOS
echo ========================================
echo.
echo Este script te ayuda a probar la importacion
echo de productos en formato JSON y CSV
echo.
echo ARCHIVOS DE EJEMPLO DISPONIBLES:
echo   - ejemplos/productos-ejemplo.json
echo   - ejemplos/productos-ejemplo.csv
echo.
echo PASOS PARA PROBAR:
echo.
echo 1. Inicia el sistema:
echo    npm run dev
echo.
echo 2. Abre el navegador en:
echo    http://localhost:3000/dashboard
echo.
echo 3. Ve a la seccion de Productos
echo.
echo 4. Arrastra uno de los archivos de ejemplo
echo    o haz click para seleccionarlo
echo.
echo 5. Verifica que los productos se importen
echo.
echo ========================================
echo.
echo ¿Quieres iniciar el sistema ahora? (S/N)
set /p respuesta=

if /i "%respuesta%"=="S" (
    echo.
    echo Iniciando sistema...
    npm run dev
) else (
    echo.
    echo OK. Inicia el sistema manualmente cuando estes listo.
)

pause
