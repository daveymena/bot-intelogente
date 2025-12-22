@echo off
echo ========================================
echo SUBIR A GIT SIN TRADING-BOT
echo ========================================
echo.

echo [1/4] Eliminando trading-bot del repositorio...
git rm -r --cached trading-bot 2>nul
if %errorlevel% equ 0 (
    echo ✓ trading-bot eliminado del cache
) else (
    echo ℹ️  trading-bot no estaba en el repositorio
)

echo.
echo [2/4] Agregando cambios (sin trading-bot)...
git add .

echo.
echo [3/4] Creando commit...
git commit -m "Sistema Hibrido Bot Local + Ollama (sin trading-bot)"

echo.
echo [4/4] Subiendo a GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo.
    echo ❌ Error al subir
    echo.
    echo Intentando con push forzado...
    git push origin main --force
    
    if %errorlevel% neq 0 (
        echo.
        echo ❌ Error persistente
        echo.
        echo SOLUCION MANUAL:
        echo 1. Elimina fisicamente la carpeta: trading-bot
        echo 2. Ejecuta: git add .
        echo 3. Ejecuta: git commit -m "Sin trading-bot"
        echo 4. Ejecuta: git push origin main
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo ✅ SUBIDO EXITOSAMENTE
echo ========================================
echo.
pause
