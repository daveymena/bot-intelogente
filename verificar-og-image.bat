@echo off
echo ========================================
echo Verificando Configuracion Open Graph
echo ========================================
echo.

echo 1. Verificando archivos creados...
if exist "src\app\opengraph-image.tsx" (
    echo [OK] opengraph-image.tsx existe
) else (
    echo [ERROR] opengraph-image.tsx NO existe
)

if exist "src\app\icon.tsx" (
    echo [OK] icon.tsx existe
) else (
    echo [ERROR] icon.tsx NO existe
)

if exist "public\og-image.png" (
    echo [OK] og-image.png existe
) else (
    echo [AVISO] og-image.png no existe (opcional)
)

echo.
echo 2. Verificando variable de entorno...
findstr "NEXT_PUBLIC_APP_URL" .env >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] NEXT_PUBLIC_APP_URL configurada
    findstr "NEXT_PUBLIC_APP_URL" .env
) else (
    echo [AVISO] NEXT_PUBLIC_APP_URL no configurada
    echo Agrega esta linea a tu .env:
    echo NEXT_PUBLIC_APP_URL=https://tu-dominio.com
)

echo.
echo 3. Instrucciones para probar:
echo.
echo a) Reinicia el servidor:
echo    npm run dev
echo.
echo b) Abre en tu navegador:
echo    http://localhost:3000/opengraph-image
echo.
echo c) Valida en Facebook:
echo    https://developers.facebook.com/tools/debug/
echo.
echo d) Comparte tu enlace en WhatsApp
echo.
echo ========================================
echo Verificacion completada
echo ========================================
pause
