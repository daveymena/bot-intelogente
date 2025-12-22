@echo off
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     🚀 Iniciar Baileys + n8n - Modo Simplificado      ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 📋 Este script iniciará:
echo    1. Baileys (conexión WhatsApp)
echo    2. Enviará mensajes a n8n para procesamiento
echo.
echo ⚠️  Asegúrate de que n8n esté corriendo:
echo    docker run -p 5678:5678 n8nio/n8n
echo    o
echo    n8n start
echo.
pause

echo.
echo 🔄 Iniciando Baileys Webhook Service...
echo.

npx tsx scripts/start-baileys-webhook.ts

pause
