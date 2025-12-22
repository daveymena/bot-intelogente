@echo off
echo ========================================
echo   IMPORTAR CATALOGO COMPLETO
echo ========================================
echo.
echo Este script importara:
echo - 24 productos de MegaComputer (laptops + impresoras)
echo - 40 Megapacks individuales ($20.000 c/u)
echo - 1 Pack Completo ($60.000)
echo - 1 Curso de Piano ($60.000)
echo - 1 Moto Bajaj Pulsar ($6.500.000)
echo.
pause

echo.
echo [1/5] Importando productos de MegaComputer...
npx tsx scripts/importar-megacomputer-completo.ts

echo.
echo [2/5] Importando 40 Megapacks individuales...
npx tsx scripts/importar-40-megapacks.ts

echo.
echo [3/5] Importando productos digitales y moto...
npx tsx scripts/importar-digitales-moto.ts

echo.
echo [4/5] Corrigiendo precios...
npx tsx scripts/corregir-precios-digitales.ts

echo.
echo [5/5] Actualizando fotos...
npx tsx scripts/actualizar-fotos-digitales.ts

echo.
echo ========================================
echo   RESUMEN FINAL
echo ========================================
npx tsx scripts/resumen-productos-final.ts

echo.
echo ========================================
echo   IMPORTACION COMPLETADA
echo ========================================
pause
