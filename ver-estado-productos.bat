@echo off
echo ========================================
echo ESTADO DE PRODUCTOS - DIAGNOSTICO
echo ========================================
echo.
echo Verificando productos en la base de datos...
echo.

npx tsx scripts/diagnosticar-productos-completo.ts

echo.
echo ========================================
echo DIAGNOSTICO COMPLETADO
echo ========================================
echo.
echo Archivos de referencia:
echo - ESTADO_FINAL_PRODUCTOS.md
echo - PRODUCTOS_RECLASIFICADOS_COMPLETO.md
echo - RESUMEN_FOTOS_Y_CLASIFICACION_COMPLETO.md
echo.
pause
