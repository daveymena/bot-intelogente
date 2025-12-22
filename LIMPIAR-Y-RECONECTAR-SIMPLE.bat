@echo off
echo ========================================
echo   LIMPIEZA TOTAL Y RECONEXION SIMPLE
echo ========================================
echo.
echo Este script va a:
echo 1. Limpiar TODAS las sesiones
echo 2. Limpiar cache de Node
echo 3. Reiniciar el servidor
echo.
pause

echo.
echo [1/3] Limpiando sesiones de WhatsApp...
if exist "auth_sessions" (
    rmdir /s /q "auth_sessions"
    echo ✓ Sesiones eliminadas
) else (
    echo ℹ No hay sesiones para eliminar
)

echo.
echo [2/3] Limpiando cache de Node...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✓ Cache eliminado
) else (
    echo ℹ No hay cache para eliminar
)

echo.
echo [3/3] Reiniciando servidor...
echo.
echo ========================================
echo   SERVIDOR INICIANDO
echo ========================================
echo.
echo Ahora puedes:
echo 1. Ir al dashboard
echo 2. Click en "Conectar WhatsApp"
echo 3. Escanear el QR que aparecerá
echo.
echo ========================================
echo.

npm run dev
