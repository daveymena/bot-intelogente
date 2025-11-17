@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  🚀 ARREGLAR PUSH BLOQUEADO - SOLUCIÓN RÁPIDA                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo 🎯 Problema: GitHub bloqueó el push por una API key detectada
echo.
echo 💡 Solución más rápida: Permitir el secreto en GitHub
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo OPCIÓN 1: Permitir secreto (RECOMENDADO - 30 segundos)
echo.
echo 1. Abre este enlace en tu navegador:
echo.
echo    https://github.com/daveymena/bot-intelogente/security/secret-scanning/unblock-secret/35cV8Xb4mg86bPgrTvzAoxAT54B
echo.
echo 2. Haz clic en "Allow secret"
echo.
echo 3. Presiona cualquier tecla aquí para hacer push automáticamente
echo.

pause

echo.
echo 🚀 Intentando push...
echo.

git push origin main --force

if %errorlevel% equ 0 (
    echo.
    echo ✅ ¡Push exitoso!
    echo.
    echo 🎉 Problema resuelto
    echo.
    echo 📋 Próximos pasos:
    echo    1. Verifica en GitHub que los cambios estén subidos
    echo    2. Espera 2-3 minutos para que Easypanel despliegue
    echo    3. Prueba la imagen Open Graph:
    echo       probar-logo-compartir.bat
    echo.
) else (
    echo.
    echo ❌ Push falló
    echo.
    echo 💡 Posibles causas:
    echo    1. No permitiste el secreto en GitHub
    echo    2. Necesitas autenticación
    echo.
    echo 🔧 Soluciones:
    echo.
    echo A. Permite el secreto en GitHub (enlace arriba)
    echo.
    echo B. O usa la solución alternativa:
    echo    limpiar-secretos-git.bat
    echo.
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

pause
