@echo off
chcp 65001 >nul
echo ========================================
echo PROBAR CORRECCIONES APLICADAS
echo ========================================
echo.

echo [1/3] Ejecutando tests de verificación...
node test-correcciones-completas.js
echo.

echo ========================================
echo TESTS COMPLETADOS
echo ========================================
echo.
echo Si todos los tests pasaron, puedes:
echo.
echo 1. Iniciar el sistema:
echo    npm run dev
echo.
echo 2. Conectar WhatsApp en:
echo    http://localhost:3000
echo.
echo 3. Probar con mensajes:
echo    - "busco curso de reparacion de celulares"
echo    - "tienes curso de piano?"
echo    - "quiero el megapack de 40 cursos"
echo.
echo ========================================
echo.

pause
