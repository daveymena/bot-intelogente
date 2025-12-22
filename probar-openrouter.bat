@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════════════
echo 🌐 PRUEBA: OpenRouter API
echo ═══════════════════════════════════════════════════════════════
echo.
echo OpenRouter te da acceso a múltiples modelos de IA:
echo   - Claude 3.5 Sonnet (Anthropic)
echo   - GPT-4 Turbo (OpenAI)
echo   - Llama 3.1 70B (Meta)
echo   - Gemini Pro (Google)
echo   - Y muchos más...
echo.
echo Presiona cualquier tecla para iniciar las pruebas...
pause >nul

echo.
echo 🚀 Ejecutando pruebas de OpenRouter...
echo.

npx tsx scripts/test-openrouter.ts

echo.
echo ═══════════════════════════════════════════════════════════════
echo ✅ PRUEBAS COMPLETADAS
echo ═══════════════════════════════════════════════════════════════
echo.
echo 📊 RESULTADO:
echo    Si ves ✅ → OpenRouter funciona correctamente
echo    Si ves ❌ → Revisa la configuración en .env
echo.
echo 📝 SIGUIENTE PASO:
echo    1. Revisa OPENROUTER_CONFIGURADO.md para más info
echo    2. Prueba en WhatsApp real
echo    3. Cambia de modelo si quieres (ver documento)
echo.
echo 💡 MODELOS RECOMENDADOS:
echo    - Claude 3.5 Sonnet: Mejor calidad
echo    - Llama 3.1 70B: Gratis
echo    - GPT-3.5 Turbo: Más económico
echo.
echo Presiona cualquier tecla para salir...
pause >nul
