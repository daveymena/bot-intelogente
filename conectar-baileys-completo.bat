@echo off
echo ========================================
echo CONECTAR WHATSAPP CON BAILEYS
echo ========================================
echo.

echo Este script hará TODO automáticamente:
echo 1. Limpiar sesiones antiguas
echo 2. Limpiar base de datos
echo 3. Iniciar Baileys
echo 4. Mostrar QR para escanear
echo.
echo ========================================
echo.

echo Paso 1: Limpiando sesiones...
if exist "auth_sessions" rmdir /s /q "auth_sessions" 2>nul
if exist "whatsapp-sessions" rmdir /s /q "whatsapp-sessions" 2>nul
echo ✅ Sesiones limpiadas
echo.

echo Paso 2: Limpiando base de datos...
npx tsx scripts/limpiar-db-whatsapp.ts
echo.

echo Paso 3: Iniciando Baileys...
echo.
echo ⚠️  IMPORTANTE:
echo    - Se abrirá el dashboard en tu navegador
echo    - Inicia sesión con: daveymena16@gmail.com / Davey2020
echo    - Ve a la sección de WhatsApp
echo    - Haz clic en "Conectar WhatsApp"
echo    - Escanea el QR que aparezca
echo.
echo Presiona cualquier tecla para continuar...
pause > nul

start http://localhost:3000

echo.
echo ✅ Dashboard abierto
echo.
echo Ahora en el dashboard:
echo 1. Inicia sesión
echo 2. Ve a WhatsApp
echo 3. Conecta y escanea el QR
echo.
pause
