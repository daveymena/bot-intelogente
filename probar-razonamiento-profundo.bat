@echo off
echo ========================================
echo  TEST: RAZONAMIENTO PROFUNDO QWEN2.5
echo ========================================
echo.
echo Probando capacidad de razonamiento con:
echo - Comparaciones
echo - Recomendaciones personalizadas
echo - Analisis de presupuesto
echo - Consultas sobre beneficios
echo - Preguntas abiertas
echo.
echo Esto puede tardar varios minutos...
echo.

npx tsx scripts/test-razonamiento-profundo.ts

echo.
echo ========================================
echo  TEST COMPLETADO
echo ========================================
pause
