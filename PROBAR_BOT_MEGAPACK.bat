@echo off
echo ========================================
echo   PROBAR BOT CON MEGAPACK
echo ========================================
echo.
echo Este test verifica:
echo 1. Foto correcta del Mega Pack 01
echo 2. Link de pago correcto
echo 3. Contexto bloqueado (no cambia a Piano)
echo.
pause
echo.
npx tsx scripts/test-flujo-completo-megapack.ts
echo.
pause
