@echo off
echo ========================================
echo   LIMPIEZA TOTAL WHATSAPP
echo ========================================
echo.
echo ADVERTENCIA: Esto eliminara:
echo - Todas las sesiones de WhatsApp
echo - Todos los registros de conexion
echo - Cache de Node
echo.
echo Presiona cualquier tecla para continuar...
pause > nul

echo.
echo [1/3] Eliminando sesiones de WhatsApp...
if exist "auth_sessions" (
    rmdir /s /q "auth_sessions"
    echo [OK] Sesiones eliminadas
) else (
    echo [INFO] No hay sesiones para eliminar
)

echo.
echo [2/3] Eliminando cache de Node...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo [OK] Cache eliminado
) else (
    echo [INFO] No hay cache para eliminar
)

echo.
echo [3/3] Limpiando base de datos...
echo Ejecutando limpieza de DB...
node -e "import('./src/lib/db.js').then(({db})=>db.whatsAppConnection.deleteMany({}).then(()=>{console.log('[OK] Base de datos limpiada');process.exit(0)})).catch(e=>{console.log('[INFO] DB ya limpia o no accesible');process.exit(0)})"

echo.
echo ========================================
echo   LIMPIEZA COMPLETADA
echo ========================================
echo.
echo Ahora puedes iniciar el servidor:
echo.
echo   npm run dev
echo.
echo Y luego conectar desde el dashboard.
echo.
pause
