@echo off
echo ========================================
echo LIMPIAR Y RECONECTAR WHATSAPP
echo ========================================
echo.

echo [1/3] Deteniendo servidor...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo [2/3] Limpiando sesiones antiguas...
if exist "auth_sessions" (
    rmdir /s /q "auth_sessions"
    echo ✅ Sesiones eliminadas
) else (
    echo ℹ️  No hay sesiones para eliminar
)

echo.
echo [3/3] Creando carpeta nueva...
mkdir "auth_sessions" 2>nul

echo.
echo ========================================
echo ✅ LISTO PARA RECONECTAR
echo ========================================
echo.
echo Ahora ejecuta:
echo   npm run dev
echo.
echo Y conecta WhatsApp desde el dashboard
echo.
pause
