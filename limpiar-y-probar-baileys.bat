@echo off
echo ========================================
echo LIMPIAR SESIONES Y PROBAR BAILEYS
echo ========================================
echo.

echo Paso 1: Limpiando sesiones antiguas...
echo.

REM Limpiar auth_sessions
if exist "auth_sessions" (
    echo Eliminando auth_sessions...
    rmdir /s /q "auth_sessions" 2>nul
)

REM Limpiar whatsapp-sessions
if exist "whatsapp-sessions" (
    echo Eliminando whatsapp-sessions...
    rmdir /s /q "whatsapp-sessions" 2>nul
)

echo.
echo ✅ Sesiones limpiadas
echo.

echo Paso 2: Limpiando base de datos...
echo.
npx tsx scripts/limpiar-db-whatsapp.ts
echo.

echo Paso 3: Probando Baileys con sesión limpia...
echo.
npx tsx scripts/probar-baileys.ts
echo.

pause
