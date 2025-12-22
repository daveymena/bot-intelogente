@echo off
echo ========================================
echo 📱 RECONECTAR WHATSAPP
echo ========================================
echo.

echo ⚠️ WhatsApp está desconectado (código 401)
echo.

echo Pasos para reconectar:
echo.
echo 1. Limpia la sesión anterior
echo 2. Inicia el bot
echo 3. Escanea el QR
echo.

echo ========================================
echo 🧹 LIMPIANDO SESIÓN ANTERIOR
echo ========================================
echo.

rmdir /s /q auth_sessions 2>nul
mkdir auth_sessions

echo ✅ Sesión limpiada
echo.

echo ========================================
echo 🚀 INICIANDO BOT
echo ========================================
echo.

echo Ejecuta: npm run dev
echo.
echo Luego escanea el QR con tu WhatsApp
echo.

pause
