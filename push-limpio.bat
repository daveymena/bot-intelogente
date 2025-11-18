@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  🚀 PUSH LIMPIO A GITHUB                                      ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo 📋 Limpiando referencias...
git for-each-ref --format="delete %%(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo.
echo 🚀 Haciendo push forzado...
git push origin main --force

if %errorlevel% equ 0 (
    echo.
    echo ✅ ¡PUSH EXITOSO!
    echo.
    echo 🎉 Cambios subidos a GitHub
    echo.
    echo 📋 Próximos pasos:
    echo    1. Espera 2-3 minutos (Easypanel desplegará)
    echo    2. Prueba la imagen: probar-logo-compartir.bat
    echo.
) else (
    echo.
    echo ❌ Push falló
    echo.
    echo Intenta de nuevo o revisa el error
    echo.
)

pause
