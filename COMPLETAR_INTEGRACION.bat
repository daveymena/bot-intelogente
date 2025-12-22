@echo off
echo ========================================
echo COMPLETANDO INTEGRACION DE CORRECCIONES
echo ========================================
echo.

echo [1/2] Corrigiendo precio del Megapack 40...
node corregir-precio-megapack-40.js
if errorlevel 1 (
    echo ERROR: Fallo al corregir precio
    pause
    exit /b 1
)

echo.
echo [2/2] Integrando CardPhotoSender en baileys...
npx tsx scripts/integrar-card-photo-sender.ts
if errorlevel 1 (
    echo ERROR: Fallo integracion CardPhotoSender
    pause
    exit /b 1
)

echo.
echo ========================================
echo INTEGRACION COMPLETADA
echo ========================================
echo.
echo Ahora ejecuta el test completo:
echo   node test-correcciones-completas.js
echo.
echo Y luego inicia el servidor:
echo   npm run dev
echo.
pause
