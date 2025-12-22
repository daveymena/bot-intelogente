@echo off
echo ========================================
echo PROBAR SISTEMA DE PREGUNTAS DE SEGUIMIENTO
echo ========================================
echo.
echo Ejecutando test automatizado...
echo.

npx tsx scripts/test-preguntas-seguimiento.ts

echo.
echo ========================================
echo TEST COMPLETADO
echo ========================================
echo.
echo Ahora puedes probar en WhatsApp:
echo 1. Envia: "Megapack de Piano"
echo 2. Espera respuesta
echo 3. Envia: "mas informacion"
echo 4. Verifica que responda sobre el Piano
echo 5. Envia: "metodos de pago"
echo 6. Verifica que muestre metodos para el Piano
echo.
pause
