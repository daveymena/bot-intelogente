@echo off
echo ========================================
echo TEST: CURSO vs MEGA PACK
echo ========================================
echo.
echo Este script verifica que el bot NO confunda
echo cursos individuales con mega packs
echo.
echo Tests incluidos:
echo 1. "curso de piano" - NO debe mostrar mega packs
echo 2. "mega pack" - SI debe mostrar mega packs
echo 3. "curso de piano completo" - Solo el especifico
echo.
echo Presiona cualquier tecla para continuar...
pause > nul

npx tsx scripts/test-curso-piano-vs-megapack.ts

echo.
echo ========================================
echo Test completado
echo ========================================
pause
