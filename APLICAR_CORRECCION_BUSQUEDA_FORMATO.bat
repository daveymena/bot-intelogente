@echo off
echo ========================================
echo   APLICAR CORRECCIÓN: BÚSQUEDA + FORMATO
echo ========================================
echo.
echo Esta corrección soluciona:
echo 1. Búsqueda de "curso de idiomas" (busca en megapacks)
echo 2. Formato profesional SIN asteriscos ni puntos
echo 3. Formato tipo boleta/card con emojis
echo.
echo ========================================
echo   ARCHIVOS CREADOS/MODIFICADOS
echo ========================================
echo.
echo ✅ src/lib/intelligent-search-fallback.ts (NUEVO)
echo ✅ src/lib/professional-card-formatter.ts (NUEVO)
echo ✅ src/lib/simple-conversation-handler.ts (MODIFICADO)
echo ✅ test-busqueda-idiomas.js (TEST)
echo.
echo ========================================
echo   PASO 1: VERIFICAR ARCHIVOS
echo ========================================
echo.

if exist "src\lib\intelligent-search-fallback.ts" (
    echo ✅ intelligent-search-fallback.ts existe
) else (
    echo ❌ intelligent-search-fallback.ts NO existe
    echo    Por favor ejecuta primero los cambios
    pause
    exit /b 1
)

if exist "src\lib\professional-card-formatter.ts" (
    echo ✅ professional-card-formatter.ts existe
) else (
    echo ❌ professional-card-formatter.ts NO existe
    echo    Por favor ejecuta primero los cambios
    pause
    exit /b 1
)

echo.
echo ========================================
echo   PASO 2: EJECUTAR TEST
echo ========================================
echo.

node test-busqueda-idiomas.js

echo.
echo ========================================
echo   PASO 3: REINICIAR SERVIDOR
echo ========================================
echo.
echo IMPORTANTE: Debes reiniciar el servidor manualmente
echo.
echo 1. Ve a la ventana del servidor
echo 2. Presiona Ctrl+C
echo 3. Ejecuta: npm run dev
echo 4. Espera a que inicie
echo 5. Conecta WhatsApp si es necesario
echo.
echo ========================================
echo   PASO 4: PROBAR EN WHATSAPP
echo ========================================
echo.
echo Envía este mensaje de prueba:
echo "Tienes curso de idiomas"
echo.
echo Resultado esperado:
echo - Sin asteriscos (*)
echo - Sin puntos (...)
echo - Con emojis profesionales
echo - Formato tipo boleta/card
echo - Muestra megapacks si no hay curso específico
echo.
echo ========================================
pause
