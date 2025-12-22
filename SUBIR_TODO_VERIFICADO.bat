@echo off
echo.
echo ========================================
echo   SUBIR BOT VERIFICADO A GIT
echo ========================================
echo.
echo Este script subira el bot verificado
echo a tu repositorio privado de GitHub
echo.
pause

echo.
echo [1/5] Verificando estado del bot...
node test-bot-simulacion.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: El bot no paso las pruebas
    echo No se puede subir a produccion
    pause
    exit /b 1
)

echo.
echo [2/5] Agregando archivos...
git add .

echo.
echo [3/5] Creando commit...
git commit -m "Bot verificado y listo para produccion - Super Sales AI v2.0"

echo.
echo [4/5] Subiendo a GitHub...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [5/5] Verificando subida...
    git status
    
    echo.
    echo ========================================
    echo   SUBIDA EXITOSA
    echo ========================================
    echo.
    echo Bot subido correctamente a GitHub
    echo.
    echo Proximos pasos:
    echo 1. Ir a Easypanel
    echo 2. Conectar repositorio
    echo 3. Configurar variables de entorno
    echo 4. Deploy
    echo.
    echo Documentacion: DEPLOY_SUPER_SALES_AI_EASYPANEL.md
    echo.
) else (
    echo.
    echo ========================================
    echo   ERROR EN LA SUBIDA
    echo ========================================
    echo.
    echo Revisa los errores arriba
    echo.
)

pause
