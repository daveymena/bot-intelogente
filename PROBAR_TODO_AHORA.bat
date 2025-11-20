@echo off
echo ========================================
echo 🧪 PROBAR TODAS LAS MEJORAS
echo ========================================
echo.
echo Este script ejecuta todos los tests para verificar
echo que las mejoras implementadas funcionan correctamente.
echo.
echo ========================================
echo TEST 1: Contexto Persistente
echo ========================================
echo.
npx tsx test-contexto-persistente.js
echo.
echo.
echo ========================================
echo TEST 2: Envio Automatico de Fotos
echo ========================================
echo.
npx tsx test-envio-fotos-automatico.js
echo.
echo.
echo ========================================
echo ✅ TODOS LOS TESTS COMPLETADOS
echo ========================================
echo.
echo Ahora puedes probar en WhatsApp real:
echo.
echo 1. Inicia el bot: npm run dev
echo 2. Envia desde WhatsApp: "Busco un portatil"
echo 3. Verifica que:
echo    - El bot responde con descripcion del producto
echo    - Despues de 1.5s envia las fotos automaticamente
echo    - Si preguntas "¿Cuanto cuesta?" recuerda el producto
echo.
pause
