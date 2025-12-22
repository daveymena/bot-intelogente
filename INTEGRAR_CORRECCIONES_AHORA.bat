@echo off
echo ========================================
echo INTEGRANDO CORRECCIONES DE DATOS REALES
echo ========================================
echo.

echo [1/4] Verificando precios reales en BD...
node verificar-precios-reales.js
if errorlevel 1 (
    echo ERROR: Problemas con precios en BD
    pause
    exit /b 1
)

echo.
echo [2/4] Aplicando correccion de precios y fotos...
node aplicar-correccion-urgente-precios-fotos.js
if errorlevel 1 (
    echo ERROR: Fallo al aplicar correcciones
    pause
    exit /b 1
)

echo.
echo [3/4] Integrando RealDataEnforcer en conversacionController...
npx tsx scripts/integrar-real-data-enforcer.ts
if errorlevel 1 (
    echo ERROR: Fallo integracion RealDataEnforcer
    pause
    exit /b 1
)

echo.
echo [4/4] Integrando CardPhotoSender en baileys-stable-service...
npx tsx scripts/integrar-card-photo-sender.ts
if errorlevel 1 (
    echo ERROR: Fallo integracion CardPhotoSender
    pause
    exit /b 1
)

echo.
echo ========================================
echo CORRECCIONES INTEGRADAS EXITOSAMENTE
echo ========================================
echo.
echo Ahora puedes probar con:
echo   npm run dev
echo.
echo Y enviar mensaje de prueba:
echo   "busco curso de reparacion de celulares"
echo.
pause
