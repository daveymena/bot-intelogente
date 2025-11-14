@echo off
echo ========================================
echo   PROBAR SISTEMA MULTI-PROVIDER DE IA
echo ========================================
echo.
echo Este script probara:
echo   1. Groq API (principal)
echo   2. LM Studio (local)
echo   3. OpenAI (opcional)
echo.
echo NOTA: LM Studio es opcional para respaldo local
echo       El bot funciona perfectamente solo con Groq
echo.
pause

npx tsx scripts/test-multi-provider.ts

echo.
echo ========================================
echo   PRUEBA COMPLETADA
echo ========================================
echo.
echo Si ves "GROQ: FUNCIONANDO" tu bot esta listo!
echo.
pause
