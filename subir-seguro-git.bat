@echo off
echo ========================================
echo SUBIDA SEGURA A GIT
echo ========================================
echo.

echo [1/5] Verificando archivos sensibles...
if exist .env (
    echo ✓ .env encontrado (ignorado por .gitignore)
) else (
    echo ⚠ .env no encontrado
)

echo.
echo [2/5] Limpiando archivos temporales...
if exist temp\ rmdir /s /q temp 2>nul
if exist temp-audio\ rmdir /s /q temp-audio 2>nul
if exist auth_sessions\ (
    echo ✓ auth_sessions existe (ignorado por .gitignore)
)

echo.
echo [3/5] Verificando que secretos estén en .gitignore...
findstr /C:".env" .gitignore >nul
if %errorlevel%==0 (
    echo ✓ .env está en .gitignore
) else (
    echo ⚠ ADVERTENCIA: .env NO está en .gitignore
    pause
)

echo.
echo [4/5] Agregando cambios a Git...
git add .
if %errorlevel% neq 0 (
    echo ✗ Error al agregar archivos
    pause
    exit /b 1
)

echo.
echo [5/5] Creando commit...
git commit -m "feat: Mejoras finales - Sistema de respuestas progresivas, fallback local mejorado, búsqueda inteligente por tags"
if %errorlevel% neq 0 (
    echo ⚠ No hay cambios para commitear o error en commit
    pause
    exit /b 1
)

echo.
echo ========================================
echo ¿Deseas hacer PUSH a GitHub? (S/N)
echo ========================================
set /p confirm="> "

if /i "%confirm%"=="S" (
    echo.
    echo Subiendo a GitHub...
    git push origin main
    if %errorlevel% neq 0 (
        echo ✗ Error al hacer push
        echo Intentando con 'master'...
        git push origin master
        if %errorlevel% neq 0 (
            echo ✗ Error al hacer push a master también
            pause
            exit /b 1
        )
    )
    echo.
    echo ========================================
    echo ✓ SUBIDA EXITOSA A GIT
    echo ========================================
) else (
    echo.
    echo Commit creado localmente. No se hizo push.
)

echo.
pause
