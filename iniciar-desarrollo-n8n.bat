@echo off
cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     🚀 Iniciar Desarrollo con n8n Easypanel           ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 📋 Este script iniciará:
echo    1. Tu bot Smart Sales (localhost:3000)
echo    2. ngrok (exponer a internet)
echo.
echo ⚠️  Asegúrate de tener:
echo    - ngrok instalado y autenticado
echo    - n8n corriendo en Easypanel
echo.
pause

echo.
echo 🔄 Iniciando servicios...
echo.

REM Iniciar bot en nueva ventana
start "Smart Sales Bot" cmd /k "echo 🤖 Iniciando Smart Sales Bot... && npm run dev"

REM Esperar 5 segundos para que el bot inicie
timeout /t 5 /nobreak >nul

REM Iniciar ngrok en nueva ventana
start "ngrok" cmd /k "echo 🌐 Iniciando ngrok... && ngrok http 3000"

echo.
echo ✅ Servicios iniciados!
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║              📋 PASOS SIGUIENTES                       ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 1. Ve a la ventana de ngrok
echo 2. Copia la URL que aparece (https://xxx.ngrok-free.app)
echo 3. Ve a Easypanel → n8n → Environment
echo 4. Actualiza: SMART_SALES_BOT_URL=https://xxx.ngrok-free.app
echo 5. Reinicia n8n en Easypanel
echo 6. Activa el workflow en n8n
echo 7. Envía un mensaje por WhatsApp para probar
echo.
echo 💡 Tip: La URL de ngrok cambia cada vez que lo reinicias
echo    Para URL fija, considera Cloudflare Tunnel o desplegar en Easypanel
echo.
echo 🔗 URLs importantes:
echo    - Bot local: http://localhost:3000
echo    - n8n Easypanel: https://n8n.tudominio.com
echo    - ngrok dashboard: http://localhost:4040
echo.
pause
