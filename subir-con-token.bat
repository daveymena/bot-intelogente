@echo off
echo ========================================
echo SUBIR A GITHUB CON TOKEN
echo ========================================
echo.
echo PASO 1: Obtener tu Personal Access Token
echo.
echo 1. Ve a: https://github.com/settings/tokens
echo 2. Click "Generate new token (classic)"
echo 3. Nombre: Bot-Inteligente
echo 4. Permisos: Marca "repo"
echo 5. Generate token
echo 6. COPIA el token
echo.
echo ========================================
echo.
set /p TOKEN="Pega tu token aqui y presiona Enter: "

if "%TOKEN%"=="" (
    echo ❌ Token vacio
    pause
    exit /b 1
)

echo.
echo [1/4] Eliminando trading-bot...
if exist trading-bot (
    rmdir /s /q trading-bot
    echo ✓ Eliminado
)

echo.
echo [2/4] Agregando cambios...
git add .

echo.
echo [3/4] Creando commit...
git commit -m "Sistema Hibrido: Bot Local + Ollama Assistant"

echo.
echo [4/4] Subiendo con token...
git push https://%TOKEN%@github.com/daveymena/bot-intelogente.git main

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
pause
