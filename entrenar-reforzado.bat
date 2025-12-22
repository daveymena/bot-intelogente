@echo off
echo ========================================
echo 🧠 ENTRENAMIENTO REFORZADO
echo ========================================
echo.

echo 📊 Analizando feedback de conversaciones...
echo 🔍 Evaluando patrones de respuesta...
echo 🔄 Actualizando modelo con aprendizaje...
echo 📈 Generando reporte de entrenamiento...
echo.

call npx tsx scripts/entrenar-reforzado.ts

echo.
echo ========================================
echo ✅ Entrenamiento completado
echo ========================================
echo.
echo Archivo generado:
echo   - reinforcement-learning-report.json
echo.
echo El bot ahora usa el aprendizaje reforzado
echo.
pause
