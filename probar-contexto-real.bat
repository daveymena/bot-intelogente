@echo off
echo ========================================
echo 🧪 PROBAR CONTEXTO EN CONVERSACION REAL
echo ========================================
echo.
echo Este script te ayudara a verificar que el contexto
echo se mantiene correctamente en conversaciones reales.
echo.
echo PASOS PARA PROBAR:
echo.
echo 1. Asegurate de que el bot este corriendo
echo 2. Envia un mensaje desde WhatsApp: "Busco un portatil"
echo 3. Espera la respuesta del bot
echo 4. Espera 2-3 minutos
echo 5. Envia: "¿Cuanto cuesta?"
echo 6. El bot DEBE responder con el precio del portatil
echo    (NO debe enviar saludo inicial)
echo.
echo ========================================
echo LOGS A VERIFICAR:
echo ========================================
echo.
echo Busca en los logs del servidor:
echo   [Context] ⏰ Tiempo renovado para...
echo   [Context] 🔄 Contexto renovado para...
echo   [Context] ✅ Contexto encontrado: ...
echo.
echo Si ves estos logs, el contexto se esta renovando correctamente.
echo.
echo ========================================
echo COMANDOS UTILES:
echo ========================================
echo.
echo Ver logs en tiempo real:
echo   npm run dev
echo.
echo Probar test automatizado:
echo   npx tsx test-contexto-persistente.js
echo.
pause
