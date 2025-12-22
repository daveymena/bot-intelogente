@echo off
echo ========================================
echo 🎓 MEJORA DEL SISTEMA LLM
echo ========================================
echo.

echo 📊 Analizando conversaciones...
echo 📚 Generando dataset de entrenamiento...
echo 📝 Optimizando prompts...
echo 💡 Generando recomendaciones...
echo.

call npx tsx scripts/mejorar-llm.ts

echo.
echo ========================================
echo ✅ Proceso completado
echo ========================================
echo.
echo Archivos generados:
echo   - training-dataset.json
echo   - optimized-system-prompt.txt
echo.
pause
