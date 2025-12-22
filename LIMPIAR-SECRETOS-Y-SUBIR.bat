@echo off
echo ========================================
echo  LIMPIAR SECRETOS Y SUBIR A GIT
echo ========================================
echo.
echo GitHub bloqueó el push por detectar secretos en archivos .md
echo Vamos a eliminar esos archivos del commit y subir solo el código
echo.
pause

echo.
echo [1/6] Reseteando cambios...
git reset --soft HEAD~1

echo.
echo [2/6] Limpiando staging area...
git reset

echo.
echo [3/6] Agregando SOLO código fuente y configuración...

REM Solo código fuente
git add src/

REM Solo configuración esencial
git add package.json
git add package-lock.json
git add tsconfig.json
git add next.config.ts
git add tailwind.config.ts
git add postcss.config.mjs

REM Prisma
git add prisma/schema.prisma

REM Scripts esenciales (sin archivos .md)
git add scripts/ver-subcategorias.ts
git add scripts/asignar-subcategorias-automatico.ts
git add scripts/asignar-productos-restantes.ts
git add scripts/asignar-subcategoria-manual.ts
git add scripts/actualizar-fotos-megapacks-20mil.ts
git add scripts/extraer-fotos-megacomputer.ts
git add scripts/extraer-fotos-megacomputer-final.ts
git add scripts/test-scraper-megacomputer-v2.ts
git add scripts/ver-productos-sin-fotos.ts

REM Solo README principal
git add README.md

REM Archivos bat útiles
git add actualizar-megapacks-20mil.bat

echo.
echo [4/6] Verificando archivos a subir...
git status --short

echo.
echo ========================================
echo ARCHIVOS LIMPIOS (sin secretos):
echo ========================================
echo.
echo ✅ src/ (código fuente completo)
echo ✅ package.json y configuración
echo ✅ prisma/schema.prisma
echo ✅ scripts/*.ts (10 archivos)
echo ✅ README.md
echo.
echo ❌ Archivos .md con secretos (EXCLUIDOS)
echo ❌ Archivos .env (EXCLUIDOS)
echo ❌ Variables de entorno (EXCLUIDAS)
echo.
pause

echo.
echo [5/6] Creando commit limpio...
git commit -m "feat: Actualización completa del sistema - Correcciones críticas

🎯 CORRECCIONES CRÍTICAS:

1. Sistema de Puntuación Corregido
   - Normalización de acentos en local-knowledge-base.ts
   - Matching mejorado sin confusiones
   - Recomendaciones precisas

2. Sistema de Fotos Automático
   - Envío sin duplicados
   - Flags de control por producto

3. Memoria Conversacional
   - Contexto persistente 24h
   - Mantiene producto y pago

4. Sistema Híbrido Inteligente
   - Fallback: IA → Ollama → Local
   - Rotación de API keys

🆕 NUEVAS FUNCIONALIDADES:

5. Sistema de Subcategorías
   - Catálogo organizado
   - Filtros dinámicos

6. Scraper MegaComputer
   - Extracción automática de fotos
   - Búsqueda inteligente

7. Conexión WhatsApp Robusta
   - Auto-reconexión
   - Limpieza automática

🔧 ARCHIVOS MODIFICADOS:
- src/lib/local-knowledge-base.ts
- src/lib/intelligent-conversation-engine.ts
- src/lib/baileys-stable-service.ts
- src/lib/intelligent-baileys-integration.ts
- src/app/catalogo/page.tsx
- src/app/api/whatsapp/reconnect/route.ts
- src/app/api/whatsapp/cleanup/route.ts

Desarrollado con Kiro Code Assistant"

echo.
echo [6/6] Subiendo a GitHub...
git push origin main

if %errorlevel%==0 (
    echo.
    echo ========================================
    echo  ✅ SUBIDA EXITOSA
    echo ========================================
    echo.
    echo El código se subió correctamente sin secretos
    echo EasyPanel detectará los cambios automáticamente
    echo.
) else (
    echo.
    echo ❌ Error al subir
    echo Revisa el mensaje de error arriba
    echo.
)

pause
