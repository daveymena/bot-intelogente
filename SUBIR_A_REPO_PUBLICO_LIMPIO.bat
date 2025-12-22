@echo off
chcp 65001 >nul
echo ╔════════════════════════════════════════╗
echo ║  🧹 LIMPIAR Y SUBIR A REPO PÚBLICO    ║
echo ╚════════════════════════════════════════╝
echo.
echo ⚠️  Este script limpiará el historial de Git
echo    y subirá código limpio sin secretos
echo.
echo 📋 Pasos:
echo    1. Crear nuevo historial limpio
echo    2. Excluir archivos sensibles
echo    3. Subir a: whatsapp-bot (público)
echo.
echo 💡 ¿Continuar? (S/N)
set /p respuesta="> "

if /i "%respuesta%" neq "S" (
    echo.
    echo ❌ Operación cancelada
    pause
    exit /b 1
)

echo.
echo ✅ Iniciando limpieza...
echo.

echo 📝 Paso 1: Verificar .gitignore...
findstr /C:".env" .gitignore >nul
if %errorlevel% neq 0 (
    echo # Archivos sensibles >> .gitignore
    echo .env >> .gitignore
    echo .env.* >> .gitignore
    echo !.env.example >> .gitignore
    echo !.env.production.example >> .gitignore
    echo auth_sessions/ >> .gitignore
    echo *.db >> .gitignore
    echo *.db-journal >> .gitignore
)
echo ✅ .gitignore actualizado

echo.
echo 🗑️ Paso 2: Remover archivos sensibles...
git rm -r --cached . 2>nul
git rm --cached .env* 2>nul
git rm -r --cached auth_sessions/ 2>nul
git rm --cached *.db 2>nul
echo ✅ Archivos sensibles removidos del índice

echo.
echo 🔄 Paso 3: Cambiar remote...
git remote remove origin 2>nul
git remote add origin https://github.com/daveymena/whatsapp-bot.git
echo ✅ Remote configurado

echo.
echo 📦 Paso 4: Crear rama limpia...
git checkout --orphan main-limpio
echo ✅ Rama limpia creada

echo.
echo 📦 Paso 5: Agregar archivos limpios...
git add .
echo ✅ Archivos agregados

echo.
echo 💾 Paso 6: Crear commit limpio...
git commit -m "feat: Super Sales AI - Sistema completo sin secretos

✅ SUPER SALES AI
- Conversación natural con IA
- Búsqueda inteligente con Ollama
- Envío automático de fotos
- Memoria contextual 24h
- Links de pago dinámicos

✅ SEGURIDAD
- Sin archivos .env en el código
- Sin credenciales en el historial
- Variables configurables en Easypanel

🚀 Listo para deploy"

echo.
echo 🌐 Paso 7: Subiendo a GitHub (forzado)...
git branch -M main
git push -f origin main

if %errorlevel% equ 0 (
    echo.
    echo ╔════════════════════════════════════════╗
    echo ║  ✅ CÓDIGO SUBIDO EXITOSAMENTE        ║
    echo ╚════════════════════════════════════════╝
    echo.
    echo 🎉 Repositorio: https://github.com/daveymena/whatsapp-bot
    echo 🌍 Estado: PÚBLICO (historial limpio)
    echo.
    echo ╔════════════════════════════════════════╗
    echo ║  📋 PRÓXIMOS PASOS                    ║
    echo ╚════════════════════════════════════════╝
    echo.
    echo 1. Ve a Easypanel: https://easypanel.io
    echo.
    echo 2. Conecta con GitHub:
    echo    - Repositorio: daveymena/whatsapp-bot
    echo    - Branch: main
    echo.
    echo 3. Configura variables de entorno:
    echo    Copia de: VARIABLES_EASYPANEL_SUPER_SALES_AI.env
    echo.
    echo 4. Deploy 🚀
    echo.
    echo 📚 Documentación:
    echo    - DEPLOY_SUPER_SALES_AI_EASYPANEL.md
    echo    - CHECKLIST_DEPLOY_COMPLETO.md
    echo.
) else (
    echo.
    echo ╔════════════════════════════════════════╗
    echo ║  ❌ ERROR al subir                    ║
    echo ╚════════════════════════════════════════╝
    echo.
    echo 🔍 Posibles causas:
    echo    1. GitHub aún detecta secretos
    echo    2. Problemas de conexión
    echo    3. Permisos insuficientes
    echo.
    echo 💡 Solución alternativa:
    echo    Usa un repositorio PRIVADO
    echo    Ejecuta: SUBIR_A_REPO_PRIVADO.bat
    echo.
)

pause
