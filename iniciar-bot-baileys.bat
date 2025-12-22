@echo off
echo ========================================
echo INICIAR BOT CON BAILEYS
echo ========================================
echo.

echo Este script iniciará el bot completo con Baileys
echo.
echo Características:
echo - Conexión estable con Baileys
echo - Respuestas automáticas con IA
echo - Envío de fotos de productos
echo - Reconexión automática
echo.
echo ========================================
echo.

echo Verificando dependencias...
echo.

REM Verificar si node_modules existe
if not exist "node_modules" (
    echo ⚠️  node_modules no encontrado
    echo Instalando dependencias...
    echo.
    npm install
    echo.
)

echo ✅ Dependencias verificadas
echo.

echo Iniciando servidor con Baileys...
echo.
echo 📱 Para conectar WhatsApp:
echo    1. Abre http://localhost:3000
echo    2. Inicia sesión
echo    3. Ve a la sección de WhatsApp
echo    4. Haz clic en "Conectar WhatsApp"
echo    5. Escanea el QR con tu teléfono
echo.
echo ========================================
echo.

npm run dev

pause
