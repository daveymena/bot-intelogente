@echo off
echo ========================================
echo   SOLUCION COMPLETA - FOTOS Y RESPUESTAS
echo ========================================
echo.

echo [1/3] Normalizando imagenes en base de datos...
npx tsx scripts/normalizar-imagenes-productos.ts
echo.

echo [2/3] Verificando fotos del Curso de Piano...
node test-fotos-urls-simple.js
echo.

echo [3/3] Probando respuesta directa del bot...
echo.
echo LISTO! Ahora prueba preguntando:
echo   "Quiero el curso de piano"
echo.
echo El bot debe responder INMEDIATAMENTE con:
echo   - Nombre del producto
echo   - Precio
echo   - Descripcion
echo   - Foto (si existe)
echo   - Link de pago
echo.

pause
