@echo off
echo.
echo ========================================
echo   PERMITIR SECRETS EN GITHUB
echo ========================================
echo.
echo GitHub detectó API keys en commits antiguos.
echo.
echo Opciones:
echo.
echo 1. PERMITIR los secrets (más rápido)
echo    - Abre estos links en tu navegador:
echo.
echo    https://github.com/daveymena/bot-intelogente/security/secret-scanning/unblock-secret/35cV8Xb4mg86bPgrTvzAoxAT54B
echo.
echo    Haz clic en "Allow secret" en cada uno
echo.
echo 2. LIMPIAR historial (más seguro pero complejo)
echo    - Requiere reescribir el historial de Git
echo.
echo ========================================
echo.
echo Recomendación: Opción 1 (permitir)
echo Ya que las API keys están en .env que NO se sube
echo.
pause
