@echo off
REM 🚀 Script para pushear los cambios a GitHub
REM Ejecuta este script desde tu máquina local

echo 🔧 Configurando git y haciendo push...
echo.

REM Verifica que estés en el directorio correcto
if not exist ".git" (
    echo ❌ Error: No estás en el directorio raíz del repositorio
    exit /b 1
)

REM Muestra el estado actual
echo 📊 Estado actual:
git status
echo.

REM Verifica los commits no pusheados
for /f %%i in ('git log origin/main..main --oneline ^| find /c /v ""') do set COMMITS=%%i
echo 📝 Commits listos para pushear: %COMMITS%
echo.

REM Lista los commits
echo 📋 Commits a pushear:
git log origin/main..main --oneline
echo.

REM Intenta hacer push
echo 🚀 Haciendo push a GitHub...
git push origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ✅ ¡Push exitoso!
    echo.
    echo Verifica tus cambios en:
    echo https://github.com/daveymena/bot-intelogente
) else (
    echo.
    echo ❌ Error al hacer push. Probables causas:
    echo 1. No tienes conexión a internet
    echo 2. Necesitas configurar autenticación SSH o HTTPS
    echo 3. Tu token de GitHub ha expirado
    echo.
    echo 💡 Solución:
    echo Configura SSH:
    echo   ssh-keygen -t ed25519 -C "tu-email@gmail.com"
    echo   (Copia el contenido de ~/.ssh/id_ed25519.pub a GitHub Settings ^> SSH Keys)
    echo.
    echo O usa HTTPS con token:
    echo   git remote set-url origin https://tu-token@github.com/daveymena/bot-intelogente.git
    exit /b 1
)
