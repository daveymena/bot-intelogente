@echo off
echo ========================================
echo  VERIFICACIÓN PRE-COMMIT
echo ========================================
echo.

echo [1/5] Verificando archivos sensibles...
echo.

REM Verificar que .env no esté en staging
git diff --cached --name-only | findstr /i "\.env" >nul
if %errorlevel%==0 (
    echo ❌ ADVERTENCIA: .env está en staging
    echo    Ejecuta: git reset .env
    echo.
    pause
    exit /b 1
)

REM Verificar que auth_sessions no esté en staging
git diff --cached --name-only | findstr /i "auth_sessions" >nul
if %errorlevel%==0 (
    echo ❌ ADVERTENCIA: auth_sessions está en staging
    echo    Ejecuta: git reset auth_sessions/
    echo.
    pause
    exit /b 1
)

echo ✅ No hay archivos sensibles en staging
echo.

echo [2/5] Verificando .gitignore...
if exist .gitignore (
    findstr /i "\.env" .gitignore >nul
    if %errorlevel%==0 (
        echo ✅ .env está en .gitignore
    ) else (
        echo ⚠️  .env NO está en .gitignore
    )
    
    findstr /i "auth_sessions" .gitignore >nul
    if %errorlevel%==0 (
        echo ✅ auth_sessions está en .gitignore
    ) else (
        echo ⚠️  auth_sessions NO está en .gitignore
    )
) else (
    echo ❌ .gitignore no existe
)
echo.

echo [3/5] Archivos modificados:
git diff --name-only
echo.

echo [4/5] Archivos nuevos:
git ls-files --others --exclude-standard
echo.

echo [5/5] Resumen de cambios:
git status --short
echo.

echo ========================================
echo  VERIFICACIÓN COMPLETADA
echo ========================================
echo.
echo Si todo está correcto, ejecuta:
echo SUBIR-CAMBIOS-COMPLETO.bat
echo.
pause
