@echo off
echo ========================================
echo   OLLAMA ORCHESTRATOR PROFESSIONAL
echo   Sistema Orquestador Inteligente
echo ========================================
echo.

echo [1/3] Probando Ollama Orchestrator...
echo.
npx tsx scripts/test-ollama-orchestrator.ts

echo.
echo ========================================
echo   PRUEBAS COMPLETADAS
echo ========================================
echo.
echo Sistema listo para usar:
echo   1. Ollama (Principal - GRATIS)
echo   2. Groq (Fallback IA)
echo   3. Bot Local (Ultimo recurso)
echo.
echo Para iniciar el bot:
echo   npm run dev
echo.
pause
