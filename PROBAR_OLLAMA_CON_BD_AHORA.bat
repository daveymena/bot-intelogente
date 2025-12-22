@echo off
echo ========================================
echo 🦙💾 OLLAMA CON ACCESO A BASE DE DATOS
echo ========================================
echo.

echo ✅ CAMBIO IMPLEMENTADO:
echo    Ollama ahora VE todos los productos de la BD
echo    Puede seleccionar productos directamente
echo    Ya no busca a ciegas
echo.

echo ========================================
echo 🧪 EJECUTANDO TEST
echo ========================================
echo.

npx tsx scripts/test-ollama-search.ts

echo.
echo ========================================
echo 📊 ANÁLISIS
echo ========================================
echo.

echo Busca en los logs:
echo   ✅ "Cargados XX productos de la BD"
echo   ✅ "Ollama seleccionó productos: 1"
echo   ✅ "1 productos directamente"
echo   → OLLAMA TIENE ACCESO A LA BD!
echo.

echo Si ves:
echo   ❌ "0 productos candidatos"
echo   → Verifica que tengas productos en la BD
echo.

pause
