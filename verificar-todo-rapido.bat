@echo off
echo ========================================
echo VERIFICACION RAPIDA DEL SISTEMA
echo ========================================
echo.

echo [1/3] Verificando base de datos...
npx tsx scripts/check-db-errors.ts
echo.

echo [2/3] Verificando fotos...
npx tsx scripts/verificar-fotos-completo.ts
echo.

echo [3/3] Verificando curso de piano...
npx tsx ver-curso-piano.js
echo.

echo ========================================
echo VERIFICACION COMPLETADA
echo ========================================
pause
