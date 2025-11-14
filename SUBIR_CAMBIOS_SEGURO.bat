@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║         SUBIDA SEGURA A GIT - SMART SALES BOT PRO         ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo 📋 PASO 1: Verificando estado actual de Git...
echo ────────────────────────────────────────────────────────────
git status --short
echo.

echo 🔒 PASO 2: Verificando archivos sensibles...
echo ────────────────────────────────────────────────────────────

set SAFE=1

if exist .env (
    findstr /C:".env" .gitignore >nul
    if %errorlevel%==0 (
        echo ✓ .env está protegido por .gitignore
    ) else (
        echo ✗ PELIGRO: .env NO está en .gitignore
        set SAFE=0
    )
) else (
    echo ⚠ .env no encontrado
)

if exist auth_sessions\ (
    findstr /C:"auth_sessions" .gitignore >nul
    if %errorlevel%==0 (
        echo ✓ auth_sessions está protegido
    ) else (
        echo ✗ PELIGRO: auth_sessions NO está protegido
        set SAFE=0
    )
)

if exist llm-config.json (
    findstr /C:"llm-config.json" .gitignore >nul
    if %errorlevel%==0 (
        echo ✓ llm-config.json está protegido
    ) else (
        echo ⚠ ADVERTENCIA: llm-config.json podría contener secretos
    )
)

echo.

if %SAFE%==0 (
    echo ╔════════════════════════════════════════════════════════════╗
    echo ║  ⚠️  ARCHIVOS SENSIBLES NO PROTEGIDOS - ABORTANDO         ║
    echo ╚════════════════════════════════════════════════════════════╝
    pause
    exit /b 1
)

echo 🧹 PASO 3: Limpiando archivos temporales...
echo ────────────────────────────────────────────────────────────
if exist temp\ (
    rmdir /s /q temp 2>nul
    echo ✓ Carpeta temp eliminada
)
if exist temp-audio\ (
    rmdir /s /q temp-audio 2>nul
    echo ✓ Carpeta temp-audio eliminada
)
echo.

echo 📝 PASO 4: Preparando commit...
echo ────────────────────────────────────────────────────────────
echo.
echo Mensaje del commit:
echo "feat: Sistema completo de respuestas inteligentes
echo.
echo - Sistema de respuestas progresivas implementado
echo - Fallback local mejorado con AIDA
echo - Búsqueda inteligente por tags (diseño, reparación, piano)
echo - Razonamiento profundo activado
echo - Mejoras en consistencia de productos
echo - Flujos específicos por tipo de producto
echo - Sistema de puntos mejorado para scoring
echo - Verificación de acceso a productos
echo - Correcciones en envío de fotos
echo - Limpieza y optimización de código"
echo.

set /p CONTINUAR="¿Continuar con este mensaje? (S/N): "
if /i not "%CONTINUAR%"=="S" (
    echo Operación cancelada
    pause
    exit /b 0
)

echo.
echo 📦 PASO 5: Agregando archivos a Git...
echo ────────────────────────────────────────────────────────────
git add .
if %errorlevel% neq 0 (
    echo ✗ Error al agregar archivos
    pause
    exit /b 1
)
echo ✓ Archivos agregados
echo.

echo 💾 PASO 6: Creando commit...
echo ────────────────────────────────────────────────────────────
git commit -m "feat: Sistema completo de respuestas inteligentes" -m "- Sistema de respuestas progresivas implementado" -m "- Fallback local mejorado con AIDA" -m "- Búsqueda inteligente por tags (diseño, reparación, piano)" -m "- Razonamiento profundo activado" -m "- Mejoras en consistencia de productos" -m "- Flujos específicos por tipo de producto" -m "- Sistema de puntos mejorado para scoring" -m "- Verificación de acceso a productos" -m "- Correcciones en envío de fotos" -m "- Limpieza y optimización de código"

if %errorlevel% neq 0 (
    echo ⚠ No hay cambios para commitear o error en commit
    pause
    exit /b 1
)
echo ✓ Commit creado exitosamente
echo.

echo 🚀 PASO 7: Subiendo a GitHub...
echo ────────────────────────────────────────────────────────────
set /p PUSH="¿Hacer PUSH a GitHub ahora? (S/N): "
if /i not "%PUSH%"=="S" (
    echo.
    echo ✓ Commit guardado localmente
    echo   Puedes hacer push más tarde con: git push origin main
    pause
    exit /b 0
)

echo.
echo Intentando push a 'main'...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo Intentando push a 'master'...
    git push origin master
    if %errorlevel% neq 0 (
        echo.
        echo ✗ Error al hacer push
        echo.
        echo Posibles soluciones:
        echo 1. Verifica tu conexión a internet
        echo 2. Verifica tus credenciales de Git
        echo 3. Intenta: git pull origin main --rebase
        echo 4. Luego: git push origin main
        pause
        exit /b 1
    )
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║            ✓ SUBIDA EXITOSA A GITHUB                      ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📊 Resumen de cambios subidos:
git log -1 --stat
echo.
pause
