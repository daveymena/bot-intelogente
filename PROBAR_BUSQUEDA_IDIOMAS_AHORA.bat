@echo off
echo.
echo ═══════════════════════════════════════════════════════════
echo  PROBAR BÚSQUEDA DE IDIOMAS CON FALLBACK
echo ═══════════════════════════════════════════════════════════
echo.
echo 1. Ejecutando test de búsqueda...
echo.
node test-busqueda-idiomas-mejorada.js
echo.
echo ═══════════════════════════════════════════════════════════
echo  INSTRUCCIONES PARA PROBAR EN WHATSAPP
echo ═══════════════════════════════════════════════════════════
echo.
echo 1. Asegúrate de que el servidor esté corriendo:
echo    npm run dev
echo.
echo 2. Envía estos mensajes por WhatsApp:
echo    - "Me interesa el curso de idiomas"
echo    - "Tienes cursos de inglés"
echo    - "Quiero ver megapacks"
echo.
echo 3. Verifica que el bot responda con megapacks
echo.
echo ═══════════════════════════════════════════════════════════
echo.
pause
