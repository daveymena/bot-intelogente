@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  🎨 PROBAR LOGO PARA COMPARTIR ENLACES                        ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo 📋 Verificando archivos...
echo.

if exist "src\app\opengraph-image.tsx" (
    echo ✅ opengraph-image.tsx - OK
) else (
    echo ❌ opengraph-image.tsx - NO EXISTE
    goto :error
)

if exist "src\app\icon.tsx" (
    echo ✅ icon.tsx - OK
) else (
    echo ❌ icon.tsx - NO EXISTE
    goto :error
)

if exist "src\app\layout.tsx" (
    echo ✅ layout.tsx - OK
) else (
    echo ❌ layout.tsx - NO EXISTE
    goto :error
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo 🔍 Verificando configuración...
echo.

findstr "NEXT_PUBLIC_APP_URL" .env >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ NEXT_PUBLIC_APP_URL configurada
    for /f "tokens=*" %%a in ('findstr "NEXT_PUBLIC_APP_URL" .env') do echo    %%a
) else (
    echo ⚠️  NEXT_PUBLIC_APP_URL no configurada
    echo    Agrega a .env: NEXT_PUBLIC_APP_URL=https://tu-dominio.com
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo 🚀 OPCIONES PARA PROBAR:
echo.
echo 1. Ver imagen en desarrollo local
echo 2. Validar con Facebook Debug Tool
echo 3. Ver instrucciones completas
echo 4. Salir
echo.

set /p opcion="Elige una opción (1-4): "

if "%opcion%"=="1" goto :local
if "%opcion%"=="2" goto :facebook
if "%opcion%"=="3" goto :instrucciones
if "%opcion%"=="4" goto :end

echo Opción inválida
pause
goto :end

:local
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🌐 Abriendo imagen en navegador...
echo.
echo URL: http://localhost:4000/opengraph-image
echo.
echo ⚠️  IMPORTANTE: Asegúrate de que el servidor esté corriendo
echo    Si no está corriendo, ejecuta: npm run dev
echo.
timeout /t 3 >nul
start http://localhost:4000/opengraph-image
echo.
echo ✅ Navegador abierto
echo.
echo También puedes probar:
echo - Icono: http://localhost:4000/icon
echo - Dashboard: http://localhost:4000/dashboard
echo.
pause
goto :end

:facebook
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🔍 Abriendo Facebook Debug Tool...
echo.
echo 📝 INSTRUCCIONES:
echo.
echo 1. Pega tu URL en el campo de texto
echo 2. Haz clic en "Scrape Again"
echo 3. Verás la vista previa con tu imagen
echo.
echo URLs para probar:
echo - Local: http://localhost:4000/dashboard
echo - Producción: https://bot-whatsapp-botauyomaizado.sqaoeo.easypanel.host/dashboard
echo.
timeout /t 3 >nul
start https://developers.facebook.com/tools/debug/
echo.
echo ✅ Facebook Debug Tool abierto
echo.
pause
goto :end

:instrucciones
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📚 Abriendo documentación...
echo.
if exist "VER_LOGO_SSB_RAPIDO.txt" (
    start notepad "VER_LOGO_SSB_RAPIDO.txt"
    echo ✅ Archivo abierto: VER_LOGO_SSB_RAPIDO.txt
) else if exist "CONFIGURAR_LOGO_COMPARTIR.md" (
    start notepad "CONFIGURAR_LOGO_COMPARTIR.md"
    echo ✅ Archivo abierto: CONFIGURAR_LOGO_COMPARTIR.md
) else if exist "VER_CAMBIOS_LOGO_AHORA.md" (
    start notepad "VER_CAMBIOS_LOGO_AHORA.md"
    echo ✅ Archivo abierto: VER_CAMBIOS_LOGO_AHORA.md
) else (
    echo ⚠️  No se encontraron archivos de documentación
)
echo.
pause
goto :end

:error
echo.
echo ❌ ERROR: Faltan archivos necesarios
echo.
echo Por favor, asegúrate de que existan:
echo - src\app\opengraph-image.tsx
echo - src\app\icon.tsx
echo - src\app\layout.tsx
echo.
pause
goto :end

:end
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📚 Documentación disponible:
echo - VER_LOGO_SSB_RAPIDO.txt
echo - CONFIGURAR_LOGO_COMPARTIR.md
echo - VER_CAMBIOS_LOGO_AHORA.md
echo.
echo 🚀 Próximos pasos:
echo 1. Reinicia el servidor: npm run dev
echo 2. Abre: http://localhost:4000/opengraph-image
echo 3. Comparte tu enlace en WhatsApp
echo.
echo ✅ ¡Todo listo para compartir con imagen profesional!
echo.
pause
