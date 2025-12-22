@echo off
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🧪 TEST: Contexto de Pago
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo Este test verifica que el bot mantiene el contexto
echo del producto cuando el cliente solicita el pago.
echo.
echo Flujo del test:
echo 1. Cliente pregunta por portatil
echo 2. Bot muestra portatil
echo 3. Cliente dice "quiero pagar"
echo 4. Bot debe enviar links del MISMO portatil
echo.
pause
echo.
echo Ejecutando test con usuario real de la BD...
echo.

npx tsx test-contexto-pago-real.js

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Test completado
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
pause
