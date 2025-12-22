@echo off
echo.
echo ═══════════════════════════════════════════════════════════
echo  PROBAR BÚSQUEDA ESPECÍFICA - SOLO 1 PRODUCTO
echo ═══════════════════════════════════════════════════════════
echo.
echo 1. Verificando megapacks de idiomas...
echo.
node verificar-megapacks-idiomas.js
echo.
echo ═══════════════════════════════════════════════════════════
echo  INSTRUCCIONES PARA PROBAR EN WHATSAPP
echo ═══════════════════════════════════════════════════════════
echo.
echo 1. Reinicia el servidor:
echo    npm run dev
echo.
echo 2. Envía estos mensajes por WhatsApp:
echo.
echo    a) "Me interesa el curso de idiomas"
echo       Esperado: Muestra SOLO 1 megapack con cursos
echo.
echo    b) "Curso de piano"
echo       Esperado: Muestra SOLO 1 curso específico
echo.
echo    c) "Quiero ver megapacks"
echo       Esperado: Muestra 3 megapacks generales
echo.
echo 3. Verifica que el bot muestre:
echo    - SOLO 1 producto cuando pregunta específico
echo    - 3 productos cuando pregunta general
echo    - Foto del producto automáticamente
echo.
echo ═══════════════════════════════════════════════════════════
echo.
pause
