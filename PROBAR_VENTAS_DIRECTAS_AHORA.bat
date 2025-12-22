@echo off
echo ========================================
echo 🚀 PROBANDO VENTAS DIRECTAS CON AIDA
echo ========================================
echo.

echo ✅ CAMBIOS APLICADOS:
echo    - Respuestas DIRECTAS
echo    - AIDA sutil integrado
echo    - Pregunta por método de pago
echo    - Asume compra
echo    - Máximo 6 líneas
echo.

echo ========================================
echo 🧪 EJECUTANDO TEST
echo ========================================
echo.

npx tsx scripts/test-ollama-search.ts

echo.
echo ========================================
echo 📊 BUSCA EN LA RESPUESTA:
echo ========================================
echo.

echo ✅ Debe incluir:
echo    - "Tecnovariedades D&S" (negocio)
echo    - Precio claro
echo    - 3 beneficios (qué GANA el cliente)
echo    - "¿Cómo prefieres pagar?" (cierre directo)
echo.

echo ❌ NO debe incluir:
echo    - "¿Te interesa?"
echo    - "¿Quieres más información?"
echo    - Preguntas indecisas
echo.

pause
