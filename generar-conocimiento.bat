@echo off
echo ========================================
echo  GENERAR BASE DE CONOCIMIENTO
echo ========================================
echo.
echo Generando knowledge-base.json desde BD...
echo.

npx tsx scripts/generar-base-conocimiento.ts

echo.
echo ========================================
echo  LISTO - Archivos generados:
echo  - knowledge-base.json
echo  - knowledge-base-compact.json
echo ========================================
pause
