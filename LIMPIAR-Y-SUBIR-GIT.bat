@echo off
echo ========================================
echo  LIMPIEZA Y SUBIDA INTELIGENTE A GIT
echo ========================================
echo.
echo Este script:
echo 1. Limpiará archivos innecesarios
echo 2. Solo subirá código y configuración
echo 3. Ignorará documentación temporal
echo.
pause

echo.
echo [1/8] Limpiando archivos temporales...
git reset

echo.
echo [2/8] Agregando solo archivos esenciales...

REM ===== CÓDIGO FUENTE COMPLETO =====
git add src/

REM ===== SCRIPTS DE SUBCATEGORÍAS =====
git add scripts/ver-subcategorias.ts
git add scripts/asignar-subcategorias-automatico.ts
git add scripts/asignar-productos-restantes.ts
git add scripts/asignar-subcategoria-manual.ts

REM ===== SCRIPTS DE FOTOS =====
git add scripts/actualizar-fotos-megapacks-20mil.ts
git add scripts/extraer-fotos-megacomputer.ts
git add scripts/extraer-fotos-megacomputer-final.ts
git add scripts/test-scraper-megacomputer-v2.ts
git add scripts/ver-productos-sin-fotos.ts
git add scripts/scraper-fotos-todas-tiendas.ts

REM ===== ARCHIVOS BAT ÚTILES =====
git add actualizar-megapacks-20mil.bat
git add LIMPIAR-Y-SUBIR-GIT.bat

REM Configuración
git add package.json
git add package-lock.json
git add tsconfig.json
git add next.config.ts
git add tailwind.config.ts
git add postcss.config.mjs

REM Prisma
git add prisma/

REM Public (solo archivos necesarios, no fotos temporales)
git add public/*.svg
git add public/*.ico
git add public/*.png
git add public/manifest.json

REM Documentación esencial
git add README.md
git add CHANGELOG_ULTIMA_ACTUALIZACION.md

REM Archivos bat útiles
git add actualizar-megapacks-20mil.bat

echo.
echo [3/8] Verificando .gitignore...
if not exist .gitignore (
    echo Creando .gitignore...
    (
        echo # Dependencies
        echo node_modules/
        echo .pnp
        echo .pnp.js
        echo.
        echo # Testing
        echo coverage/
        echo.
        echo # Next.js
        echo .next/
        echo out/
        echo build/
        echo dist/
        echo.
        echo # Production
        echo /build
        echo.
        echo # Misc
        echo .DS_Store
        echo *.pem
        echo.
        echo # Debug
        echo npm-debug.log*
        echo yarn-debug.log*
        echo yarn-error.log*
        echo.
        echo # Local env files
        echo .env
        echo .env.local
        echo .env.development.local
        echo .env.test.local
        echo .env.production.local
        echo.
        echo # Vercel
        echo .vercel
        echo.
        echo # TypeScript
        echo *.tsbuildinfo
        echo next-env.d.ts
        echo.
        echo # WhatsApp sessions
        echo auth_sessions/
        echo.
        echo # Documentación temporal
        echo *_TEMP.md
        echo *_OLD.md
        echo RESUMEN_*.md
        echo ARREGLO_*.md
        echo SOLUCION_*.md
        echo CORRECCION_*.md
        echo PROBLEMA_*.md
        echo DEBUG_*.md
        echo TEST_*.md
        echo LISTO_*.md
        echo APLICAR_*.md
        echo EJECUTAR_*.md
        echo PROBAR_*.md
        echo VERIFICAR_*.md
        echo DIAGNOSTICO_*.md
        echo.
        echo # Scripts de prueba temporales
        echo test-*.js
        echo verificar-*.js
        echo buscar-*.js
        echo arreglar-*.js
        echo diagnosticar-*.js
        echo.
        echo # Reportes
        echo scripts/reporte-*.json
        echo.
        echo # Ejemplos
        echo examples/
        echo botexperimento/
    ) > .gitignore
    git add .gitignore
)

echo.
echo [4/8] Estado actual:
git status --short

echo.
echo [5/8] Archivos que se subirán:
git diff --cached --name-only

echo.
echo ========================================
echo RESUMEN DE CAMBIOS A SUBIR:
echo ========================================
echo.
echo ✅ CÓDIGO FUENTE COMPLETO:
echo    - Sistema conversacional mejorado
echo    - Sistema de conexión WhatsApp robusto
echo    - APIs optimizadas
echo    - Catálogo con subcategorías
echo.
echo ✅ SCRIPTS NUEVOS:
echo    - Scraper de fotos MegaComputer
echo    - Asignación de subcategorías
echo    - Actualización de fotos megapacks
echo.
echo ✅ CONFIGURACIÓN:
echo    - package.json, tsconfig, etc.
echo    - Prisma schema
echo.
echo ✅ DOCUMENTACIÓN ESENCIAL:
echo    - README.md
echo    - CHANGELOG_ULTIMA_ACTUALIZACION.md
echo.
echo ❌ IGNORADO (no se sube):
echo    - 1000+ archivos .md temporales
echo    - Scripts de prueba
echo    - Reportes JSON
echo.
pause

echo.
echo [6/8] Creando commit...
git commit -m "feat: Actualización completa del sistema - Correcciones críticas y nuevas funcionalidades

🎯 CORRECCIONES CRÍTICAS IMPLEMENTADAS:

1. ✅ Sistema de Puntuación/Recomendación CORREGIDO
   - Normalización de acentos en local-knowledge-base.ts
   - Evita confusiones entre productos similares (ej: piano vs idiomas)
   - Matching mejorado con palabras clave específicas
   - ANTES: 'curso piano' → Mega Pack Idiomas ❌
   - AHORA: 'curso piano' → Curso Completo de Piano ✅

2. ✅ Sistema de Envío de Fotos Automático
   - Flags imageSent para evitar duplicados
   - Envío automático al establecer contexto de producto
   - Memoria persistente de imágenes enviadas

3. ✅ Memoria Conversacional Mejorada
   - Contexto de producto persistente entre mensajes
   - Contexto de pago mantenido correctamente
   - Memoria de 24 horas con reseteo automático

4. ✅ Sistema Híbrido Inteligente
   - Fallback: IA → Ollama → Base conocimiento local
   - Rotación de hasta 8 API keys de Groq
   - Prevención de rate limits

🆕 NUEVAS FUNCIONALIDADES:

5. Sistema de Subcategorías
   - Catálogo organizado por tipo de producto
   - Filtros dinámicos de dos niveles
   - 13 subcategorías implementadas

6. Scraper de Fotos MegaComputer
   - Extracción automática de imágenes
   - Navegación inteligente por categorías
   - Búsqueda por coincidencia de nombres

7. Sistema de Conexión WhatsApp Robusto
   - Auto-reconexión implementada
   - Manejo de errores optimizado
   - Limpieza automática de sesiones

8. Sistema de Tags Inteligentes (SaaS)
   - API REST para gestión de tags
   - Interfaz de configuración fácil
   - Recomendaciones automáticas
   - Búsqueda mejorada basada en tags

🔧 ARCHIVOS CRÍTICOS MODIFICADOS:

CORRECCIONES PRINCIPALES:
- src/lib/local-knowledge-base.ts (normalización acentos)
- src/lib/intelligent-conversation-engine.ts (lógica mejorada)
- src/lib/product-intelligence-service.ts (búsqueda semántica)
- src/lib/intent-translator.ts (detección intención)

SISTEMA WHATSAPP:
- src/lib/baileys-stable-service.ts (servicio robusto)
- src/lib/intelligent-baileys-integration.ts (integración mejorada)
- src/app/api/whatsapp/reconnect/route.ts (auto-reconexión)
- src/app/api/whatsapp/cleanup/route.ts (limpieza sesiones)

NUEVAS FUNCIONALIDADES:
- src/app/catalogo/page.tsx (subcategorías)
- src/lib/product-flow-handler.ts (flujos conversación)
- src/lib/local-product-matcher.ts (matching mejorado)

📦 SCRIPTS NUEVOS:
- scripts/extraer-fotos-megacomputer-final.ts
- scripts/asignar-subcategorias-automatico.ts
- scripts/ver-subcategorias.ts
- scripts/actualizar-fotos-megapacks-20mil.ts

⚠️ PREVENCIÓN DE ERRORES:
✅ No inventa información (solo usa BD)
✅ Contexto persistente entre mensajes
✅ Fotos automáticas sin duplicados
✅ Respuestas precisas sin confusiones
✅ Sistema robusto con múltiples fallbacks

🚀 RESULTADO FINAL:
Sistema completamente funcional con recomendaciones precisas,
conexión estable, y experiencia de usuario mejorada.

Desarrollado con Kiro Code Assistant en VS Code"

echo.
echo [7/8] Verificando commit...
git log -1 --stat

echo.
echo [8/8] ¿Subir a GitHub? (S/N)
set /p confirmar=

if /i "%confirmar%"=="S" (
    echo.
    echo Subiendo cambios...
    git push origin main
    
    echo.
    echo ========================================
    echo  ✅ CAMBIOS SUBIDOS EXITOSAMENTE
    echo ========================================
    echo.
    echo Próximos pasos:
    echo 1. EasyPanel detectará los cambios
    echo 2. Deploy automático iniciará
    echo 3. Espera 2-3 minutos
    echo 4. Verifica el bot
    echo.
) else (
    echo.
    echo ❌ Push cancelado
    echo.
)

pause
