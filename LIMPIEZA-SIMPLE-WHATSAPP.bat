@echo off
echo ========================================
echo   LIMPIEZA SIMPLE WHATSAPP
echo ========================================
echo.
echo Esto eliminara:
echo - Sesiones de WhatsApp
echo - Cache de Node
echo.
echo (La DB se limpiara automaticamente)
echo.
pause

echo.
echo [1/2] Eliminando sesiones...
if exist "auth_sessions" (
    rmdir /s /q "auth_sessions"
    echo [OK] Sesiones eliminadas
) else (
    echo [INFO] No hay sesiones
)

echo.
echo [2/2] Eliminando cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo [OK] Cache eliminado
) else (
    echo [INFO] No hay cache
)

echo.
echo ========================================
echo   LIMPIEZA COMPLETADA
echo ========================================
echo.
echo Ahora inicia el servidor:
echo.
echo   npm run dev
echo.
echo Y conecta desde el dashboard.
echo.
pause
