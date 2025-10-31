@echo off
echo ========================================
echo 🤖 INSTALADOR BOT SUPER INTELIGENTE
echo ========================================
echo.

echo 📦 Paso 1: Instalando dependencias...
call npm install

echo.
echo 🗄️ Paso 2: Configurando base de datos...
call npm run db:generate
call npm run db:push

echo.
echo 📝 Paso 3: Creando archivo .env...
if not exist .env (
    copy .env.example .env
    echo ✅ Archivo .env creado
    echo ⚠️  IMPORTANTE: Edita el archivo .env y agrega tu GROQ_API_KEY
) else (
    echo ℹ️  El archivo .env ya existe
)

echo.
echo ========================================
echo ✅ INSTALACIÓN COMPLETADA
echo ========================================
echo.
echo 📋 Próximos pasos:
echo 1. Edita el archivo .env y agrega tu GROQ_API_KEY
echo 2. Ejecuta: npm run dev
echo 3. Abre http://localhost:3000 en tu navegador
echo 4. Escanea el código QR con WhatsApp
echo.
echo 🚀 ¡Listo para usar!
echo.
pause
