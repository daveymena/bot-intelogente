@echo off
echo ========================================
echo SUBIR A GIT (SIN TRADING-BOT)
echo ========================================
echo.
echo Esto eliminara la carpeta trading-bot
echo y subira los cambios a GitHub
echo.
pause

echo.
echo [1/4] Eliminando carpeta trading-bot...
if exist trading-bot (
    rmdir /s /q trading-bot
    echo ✓ Carpeta eliminada
) else (
    echo ℹ️  Carpeta no existe
)

echo.
echo [2/4] Agregando cambios...
git add .

echo.
echo [3/4] Creando commit...
git commit -m "Sistema Hibrido: Bot Local + Ollama Assistant con formato profesional"

echo.
echo [4/4] Subiendo a GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo ❌ Error al subir
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ SUBIDO EXITOSAMENTE
echo ========================================
echo.
echo Cambios en GitHub:
echo - Sistema Hibrido completo
echo - Ollama Assistant
echo - Formato profesional
echo - PostgreSQL configurado
echo.
echo SIGUIENTE PASO:
echo 1. Ve a Easypanel
echo 2. Copia variables de: VARIABLES_EASYPANEL_COMPLETAS.env
echo 3. Rebuild la aplicacion
echo.
pause
