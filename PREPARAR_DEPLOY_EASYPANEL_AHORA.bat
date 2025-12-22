@echo off
echo.
echo ═══════════════════════════════════════════════════════════
echo  PREPARAR DEPLOY A EASYPANEL - 14 DIC 2025
echo ═══════════════════════════════════════════════════════════
echo.
echo Cambios aplicados:
echo   ✅ Búsqueda específica (1 producto)
echo   ✅ Fotos verificadas (100%%)
echo   ✅ Keywords inteligentes
echo   ✅ Fallback triple
echo.
echo ═══════════════════════════════════════════════════════════
echo  PASO 1: VERIFICAR CAMBIOS
echo ═══════════════════════════════════════════════════════════
echo.
git status
echo.
pause
echo.
echo ═══════════════════════════════════════════════════════════
echo  PASO 2: AGREGAR ARCHIVOS MODIFICADOS
echo ═══════════════════════════════════════════════════════════
echo.
git add src/lib/intelligent-search-fallback.ts
git add test-busqueda-idiomas-mejorada.js
git add verificar-megapacks-idiomas.js
git add DEPLOY_EASYPANEL_14_DIC_2025.md
git add RESUMEN_SESION_14_DIC_2025.md
git add RESUMEN_FINAL_BUSQUEDA_ESPECIFICA.md
git add CORRECCION_BUSQUEDA_ESPECIFICA_UN_PRODUCTO.md
echo.
echo ✅ Archivos agregados
echo.
pause
echo.
echo ═══════════════════════════════════════════════════════════
echo  PASO 3: COMMIT
echo ═══════════════════════════════════════════════════════════
echo.
git commit -m "feat: búsqueda específica muestra solo 1 producto + fotos verificadas 100%%"
echo.
echo ✅ Commit realizado
echo.
pause
echo.
echo ═══════════════════════════════════════════════════════════
echo  PASO 4: PUSH A GITHUB
echo ═══════════════════════════════════════════════════════════
echo.
git push origin main
echo.
echo ✅ Push completado
echo.
echo ═══════════════════════════════════════════════════════════
echo  SIGUIENTE PASO: IR A EASYPANEL
echo ═══════════════════════════════════════════════════════════
echo.
echo 1. Ir a Easypanel → Tu proyecto
echo 2. Git → Pull latest changes
echo 3. Rebuild
echo 4. Esperar a que termine
echo 5. Verificar logs
echo.
echo Logs esperados:
echo   ✅ [Fallback] Encontrado 1 megapack relacionado
echo   📸 [Photo] Enviando 1 foto
echo   ✅ [Baileys] Respuesta enviada
echo.
echo ═══════════════════════════════════════════════════════════
echo  PROBAR EN WHATSAPP
echo ═══════════════════════════════════════════════════════════
echo.
echo Envía estos mensajes:
echo   1. "Me interesa el curso de idiomas"
echo      Esperado: SOLO 1 megapack + foto
echo.
echo   2. "Curso de piano"
echo      Esperado: SOLO 1 curso + foto
echo.
echo   3. "Quiero ver megapacks"
echo      Esperado: 3 megapacks + foto
echo.
echo ═══════════════════════════════════════════════════════════
echo.
pause
