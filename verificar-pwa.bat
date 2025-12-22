@echo off
echo ========================================
echo VERIFICACION PWA - SMART SALES BOT PRO
echo ========================================
echo.

echo [1/4] Verificando manifest.json...
if exist "public\manifest.json" (
    echo ✅ manifest.json existe
) else (
    echo ❌ manifest.json NO existe
)

echo.
echo [2/4] Verificando service worker...
if exist "public\sw.js" (
    echo ✅ sw.js existe
) else (
    echo ❌ sw.js NO existe
)

echo.
echo [3/4] Verificando iconos...
if exist "public\icon-192.png" (
    echo ✅ icon-192.png existe
) else (
    echo ❌ icon-192.png NO existe
)

if exist "public\icon-512.png" (
    echo ✅ icon-512.png existe
) else (
    echo ❌ icon-512.png NO existe
)

echo.
echo [4/4] Verificando offline.html...
if exist "public\offline.html" (
    echo ✅ offline.html existe
) else (
    echo ❌ offline.html NO existe
)

echo.
echo ========================================
echo RESUMEN
echo ========================================
echo.
echo ✅ Correcciones aplicadas:
echo    - start_url cambiado a "/"
echo    - Iconos simplificados (solo 192 y 512)
echo    - Service worker actualizado
echo.
echo 📱 Para probar en móvil:
echo    1. Iniciar servidor: npm run dev
echo    2. Abrir en móvil: http://localhost:4000
echo    3. Agregar a pantalla de inicio
echo.
echo 🔧 Si persiste el error:
echo    - Desinstalar app anterior del móvil
echo    - Limpiar caché del navegador
echo    - Volver a instalar
echo.
pause
