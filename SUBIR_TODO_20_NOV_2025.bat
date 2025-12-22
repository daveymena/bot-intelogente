@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 SUBIR TODOS LOS CAMBIOS - 20 NOV 2025
echo ========================================
echo.

echo [1/6] 📊 Verificando estado de Git...
git status
echo.

echo [2/6] ➕ Agregando TODOS los archivos modificados...
echo.

REM === AGENTES Y SISTEMA DE MEMORIA ===
echo ✅ Agentes y Sistema de Memoria...
git add src/agents/shared-memory.ts
git add src/agents/payment-agent.ts
git add src/agents/search-agent.ts
git add src/agents/product-agent.ts
git add src/agents/utils/intent-detector.ts
git add src/agents/agent-orchestrator-wrapper.ts
git add src/agents/orchestrator.ts
git add src/agents/greeting-agent.ts
git add src/agents/photo-agent.ts
git add src/agents/closing-agent.ts
git add src/agents/deep-reasoning-agent.ts

REM === LANDING PAGES ===
echo ✅ Landing Pages...
git add src/app/landing/
git add "src/app/landing/[productId]/page.tsx"

REM === TIENDA ===
echo ✅ Tienda...
git add src/app/catalogo/
git add src/components/ProductCard.tsx
git add src/components/ProductGrid.tsx

REM === DASHBOARD Y COMPONENTES ===
echo ✅ Dashboard y Componentes...
git add src/components/dashboard/
git add src/components/dashboard/WhatsAppConnection.tsx
git add src/app/api/whatsapp/cleanup/route.ts

REM === BAILEYS Y WHATSAPP ===
echo ✅ Baileys y WhatsApp...
git add src/lib/baileys-stable-service.ts
git add src/lib/baileys-service.ts

REM === DOCUMENTACIÓN ===
echo ✅ Documentación...
git add RESUMEN_CAMBIOS_20_NOV_2025.md
git add RESUMEN_FINAL_SESION_20_NOV_2025.md
git add CORRECCION_MEMORIA_COMPARTIDA_COMPLETA.md
git add CORRECCION_PRIORIDAD_INTENCIONES.md
git add CORRECCION_BUSQUEDA_PRODUCTOS_ESPECIFICOS.md
git add SISTEMA_MEMORIA_COMPARTIDA_MEJORADO.md
git add CORRECCION_ERROR_JSON_IMAGENES.md
git add CORRECCION_PRODUCTOS_DIGITALES_VS_FISICOS.md
git add CORRECCIONES_FOTOS_Y_VELOCIDAD.md
git add CORRECCIONES_APLICADAS_FINAL.md
git add BOTON_LIMPIEZA_PROFUNDA_DASHBOARD.md
git add IMAGENES_MEGAPACKS_ACTUALIZADAS.md
git add DESPLEGAR_EASYPANEL_20_NOV.md
git add ANALISIS_LOGS_WHATSAPP.md

REM === SCRIPTS DE UTILIDAD ===
echo ✅ Scripts de utilidad...
git add actualizar-imagen-megapacks.js
git add limpiar-whatsapp-nuevo.ps1
git add cerrar-puerto-4000.ps1

REM === TESTS ===
echo ✅ Tests...
git add test-memoria-compartida.js
git add test-deteccion-intencion.js
git add test-scoring-piano.js
git add test-busqueda-curso-piano.js
git add test-busqueda-piano.js

echo.
echo [3/6] 📝 Creando commit completo...
git commit -m "feat: Actualizacion completa sistema 20 Nov 2025

🎯 SISTEMA DE AGENTES MEJORADO
- Memoria compartida entre agentes
- Prioridad de intenciones corregida
- Busqueda de productos especificos mejorada
- Extraccion de producto en mensaje de pago
- Scoring inteligente para productos unicos

🎨 LANDING PAGES
- Landing pages dinamicas por producto
- Diseño profesional y responsive
- Imagenes de productos optimizadas
- SEO mejorado

🛍️ TIENDA
- Catalogo publico mejorado
- Cards de productos optimizadas
- Imagenes de megapacks actualizadas
- Filtros y busqueda mejorados

🔧 DASHBOARD
- Boton de limpieza profunda WhatsApp
- Componente WhatsAppConnection mejorado
- API de limpieza de sesiones

📱 WHATSAPP
- Baileys estable y optimizado
- Manejo de errores mejorado
- Logs mas claros y utiles
- Scripts de limpieza automatica

🐛 FIXES
- Bot encuentra productos especificos correctamente
- Seleccion de metodo de pago no busca productos nuevos
- Palabras unicas (piano, guitarra) priorizan productos especificos
- Mega Packs solo aparecen si usuario busca 'pack'
- Imagenes de productos se muestran correctamente
- Landing pages funcionan sin errores

📚 DOCUMENTACION
- Documentacion completa de cambios
- Guias de despliegue actualizadas
- Tests documentados
- Troubleshooting mejorado
"

echo.
echo [4/6] 🔍 Verificando commit...
git log -1 --stat

echo.
echo [5/6] ⬆️ Subiendo a GitHub...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ SUBIDA EXITOSA
    echo ========================================
    echo.
    echo 📦 Cambios subidos:
    echo   - Sistema de agentes mejorado
    echo   - Landing pages dinamicas
    echo   - Tienda optimizada
    echo   - Dashboard mejorado
    echo   - WhatsApp estable
    echo   - Documentacion completa
    echo.
    echo [6/6] 🚀 SIGUIENTE PASO: EASYPANEL
    echo.
    echo 1. Ve a: https://easypanel.io
    echo 2. Abre tu proyecto: Smart Sales Bot Pro
    echo 3. Ve a "Source" ^> "Rebuild"
    echo 4. Espera 2-5 minutos
    echo 5. Verifica que todo funcione
    echo.
    echo 📖 Guia completa: DESPLEGAR_EASYPANEL_20_NOV.md
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ ERROR EN LA SUBIDA
    echo ========================================
    echo.
    echo Posibles causas:
    echo 1. No hay conexion a internet
    echo 2. Credenciales de Git incorrectas
    echo 3. Conflictos con el repositorio remoto
    echo.
    echo Solucion:
    echo   git pull origin main
    echo   git push origin main
    echo.
)

pause
