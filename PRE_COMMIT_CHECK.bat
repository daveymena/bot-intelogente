@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║           VERIFICACIÓN PRE-COMMIT - SEGURIDAD              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

set ERRORS=0

echo 🔍 Verificando archivos sensibles...
echo ────────────────────────────────────────────────────────────

REM Verificar que .env no esté staged
git diff --cached --name-only | findstr /C:".env" >nul 2>&1
if %errorlevel%==0 (
    echo ✗ ERROR: Archivo .env está en staging
    set ERRORS=1
) else (
    echo ✓ .env no está en staging
)

REM Verificar que auth_sessions no esté staged
git diff --cached --name-only | findstr /C:"auth_sessions" >nul 2>&1
if %errorlevel%==0 (
    echo ✗ ERROR: Carpeta auth_sessions está en staging
    set ERRORS=1
) else (
    echo ✓ auth_sessions no está en staging
)

REM Verificar que archivos .db no estén staged
git diff --cached --name-only | findstr /C:".db" >nul 2>&1
if %errorlevel%==0 (
    echo ✗ ERROR: Archivos .db están en staging
    set ERRORS=1
) else (
    echo ✓ Archivos .db no están en staging
)

echo.
echo 🔑 Buscando API keys en el código...
echo ────────────────────────────────────────────────────────────

REM Buscar patrones de API keys en archivos staged
git diff --cached | findstr /R "GROQ_API_KEY.*=.*gsk_" >nul 2>&1
if %errorlevel%==0 (
    echo ✗ ERROR: Se encontró GROQ_API_KEY con valor
    set ERRORS=1
) else (
    echo ✓ No se encontró GROQ_API_KEY con valor
)

git diff --cached | findstr /R "OPENAI_API_KEY.*=.*sk-" >nul 2>&1
if %errorlevel%==0 (
    echo ✗ ERROR: Se encontró OPENAI_API_KEY con valor
    set ERRORS=1
) else (
    echo ✓ No se encontró OPENAI_API_KEY con valor
)

git diff --cached | findstr /R "DATABASE_URL.*=.*postgres://" >nul 2>&1
if %errorlevel%==0 (
    echo ✗ ERROR: Se encontró DATABASE_URL con valor
    set ERRORS=1
) else (
    echo ✓ No se encontró DATABASE_URL con valor
)

git diff --cached | findstr /R "MERCADOPAGO_ACCESS_TOKEN.*=.*APP_USR" >nul 2>&1
if %errorlevel%==0 (
    echo ✗ ERROR: Se encontró MERCADOPAGO_ACCESS_TOKEN con valor
    set ERRORS=1
) else (
    echo ✓ No se encontró MERCADOPAGO_ACCESS_TOKEN con valor
)

echo.
echo 📁 Verificando estructura de archivos...
echo ────────────────────────────────────────────────────────────

if exist .gitignore (
    echo ✓ .gitignore existe
) else (
    echo ✗ ERROR: .gitignore no existe
    set ERRORS=1
)

if exist package.json (
    echo ✓ package.json existe
) else (
    echo ✗ ERROR: package.json no existe
    set ERRORS=1
)

if exist tsconfig.json (
    echo ✓ tsconfig.json existe
) else (
    echo ✗ ERROR: tsconfig.json no existe
    set ERRORS=1
)

echo.
echo ════════════════════════════════════════════════════════════

if %ERRORS%==0 (
    echo.
    echo ╔════════════════════════════════════════════════════════════╗
    echo ║              ✓ VERIFICACIÓN EXITOSA                       ║
    echo ║         Es seguro continuar con el commit                 ║
    echo ╚════════════════════════════════════════════════════════════╝
    echo.
    echo Puedes ejecutar ahora: SUBIR_CAMBIOS_SEGURO.bat
    echo.
    exit /b 0
) else (
    echo.
    echo ╔════════════════════════════════════════════════════════════╗
    echo ║              ✗ VERIFICACIÓN FALLIDA                       ║
    echo ║         NO es seguro hacer commit ahora                   ║
    echo ╚════════════════════════════════════════════════════════════╝
    echo.
    echo Por favor corrige los errores antes de continuar.
    echo.
    echo Acciones sugeridas:
    echo 1. Ejecuta: git reset HEAD
    echo 2. Revisa los archivos mencionados
    echo 3. Actualiza .gitignore si es necesario
    echo 4. Vuelve a intentar
    echo.
    exit /b 1
)

pause
