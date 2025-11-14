@echo off
echo ========================================
echo  FORZAR SUBIDA LIMPIA (SIN HISTORIAL)
echo ========================================
echo.
echo ADVERTENCIA: Esto creará una nueva rama limpia
echo sin el historial de commits con secretos
echo.
pause

echo.
echo [1/7] Creando rama temporal limpia...
git checkout --orphan temp-clean-branch

echo.
echo [2/7] Agregando SOLO código fuente...
git add src/
git add package.json
git add package-lock.json
git add tsconfig.json
git add next.config.ts
git add tailwind.config.ts
git add postcss.config.mjs
git add prisma/schema.prisma
git add scripts/ver-subcategorias.ts
git add scripts/asignar-subcategorias-automatico.ts
git add scripts/asignar-productos-restantes.ts
git add scripts/asignar-subcategoria-manual.ts
git add scripts/actualizar-fotos-megapacks-20mil.ts
git add scripts/extraer-fotos-megacomputer.ts
git add scripts/extraer-fotos-megacomputer-final.ts
git add scripts/test-scraper-megacomputer-v2.ts
git add scripts/ver-productos-sin-fotos.ts
git add README.md
git add .gitignore

echo.
echo [3/7] Creando commit inicial limpio...
git commit -m "feat: Sistema completo actualizado

Correcciones críticas:
- Sistema de puntuación normalizado
- Envío automático de fotos
- Memoria conversacional persistente
- Sistema híbrido inteligente

Nuevas funcionalidades:
- Sistema de subcategorías
- Scraper MegaComputer
- Conexión WhatsApp robusta
- Auto-reconexión

Archivos principales:
- src/lib/local-knowledge-base.ts
- src/lib/intelligent-conversation-engine.ts
- src/lib/baileys-stable-service.ts
- src/app/catalogo/page.tsx

Desarrollado con Kiro Code Assistant"

echo.
echo [4/7] Eliminando rama main antigua...
git branch -D main

echo.
echo [5/7] Renombrando rama limpia a main...
git branch -m main

echo.
echo [6/7] Forzando push a GitHub...
echo ADVERTENCIA: Esto sobrescribirá el historial remoto
pause

git push -f origin main

if %errorlevel%==0 (
    echo.
    echo ========================================
    echo  ✅ SUBIDA EXITOSA
    echo ========================================
    echo.
    echo El repositorio ahora está limpio sin secretos
    echo EasyPanel detectará los cambios automáticamente
    echo.
) else (
    echo.
    echo ❌ Error al subir
    echo.
)

echo.
echo [7/7] Limpiando archivos temporales...
git gc --aggressive --prune=all

pause
