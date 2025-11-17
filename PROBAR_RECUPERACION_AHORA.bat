@echo off
echo ========================================
echo   PROBAR SISTEMA DE RECUPERACION
echo ========================================
echo.

echo 1. Ejecutando pruebas automaticas...
echo.
call npx tsx scripts/test-password-recovery.ts

echo.
echo ========================================
echo   PRUEBAS COMPLETADAS
echo ========================================
echo.
echo Para probar manualmente:
echo 1. Inicia el servidor: npm run dev
echo 2. Ve a: http://localhost:3000/login
echo 3. Clic en "Olvidaste tu contrasena?"
echo 4. Sigue el flujo completo
echo.
echo Documentacion: RECUPERACION_CONTRASENA_LISTA.md
echo.
pause
