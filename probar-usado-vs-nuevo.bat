@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════════════
echo 🧪 PRUEBA: FILTRO USADO VS NUEVO
echo ═══════════════════════════════════════════════════════════════
echo.
echo Este script verificará que el bot NO mezcle productos
echo nuevos y usados cuando el cliente especifica la condición.
echo.
echo Presiona cualquier tecla para continuar...
pause >nul

echo.
echo 📋 Paso 1: Ver productos usados en la base de datos
echo.
npx tsx scripts/ver-productos-usados.ts

echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo 🧪 Paso 2: Probar filtro de búsqueda
echo.
echo Presiona cualquier tecla para continuar...
pause >nul

npx tsx scripts/test-usado-vs-nuevo.ts

echo.
echo ═══════════════════════════════════════════════════════════════
echo ✅ PRUEBAS COMPLETADAS
echo ═══════════════════════════════════════════════════════════════
echo.
echo 📊 RESULTADO:
echo    Si las pruebas muestran ✅ → El filtro funciona correctamente
echo    Si las pruebas muestran ❌ → Hay un problema
echo.
echo 📝 SIGUIENTE PASO:
echo    Prueba en WhatsApp real:
echo    1. Pregunta: "Portátil usado"
echo    2. Verifica que muestre SOLO productos usados
echo    3. Pregunta: "Laptop nueva"
echo    4. Verifica que muestre SOLO productos nuevos
echo.
echo Presiona cualquier tecla para salir...
pause >nul
