@echo off
echo ========================================
echo 🧠 TEST DE RAZONAMIENTO DE OLLAMA
echo ========================================
echo.

echo Este test evalúa:
echo   - Comprensión de búsquedas
echo   - Selección de productos
echo   - Extracción de keywords
echo   - Velocidad de respuesta
echo   - Calidad del razonamiento
echo.

echo ========================================
echo 🚀 EJECUTANDO TESTS
echo ========================================
echo.

npx tsx scripts/test-razonamiento-ollama.ts

echo.
echo ========================================
echo 📊 ANÁLISIS COMPLETADO
echo ========================================
echo.

pause
