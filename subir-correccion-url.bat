@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  🔧 CORREGIR URL Y SUBIR A GITHUB                             ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo 📋 Problema encontrado:
echo    URL incorrecta en layout.tsx
echo.
echo ❌ Antes: https://bot-whatsapp.sqaoeo.easypanel.host
echo ✅ Ahora:  https://bot-whatsapp-botauyomaizado.sqaoeo.easypanel.host
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo 1️⃣  Agregando archivos corregidos...
git add src/app/layout.tsx .env.production.limpio

echo.
echo 2️⃣  Haciendo commit...
git commit -m "fix: corregir URL de Open Graph para Easypanel"

if %errorlevel% neq 0 (
    echo.
    echo ⚠️  No hay cambios para commitear
    echo    Los archivos ya están actualizados
    echo.
    pause
    exit /b 0
)

echo.
echo 3️⃣  Subiendo a GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ ¡CAMBIOS SUBIDOS EXITOSAMENTE!
    echo.
    echo 🎉 Ahora Easypanel desplegará automáticamente
    echo.
    echo ⏰ Espera 2-3 minutos y luego verifica:
    echo    https://bot-whatsapp-botauyomaizado.sqaoeo.easypanel.host/opengraph-image
    echo.
) else (
    echo.
    echo ❌ Error al subir cambios
    echo.
    echo 💡 Intenta manualmente:
    echo    git push origin main
    echo.
)

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
pause
