@echo off
echo ========================================
echo 🎓 ENTRENAMIENTO CON PRODUCTOS
echo ========================================
echo.

echo 📦 Cargando productos de la base de datos...
echo 🔄 Generando ejemplos de entrenamiento...
echo 📝 Creando archivo de entrenamiento...
echo 📊 Generando reporte...
echo.

call npx tsx scripts/entrenar-con-productos.ts

echo.
echo ========================================
echo ✅ Entrenamiento completado
echo ========================================
echo.
echo Archivos generados:
echo   - src/lib/product-training-examples.ts
echo   - product-training-report.json
echo.
echo Proximo paso:
echo   Reinicia el bot: npm run dev
echo.
pause
