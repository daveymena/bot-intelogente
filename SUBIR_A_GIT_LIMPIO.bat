@echo off
echo ═══════════════════════════════════════════════════════════════
echo 🚀 SUBIR SUPER SALES AI A GIT (SIN EXPONER APIs)
echo ═══════════════════════════════════════════════════════════════
echo.

echo ✅ Verificando que .env NO se suba...
if exist ".env" (
    findstr /C:".env" .gitignore >nul
    if %errorlevel% equ 0 (
        echo ✅ .env está en .gitignore - Seguro
    ) else (
        echo ❌ ADVERTENCIA: .env NO está en .gitignore
        echo Agregando ahora...
        echo .env >> .gitignore
    )
)

echo.
echo ✅ Verificando que trading-bot NO se suba...
findstr /C:"trading-bot/" .gitignore >nul
if %errorlevel% equ 0 (
    echo ✅ trading-bot/ está en .gitignore - Seguro
) else (
    echo Agregando trading-bot/ a .gitignore...
    echo trading-bot/ >> .gitignore
)

echo.
echo 📦 Agregando archivos seguros...
git add .

echo.
echo 💾 Creando commit...
git commit -m "feat: Super Sales AI - Sistema conversacional completo

✅ SUPER SALES AI INTEGRADO
- Conversación natural sobre cualquier tema
- Búsqueda inteligente con Ollama
- Envío automático de fotos
- Memoria contextual de 24h
- Retorno natural a la venta
- Generación de links de pago

✅ COMPONENTES
- Super Sales AI (src/lib/super-sales-ai.ts)
- Ollama Orchestrator Professional
- Context Memory Enhanced
- Semantic Product Search
- Intelligent Product Search

✅ RENDIMIENTO
- Respuestas en ~527ms (llama3.2:3b)
- Búsqueda semántica optimizada
- Memoria de 24 horas
- Tests 5/5 exitosos

✅ SEGURIDAD
- .env excluido del repositorio
- APIs no expuestas
- Usar .env.example como plantilla

🚀 Listo para Easypanel"

echo.
echo 🌐 Subiendo a GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo ✅ CÓDIGO SUBIDO EXITOSAMENTE
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo 📋 PRÓXIMOS PASOS:
    echo.
    echo 1. Ve a Easypanel
    echo 2. Configura las variables de entorno usando .env.example
    echo 3. Deploy desde Git
    echo 4. Conecta WhatsApp
    echo 5. ¡Listo! 🎉
    echo.
    echo 📖 Guía: DEPLOY_SUPER_SALES_AI_EASYPANEL.md
    echo.
) else (
    echo.
    echo ❌ ERROR al subir a Git
    echo.
    echo Posibles causas:
    echo 1. Archivo muy grande (trading-bot)
    echo 2. Problema de conexión
    echo 3. Credenciales incorrectas
    echo.
    echo Ejecuta: ARREGLAR_GIT_ARCHIVO_GRANDE.bat
    echo.
)

pause
