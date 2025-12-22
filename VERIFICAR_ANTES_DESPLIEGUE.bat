@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     VERIFICACIÓN PRE-DESPLIEGUE - EASYPANEL               ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

set ERRORS=0
set WARNINGS=0

echo 📁 VERIFICANDO ARCHIVOS CRÍTICOS...
echo ────────────────────────────────────────────────────────────

REM Verificar archivos críticos
if exist "src\lib\local-knowledge-base.ts" (
    echo ✓ local-knowledge-base.ts
) else (
    echo ✗ FALTA: local-knowledge-base.ts
    set ERRORS=1
)

if exist "src\lib\intelligent-conversation-engine.ts" (
    echo ✓ intelligent-conversation-engine.ts
) else (
    echo ✗ FALTA: intelligent-conversation-engine.ts
    set ERRORS=1
)

if exist "src\lib\product-intelligence-service.ts" (
    echo ✓ product-intelligence-service.ts
) else (
    echo ✗ FALTA: product-intelligence-service.ts
    set ERRORS=1
)

if exist "src\lib\local-product-matcher.ts" (
    echo ✓ local-product-matcher.ts
) else (
    echo ✗ FALTA: local-product-matcher.ts
    set ERRORS=1
)

if exist "src\lib\product-flow-handler.ts" (
    echo ✓ product-flow-handler.ts
) else (
    echo ✗ FALTA: product-flow-handler.ts
    set ERRORS=1
)

echo.
echo 🔧 VERIFICANDO CONFIGURACIÓN...
echo ────────────────────────────────────────────────────────────

if exist "package.json" (
    echo ✓ package.json existe
) else (
    echo ✗ FALTA: package.json
    set ERRORS=1
)

if exist "tsconfig.json" (
    echo ✓ tsconfig.json existe
) else (
    echo ✗ FALTA: tsconfig.json
    set ERRORS=1
)

if exist "next.config.ts" (
    echo ✓ next.config.ts existe
) else (
    echo ✗ FALTA: next.config.ts
    set ERRORS=1
)

if exist "prisma\schema.prisma" (
    echo ✓ schema.prisma existe
) else (
    echo ✗ FALTA: schema.prisma
    set ERRORS=1
)

echo.
echo 🔒 VERIFICANDO SEGURIDAD...
echo ────────────────────────────────────────────────────────────

if exist ".env" (
    echo ⚠ .env existe localmente (NO se subirá)
    findstr /C:".env" .gitignore >nul
    if %errorlevel%==0 (
        echo ✓ .env está protegido en .gitignore
    ) else (
        echo ✗ PELIGRO: .env NO está en .gitignore
        set ERRORS=1
    )
) else (
    echo ⚠ .env no encontrado (normal si ya está en Easypanel)
)

if exist "auth_sessions\" (
    echo ⚠ auth_sessions existe localmente (NO se subirá)
    findstr /C:"auth_sessions" .gitignore >nul
    if %errorlevel%==0 (
        echo ✓ auth_sessions está protegido
    ) else (
        echo ✗ PELIGRO: auth_sessions NO está protegido
        set ERRORS=1
    )
)

echo.
echo 📦 VERIFICANDO DEPENDENCIAS...
echo ────────────────────────────────────────────────────────────

if exist "node_modules\" (
    echo ✓ node_modules existe
) else (
    echo ⚠ node_modules no existe (ejecutar npm install)
    set WARNINGS=1
)

if exist "package-lock.json" (
    echo ✓ package-lock.json existe
) else (
    echo ⚠ package-lock.json no existe
    set WARNINGS=1
)

echo.
echo 🧪 VERIFICANDO BUILD LOCAL...
echo ────────────────────────────────────────────────────────────

if exist ".next\" (
    echo ✓ Build anterior encontrado
    echo   (Se recomienda hacer build fresco antes de desplegar)
) else (
    echo ⚠ No hay build previo
    echo   Ejecuta: npm run build
    set WARNINGS=1
)

echo.
echo 📊 VERIFICANDO GIT...
echo ────────────────────────────────────────────────────────────

git status >nul 2>&1
if %errorlevel%==0 (
    echo ✓ Repositorio Git inicializado
    
    REM Verificar si hay cambios sin commitear
    git diff --quiet
    if %errorlevel% neq 0 (
        echo ⚠ Hay cambios sin commitear
        set WARNINGS=1
    ) else (
        echo ✓ No hay cambios pendientes
    )
    
    REM Verificar si hay commits sin push
    git log origin/main..HEAD >nul 2>&1
    if %errorlevel%==0 (
        echo ⚠ Hay commits sin hacer push
        set WARNINGS=1
    ) else (
        echo ✓ Todo está sincronizado con GitHub
    )
) else (
    echo ✗ No es un repositorio Git
    set ERRORS=1
)

echo.
echo ════════════════════════════════════════════════════════════

if %ERRORS% gtr 0 (
    echo.
    echo ╔════════════════════════════════════════════════════════════╗
    echo ║              ✗ VERIFICACIÓN FALLIDA                       ║
    echo ║         Hay %ERRORS% errores críticos                              ║
    echo ╚════════════════════════════════════════════════════════════╝
    echo.
    echo ❌ NO DESPLEGAR hasta corregir los errores
    echo.
    pause
    exit /b 1
)

if %WARNINGS% gtr 0 (
    echo.
    echo ╔════════════════════════════════════════════════════════════╗
    echo ║              ⚠ VERIFICACIÓN CON ADVERTENCIAS              ║
    echo ║         Hay %WARNINGS% advertencias                                ║
    echo ╚════════════════════════════════════════════════════════════╝
    echo.
    echo Puedes continuar, pero se recomienda revisar las advertencias
    echo.
    set /p CONTINUAR="¿Continuar de todas formas? (S/N): "
    if /i not "%CONTINUAR%"=="S" (
        echo Operación cancelada
        pause
        exit /b 0
    )
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║              ✓ VERIFICACIÓN EXITOSA                       ║
echo ║         Todo listo para desplegar                         ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📋 CHECKLIST FINAL ANTES DE DESPLEGAR:
echo.
echo [ ] 1. Hacer backup de base de datos de producción
echo [ ] 2. Verificar variables de entorno en Easypanel
echo [ ] 3. Asegurar que DATABASE_URL esté correcta
echo [ ] 4. Verificar que GROQ_API_KEY esté configurada
echo [ ] 5. Confirmar que el volumen de auth_sessions esté montado
echo [ ] 6. Tener acceso al dashboard de Easypanel
echo [ ] 7. Notificar a usuarios de posible downtime (2-3 min)
echo.
echo 🚀 SIGUIENTE PASO:
echo    1. Ejecutar: SUBIR_CAMBIOS_SEGURO.bat
echo    2. Ir a Easypanel y hacer Redeploy
echo    3. Seguir guía: DESPLIEGUE_EASYPANEL_COMPLETO.md
echo.
pause
