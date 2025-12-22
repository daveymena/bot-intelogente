@echo off
chcp 65001 > nul
color 0A
cls

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║     🚀 IMPORTACIÓN DE PRODUCTOS CON FOTOS REALES 🚀           ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo.
echo 📦 Este script importará productos desde:
echo.
echo    ✅ MegaComputer    (50-100 productos físicos)
echo    ✅ Disyvar         (30 productos dropshipping)
echo    ✅ SmartJoys       (30 productos dropshipping)
echo.
echo    📊 TOTAL: ~110-160 productos con fotos reales
echo.
echo ⏱️  Tiempo estimado: 10-20 minutos
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo ¿Deseas continuar? (S/N)
set /p continuar="> "

if /i not "%continuar%"=="S" (
    echo.
    echo ❌ Importación cancelada
    timeout /t 3 > nul
    exit /b 0
)

echo.
echo ════════════════════════════════════════════════════════════════
echo 🚀 INICIANDO IMPORTACIÓN...
echo ════════════════════════════════════════════════════════════════
echo.

call npm run import:all

if errorlevel 1 (
    echo.
    echo ════════════════════════════════════════════════════════════════
    echo ❌ ERROR EN LA IMPORTACIÓN
    echo ════════════════════════════════════════════════════════════════
    echo.
    echo Revisa los errores arriba y ejecuta de nuevo.
    echo.
    echo 💡 Comandos útiles:
    echo    - npx prisma generate
    echo    - npx prisma db push
    echo    - npx tsx scripts/crear-admin.js
    echo.
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════════
echo ✅ IMPORTACIÓN COMPLETADA EXITOSAMENTE
echo ════════════════════════════════════════════════════════════════
echo.
echo 📊 Productos importados con fotos reales
echo.
echo 🎯 PRÓXIMOS PASOS:
echo.
echo    1. Verificar productos en dashboard:
echo       npm run dev
echo       http://localhost:3000/dashboard
echo.
echo    2. Ver productos importados:
echo       npx tsx scripts/ver-productos.js
echo.
echo    3. Probar el bot con productos reales
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo ✨ ¡Todo listo! Presiona cualquier tecla para salir...
pause > nul
