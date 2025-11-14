@echo off
echo ============================================================
echo TEST DE BUSQUEDA DE MEGAPACKS
echo ============================================================
echo.

echo Probando busqueda mejorada de megapacks...
echo.
echo Queries de prueba:
echo - "Pack Completo 40 Mega Packs"
echo - "pack completo"
echo - "todos los megapacks"
echo - "megapak completo" (con error)
echo - "megapack 1", "mega pack 5", etc.
echo.

npx tsx scripts/test-megapack-search.ts

echo.
echo ============================================================
echo Test completado
echo ============================================================
echo.

pause
