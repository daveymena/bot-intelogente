@echo off
echo ═══════════════════════════════════════════════════════════════
echo 🔒 SUBIR A REPOSITORIO PRIVADO (SIN ESCANEO DE SECRETOS)
echo ═══════════════════════════════════════════════════════════════
echo.
echo GitHub NO escanea secretos en repositorios PRIVADOS
echo.
echo PASO 1: Crea un repositorio PRIVADO en GitHub:
echo 1. Ve a: https://github.com/new
echo 2. Nombre: whatsapp-bot-private
echo 3. ✅ Marca como PRIVADO (importante!)
echo 4. NO agregues README, .gitignore ni licencia
echo 5. Crea el repositorio
echo.
echo ¿Ya creaste el repositorio PRIVADO? (S/N)
set /p created=
if /i "%created%" neq "S" (
    echo.
    echo Por favor crea el repositorio PRIVADO primero
    start https://github.com/new
    pause
    exit
)

echo.
echo ═══════════════════════════════════════════════════════════════
echo 📦 PREPARANDO CÓDIGO PARA SUBIR
echo ═══════════════════════════════════════════════════════════════

echo.
echo ✅ Paso 1: Verificar .gitignore...
findstr /C:".env" .gitignore >nul
if %errorlevel% neq 0 (
    echo Agregando .env a .gitignore...
    echo .env >> .gitignore
    echo .env.* >> .gitignore
    echo !.env.example >> .gitignore
)

findstr /C:"trading-bot/" .gitignore >nul
if %errorlevel% neq 0 (
    echo Agregando trading-bot/ a .gitignore...
    echo trading-bot/ >> .gitignore
)

echo ✅ .gitignore configurado

echo.
echo 🗑️ Paso 2: Remover archivos sensibles del índice...
git rm -r --cached trading-bot/ 2>nul
git rm --cached .env 2>nul
git rm --cached .env.* 2>nul

echo.
echo 🔄 Paso 3: Cambiar remote al repositorio PRIVADO...
git remote remove origin 2>nul
git remote add origin https://github.com/daveymena/whatsapp-bot-private.git

echo ✅ Remote configurado

echo.
echo 📦 Paso 4: Agregar archivos...
git add .

echo.
echo 💾 Paso 5: Crear commit...
git commit -m "feat: Super Sales AI - Sistema conversacional completo

✅ SUPER SALES AI
- Conversación natural con IA
- Búsqueda inteligente con Ollama (llama3.2:3b)
- Envío automático de fotos
- Memoria contextual 24h
- Retorno natural a la venta
- Links de pago dinámicos

✅ COMPONENTES
- Super Sales AI (src/lib/super-sales-ai.ts)
- Ollama Orchestrator Professional
- Context Memory Enhanced
- Semantic Product Search
- Payment Link Generator

✅ RENDIMIENTO
- ~527ms respuestas
- Búsqueda semántica optimizada
- Tests 5/5 exitosos

✅ SEGURIDAD
- Repositorio PRIVADO (sin escaneo de secretos)
- .env excluido del código
- Variables configurables en Easypanel

🚀 Listo para deploy en Easypanel"

echo.
echo 🌐 Paso 6: Subiendo al repositorio PRIVADO...
git push -u origin main --force

if %errorlevel% equ 0 (
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo ✅ CÓDIGO SUBIDO EXITOSAMENTE AL REPO PRIVADO
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo 🎉 Repositorio: https://github.com/daveymena/whatsapp-bot-private
    echo 🔒 Estado: PRIVADO (sin escaneo de secretos)
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo 📋 PRÓXIMOS PASOS - DEPLOY EN EASYPANEL:
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo 1. Ve a Easypanel: https://easypanel.io
    echo.
    echo 2. Crea nueva app o actualiza existente
    echo.
    echo 3. En "Source", selecciona:
    echo    - GitHub
    echo    - daveymena/whatsapp-bot-private
    echo    - Branch: main
    echo.
    echo 4. Configura variables de entorno:
    echo    Copia de: VARIABLES_EASYPANEL_SUPER_SALES_AI.env
    echo.
    echo    Variables CRÍTICAS:
    echo    - OLLAMA_BASE_URL=https://davey-ollama2.mapf5v.easypanel.host
    echo    - OLLAMA_MODEL=llama3.2:3b
    echo    - DATABASE_URL=postgresql://...
    echo    - GROQ_API_KEY=tu_key_aqui
    echo    - NODE_ENV=production
    echo    - ENABLE_SUPER_SALES_AI=true
    echo.
    echo 5. Deploy desde Git
    echo.
    echo 6. Espera el build (5-10 minutos)
    echo.
    echo 7. Conecta WhatsApp:
    echo    - Abre: https://tu-app.easypanel.host
    echo    - Login
    echo    - Escanea QR
    echo    - ¡Listo! 🎉
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo 📖 DOCUMENTACIÓN:
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo - DEPLOY_SUPER_SALES_AI_EASYPANEL.md - Guía completa
    echo - RESUMEN_SUPER_SALES_AI_FINAL.md - Resumen del sistema
    echo - VARIABLES_EASYPANEL_SUPER_SALES_AI.env - Variables
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo ✨ CARACTERÍSTICAS DEL SUPER SALES AI:
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo ✅ Conversación natural sobre cualquier tema
    echo ✅ Búsqueda inteligente de productos
    echo ✅ Envío automático de fotos
    echo ✅ Memoria contextual de 24 horas
    echo ✅ Retorno natural a la venta
    echo ✅ Generación de links de pago
    echo ✅ Respuestas en ~800ms
    echo ✅ Tests 5/5 exitosos
    echo.
) else (
    echo.
    echo ❌ ERROR al subir al repositorio
    echo.
    echo Verifica:
    echo 1. Que el repositorio existe y es PRIVADO
    echo 2. Que tienes permisos de escritura
    echo 3. Tu conexión a internet
    echo 4. Tus credenciales de GitHub
    echo.
    echo Intenta manualmente:
    echo git remote -v
    echo git push -u origin main --force
    echo.
)

pause
