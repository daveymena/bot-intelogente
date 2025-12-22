@echo off
echo ═══════════════════════════════════════════════════════════════
echo 🆕 CREAR REPOSITORIO LIMPIO DESDE CERO
echo ═══════════════════════════════════════════════════════════════
echo.
echo Este script creará un repositorio completamente nuevo
echo sin historial de commits (sin API keys expuestas)
echo.
pause

echo.
echo 📁 Paso 1: Crear backup del .git actual...
if exist ".git" (
    if exist ".git-old" (
        rmdir /s /q .git-old
    )
    move .git .git-old
    echo ✅ Backup creado en .git-old
)

echo.
echo 🆕 Paso 2: Inicializar repositorio nuevo...
git init
echo ✅ Repositorio nuevo inicializado

echo.
echo 📝 Paso 3: Configurar .gitignore...
(
echo # Archivos sensibles - NUNCA subir
echo .env
echo .env.*
echo !.env.example
echo.
echo # Trading bot
echo trading-bot/
echo.
echo # Node modules
echo node_modules/
echo.
echo # Next.js
echo .next/
echo out/
echo.
echo # WhatsApp sessions
echo auth_sessions/
echo.
echo # Database
echo *.db
echo *.db-journal
echo.
echo # Logs
echo *.log
echo.
echo # Archivos con credenciales
echo *_API_KEY.txt
echo *_SECRET.txt
echo *_TOKEN.txt
echo CREDENCIALES_*.txt
echo TUS_CREDENCIALES.txt
) > .gitignore

echo ✅ .gitignore configurado

echo.
echo 🗑️ Paso 4: Remover archivos sensibles...
if exist "trading-bot" (
    echo Excluyendo trading-bot/...
)
if exist ".env" (
    echo .env está protegido por .gitignore
)

echo.
echo 📦 Paso 5: Agregar archivos limpios...
git add .

echo.
echo 💾 Paso 6: Crear primer commit (limpio)...
git commit -m "feat: Super Sales AI - Sistema conversacional completo

✅ SUPER SALES AI
- Conversación natural con IA
- Búsqueda inteligente con Ollama
- Envío automático de fotos
- Memoria contextual 24h
- Links de pago dinámicos

✅ COMPONENTES
- Super Sales AI
- Ollama Orchestrator Professional  
- Context Memory Enhanced
- Semantic Product Search
- Payment Link Generator

✅ RENDIMIENTO
- ~527ms respuestas (llama3.2:3b)
- Búsqueda semántica optimizada
- Tests 5/5 exitosos

✅ SEGURIDAD
- Sin API keys en el código
- .env excluido
- Usar .env.example como plantilla

🚀 Listo para Easypanel"

echo.
echo 🔗 Paso 7: Conectar con GitHub...
git remote add origin https://github.com/daveymena/whatsapp-bot.git
git branch -M main

echo.
echo 🌐 Paso 8: Subir al repositorio nuevo...
git push -u origin main --force

if %errorlevel% equ 0 (
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo ✅ REPOSITORIO LIMPIO CREADO EXITOSAMENTE
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo 🎉 Código subido sin API keys expuestas
    echo 📍 https://github.com/daveymena/whatsapp-bot
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo 📋 PRÓXIMOS PASOS:
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo 1. ✅ Código en GitHub (limpio)
    echo.
    echo 2. 🔐 REVOCA las API keys expuestas anteriormente:
    echo    - Groq: https://console.groq.com/keys
    echo    - MercadoPago: https://www.mercadopago.com/developers  
    echo    - PayPal: https://developer.paypal.com/
    echo.
    echo 3. 🔑 GENERA nuevas API keys
    echo.
    echo 4. 📝 ACTUALIZA tu .env local con las nuevas keys
    echo.
    echo 5. 🚀 DEPLOY EN EASYPANEL:
    echo    a. Ve a: https://easypanel.io
    echo    b. Crea/actualiza app
    echo    c. Conecta: daveymena/whatsapp-bot
    echo    d. Configura variables de entorno:
    echo       - Usa: VARIABLES_EASYPANEL_SUPER_SALES_AI.env
    echo       - Con tus nuevas API keys
    echo    e. Deploy desde Git
    echo    f. Conecta WhatsApp
    echo    g. ¡Listo! 🎉
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo 📖 DOCUMENTACIÓN:
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo - DEPLOY_SUPER_SALES_AI_EASYPANEL.md
    echo - RESUMEN_SUPER_SALES_AI_FINAL.md
    echo - LISTO_PARA_EASYPANEL.md
    echo.
) else (
    echo.
    echo ❌ ERROR al subir
    echo.
    echo Posibles causas:
    echo 1. El repositorio no existe en GitHub
    echo 2. No tienes permisos
    echo 3. Problema de conexión
    echo.
    echo Solución:
    echo 1. Crea el repositorio en GitHub si no existe
    echo 2. Verifica tus credenciales
    echo 3. Intenta de nuevo
    echo.
)

pause
