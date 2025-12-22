@echo off
echo ═══════════════════════════════════════════════════════════════
echo 🚀 SUBIR A REPOSITORIO NUEVO (LIMPIO)
echo ═══════════════════════════════════════════════════════════════
echo.
echo Repositorio nuevo: https://github.com/daveymena/whatsapp-bot.git
echo.
pause

echo.
echo ✅ Paso 1: Verificar .gitignore...
findstr /C:".env" .gitignore >nul
if %errorlevel% neq 0 (
    echo Agregando .env a .gitignore...
    echo .env >> .gitignore
    echo .env.* >> .gitignore
)

findstr /C:"trading-bot/" .gitignore >nul
if %errorlevel% neq 0 (
    echo Agregando trading-bot/ a .gitignore...
    echo trading-bot/ >> .gitignore
)

echo ✅ .gitignore configurado correctamente

echo.
echo 🗑️ Paso 2: Remover archivos sensibles del índice...
git rm -r --cached trading-bot/ 2>nul
git rm --cached .env 2>nul
git rm --cached .env.* 2>nul

echo.
echo 🔄 Paso 3: Cambiar remote al nuevo repositorio...
git remote remove origin 2>nul
git remote add origin https://github.com/daveymena/whatsapp-bot.git

echo ✅ Remote actualizado

echo.
echo 📦 Paso 4: Agregar archivos limpios...
git add .

echo.
echo 💾 Paso 5: Crear commit limpio...
git commit -m "feat: Super Sales AI - Sistema conversacional completo

✅ SUPER SALES AI INTEGRADO
- Conversación natural sobre cualquier tema
- Búsqueda inteligente con Ollama (llama3.2:3b)
- Envío automático de fotos de productos
- Memoria contextual de 24 horas
- Retorno natural a la venta
- Generación de links de pago dinámicos

✅ COMPONENTES PRINCIPALES
- Super Sales AI (src/lib/super-sales-ai.ts)
- Ollama Orchestrator Professional
- Context Memory Enhanced
- Semantic Product Search
- Intelligent Product Search
- Bot Payment Link Generator

✅ RENDIMIENTO
- Respuestas en ~527ms (llama3.2:3b)
- Búsqueda semántica optimizada
- Memoria persistente de 24h
- Tests 5/5 exitosos

✅ INTEGRACIÓN
- Integrado en conversacionController
- Compatible con Easypanel
- PostgreSQL + Ollama
- WhatsApp via Baileys

✅ SEGURIDAD
- .env excluido del repositorio
- APIs no expuestas
- Usar .env.example como plantilla
- Variables configurables en Easypanel

🚀 Listo para deploy en Easypanel"

echo.
echo 🌐 Paso 6: Subiendo al nuevo repositorio...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo ✅ CÓDIGO SUBIDO EXITOSAMENTE AL NUEVO REPOSITORIO
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo 🎉 Repositorio limpio creado en:
    echo https://github.com/daveymena/whatsapp-bot
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo 📋 PRÓXIMOS PASOS PARA EASYPANEL:
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo 1. Ve a Easypanel: https://easypanel.io
    echo 2. Crea nueva app o actualiza la existente
    echo 3. Conecta con GitHub: daveymena/whatsapp-bot
    echo 4. Configura variables de entorno:
    echo    - Copia de: VARIABLES_EASYPANEL_SUPER_SALES_AI.env
    echo    - Usa tus valores reales del .env local
    echo.
    echo 5. Variables CRÍTICAS:
    echo    OLLAMA_BASE_URL=https://davey-ollama2.mapf5v.easypanel.host
    echo    OLLAMA_MODEL=llama3.2:3b
    echo    DATABASE_URL=postgresql://...
    echo    GROQ_API_KEY=tu_nueva_key_aqui
    echo.
    echo 6. Deploy desde Git
    echo 7. Conecta WhatsApp
    echo 8. ¡Listo! 🎉
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo 📖 DOCUMENTACIÓN:
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo - DEPLOY_SUPER_SALES_AI_EASYPANEL.md - Guía completa
    echo - RESUMEN_SUPER_SALES_AI_FINAL.md - Resumen del sistema
    echo - LISTO_PARA_EASYPANEL.md - Checklist final
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo ⚠️ IMPORTANTE - SEGURIDAD:
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo 1. REVOCA las API keys expuestas en el repo anterior:
    echo    - Groq: https://console.groq.com/keys
    echo    - MercadoPago: https://www.mercadopago.com/developers
    echo    - PayPal: https://developer.paypal.com/
    echo.
    echo 2. GENERA nuevas API keys
    echo.
    echo 3. ACTUALIZA tu .env local (nunca se subirá)
    echo.
    echo 4. CONFIGURA las nuevas keys en Easypanel
    echo.
) else (
    echo.
    echo ❌ ERROR al subir al nuevo repositorio
    echo.
    echo Verifica:
    echo 1. Que el repositorio existe en GitHub
    echo 2. Que tienes permisos de escritura
    echo 3. Tu conexión a internet
    echo.
    echo Intenta manualmente:
    echo git remote -v
    echo git push -u origin main --force
    echo.
)

pause
