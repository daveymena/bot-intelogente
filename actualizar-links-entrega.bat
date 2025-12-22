@echo off
echo ========================================
echo 📦 ACTUALIZANDO LINKS DE ENTREGA
echo ========================================
echo.
echo Configurando links para:
echo - Curso Completo de Piano
echo - Megapack de 40 Cursos
echo.
echo Presiona cualquier tecla para continuar...
pause >nul

echo.
echo 🔧 Actualizando base de datos...
echo.

npx tsx scripts/update-delivery-links.ts

echo.
echo ========================================
echo ✅ ACTUALIZACIÓN COMPLETADA
echo ========================================
echo.
echo Los productos ahora tienen:
echo - Links de Google Drive y TeraBox
echo - Instrucciones de acceso
echo - Codigos de extraccion
echo.
echo Siguiente paso: Iniciar el bot
echo npm run dev
echo.
pause
