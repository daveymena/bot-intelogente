@echo off
echo ========================================
echo 🤖 TEST COMPLETO DEL SISTEMA LLM
echo ========================================
echo.

echo 📦 Compilando TypeScript...
call npx tsx scripts/test-llm-completo.ts

echo.
echo ========================================
echo ✅ Tests completados
echo ========================================
pause
