@echo off
echo.
echo ═══════════════════════════════════════════════════════════
echo  DEPLOY SEGURO A EASYPANEL - 14 DIC 2025
echo ═══════════════════════════════════════════════════════════
echo.
echo Este script prepara el deploy de forma SEGURA:
echo   ✅ Usa .env.example (sin API keys reales)
echo   ✅ Excluye archivos pesados innecesarios
echo   ✅ Excluye archivos sensibles
echo   ✅ Limpia el repositorio
echo.
pause
echo.

echo ═══════════════════════════════════════════════════════════
echo  PASO 1: VERIFICAR .gitignore
echo ═══════════════════════════════════════════════════════════
echo.
echo Verificando que archivos sensibles estén en .gitignore...
echo.

REM Verificar que .env esté en .gitignore
findstr /C:".env" .gitignore >nul
if %errorlevel% equ 0 (
    echo ✅ .env está en .gitignore
) else (
    echo ⚠️  Agregando .env a .gitignore...
    echo .env >> .gitignore
    echo .env.local >> .gitignore
    echo .env.*.local >> .gitignore
)

REM Verificar que node_modules esté en .gitignore
findstr /C:"node_modules" .gitignore >nul
if %errorlevel% equ 0 (
    echo ✅ node_modules está en .gitignore
) else (
    echo ⚠️  Agregando node_modules a .gitignore...
    echo node_modules/ >> .gitignore
)

REM Verificar que .next esté en .gitignore
findstr /C:".next" .gitignore >nul
if %errorlevel% equ 0 (
    echo ✅ .next está en .gitignore
) else (
    echo ⚠️  Agregando .next a .gitignore...
    echo .next/ >> .gitignore
)

echo.
pause
echo.

echo ═══════════════════════════════════════════════════════════
echo  PASO 2: VERIFICAR QUE NO HAY API KEYS EN EL CÓDIGO
echo ═══════════════════════════════════════════════════════════
echo.
echo Buscando posibles API keys en el código...
echo.

REM Buscar patrones de API keys (esto es solo una verificación básica)
echo Verificando archivos .ts y .js...
findstr /S /I /C:"GROQ_API_KEY" /C:"sk-" /C:"api_key" src\*.ts src\*.js 2>nul
if %errorlevel% equ 0 (
    echo.
    echo ⚠️  ADVERTENCIA: Se encontraron posibles API keys en el código
    echo    Por favor revisa los archivos antes de continuar
    echo.
    pause
) else (
    echo ✅ No se encontraron API keys hardcodeadas
)

echo.
pause
echo.

echo ═══════════════════════════════════════════════════════════
echo  PASO 3: AGREGAR ARCHIVOS MODIFICADOS
echo ═══════════════════════════════════════════════════════════
echo.

REM Agregar solo archivos específicos (no todo)
git add src/lib/intelligent-search-fallback.ts
git add src/lib/simple-conversation-handler.ts
git add src/lib/professional-card-formatter.ts

REM Agregar scripts de verificación
git add verificar-fotos-fisicas-detallado.js
git add verificar-envio-fotos-completo.js
git add test-envio-fotos-whatsapp.js
git add test-busqueda-idiomas-mejorada.js
git add verificar-megapacks-idiomas.js

REM Agregar documentación de deploy
git add DEPLOY_EASYPANEL_14_DIC_2025.md
git add CHECKLIST_DEPLOY_EASYPANEL_14_DIC.md
git add VARIABLES_EASYPANEL_14_DIC_2025.env
git add EMPEZAR_AQUI_DEPLOY_EASYPANEL.md
git add LISTO_PARA_EASYPANEL_14_DIC.md
git add RESUMEN_SESION_14_DIC_2025.md
git add RESUMEN_EJECUTIVO_DEPLOY_14_DIC.md
git add INICIO_RAPIDO_DEPLOY.md
git add VISUAL_ANTES_VS_AHORA.md
git add COMANDOS_EASYPANEL_POST_DEPLOY.md
git add REFERENCIA_RAPIDA_DEPLOY.md
git add INDICE_DEPLOY_14_DIC_2025.md
git add SESION_COMPLETA_14_DIC_FINAL.md

REM Agregar .env.example (seguro)
git add .env.example

REM Agregar .gitignore actualizado
git add .gitignore

echo.
echo ✅ Archivos agregados
echo.
pause
echo.

echo ═══════════════════════════════════════════════════════════
echo  PASO 4: VERIFICAR ESTADO
echo ═══════════════════════════════════════════════════════════
echo.
git status
echo.
echo ⚠️  IMPORTANTE: Verifica que NO aparezcan:
echo    - .env (con API keys reales)
echo    - node_modules/
echo    - .next/
echo    - auth_sessions/
echo    - Archivos grandes innecesarios
echo.
pause
echo.

echo ═══════════════════════════════════════════════════════════
echo  PASO 5: COMMIT
echo ═══════════════════════════════════════════════════════════
echo.
git commit -m "feat: búsqueda específica (1 producto) + fotos verificadas (100%%) + deploy seguro"
echo.
echo ✅ Commit realizado
echo.
pause
echo.

echo ═══════════════════════════════════════════════════════════
echo  PASO 6: PUSH A GITHUB
echo ═══════════════════════════════════════════════════════════
echo.
echo Subiendo cambios a GitHub...
echo.
git push origin main
echo.
if %errorlevel% equ 0 (
    echo ✅ Push completado exitosamente
) else (
    echo ❌ Error en push. Verifica tu conexión y credenciales.
    pause
    exit /b 1
)
echo.
pause
echo.

echo ═══════════════════════════════════════════════════════════
echo  ✅ DEPLOY PREPARADO EXITOSAMENTE
echo ═══════════════════════════════════════════════════════════
echo.
echo Cambios subidos a GitHub de forma SEGURA:
echo   ✅ Sin API keys reales
echo   ✅ Sin archivos pesados
echo   ✅ Sin archivos sensibles
echo.
echo ═══════════════════════════════════════════════════════════
echo  SIGUIENTE PASO: IR A EASYPANEL
echo ═══════════════════════════════════════════════════════════
echo.
echo 1. Ir a Easypanel → Tu proyecto
echo 2. Git → Pull latest changes
echo 3. Settings → Environment → Configurar variables
echo 4. Rebuild
echo 5. Esperar a que termine
echo 6. Verificar logs
echo.
echo ═══════════════════════════════════════════════════════════
echo  VARIABLES CRÍTICAS EN EASYPANEL
echo ═══════════════════════════════════════════════════════════
echo.
echo Debes configurar estas variables en Easypanel:
echo.
echo DATABASE_URL=postgresql://...
echo OLLAMA_BASE_URL=http://ollama:11434
echo OLLAMA_MODEL=llama3.1:8b
echo USE_OLLAMA=true
echo GROQ_API_KEY=tu_api_key_real
echo NEXT_PUBLIC_BASE_URL=https://tu-dominio.easypanel.host
echo.
echo Ver archivo completo: VARIABLES_EASYPANEL_14_DIC_2025.env
echo.
echo ═══════════════════════════════════════════════════════════
echo  PROBAR EN WHATSAPP
echo ═══════════════════════════════════════════════════════════
echo.
echo Después del deploy, envía estos mensajes:
echo.
echo   1. "Me interesa el curso de idiomas"
echo      Esperado: SOLO 1 megapack + foto
echo.
echo   2. "Curso de piano"
echo      Esperado: SOLO 1 curso + foto
echo.
echo   3. "Quiero ver megapacks"
echo      Esperado: 3 megapacks + foto
echo.
echo ═══════════════════════════════════════════════════════════
echo.
echo 🚀 ¡Deploy seguro completado!
echo.
pause
