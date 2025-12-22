@echo off
echo ========================================
echo 🚨 TEST: Sistema de Escalamiento Inteligente
echo ========================================
echo.
echo Probando detección automática de casos que necesitan humano...
echo.

npx tsx test-escalamiento-inteligente.ts

echo.
echo ========================================
echo ✅ Test completado
echo ========================================
pause
