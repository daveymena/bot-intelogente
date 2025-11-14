@echo off
echo ========================================
echo  PREPARACION Y SUBIDA A GIT
echo ========================================
echo.

echo [1/5] Auditoria del sistema...
npx tsx scripts/auditoria-sistema-completa.ts

echo.
echo [2/5] Gestion de usuarios...
echo.
echo Opciones:
echo   1. Activar todos los usuarios
echo   2. Eliminar usuarios inactivos
echo   3. Dejar como esta
echo.
set /p opcion="Selecciona una opcion (1/2/3): "

if "%opcion%"=="1" (
    echo.
    echo Activando usuarios...
    npx tsx scripts/activar-todos-usuarios.ts
)

if "%opcion%"=="2" (
    echo.
    echo Eliminando usuarios inactivos...
    npx tsx scripts/limpiar-usuarios-inactivos.ts
)

echo.
echo [3/5] Preparando para Git...
npx tsx scripts/preparar-para-git.ts

echo.
echo [4/5] Verificando estado de Git...
git status

echo.
echo [5/5] Listo para subir!
echo.
echo Comandos para ejecutar:
echo   git add .
echo   git commit -m "feat: Sistema completo con scraper de fotos y auditoria"
echo   git push
echo.
echo Deseas ejecutar estos comandos ahora? (S/N)
set /p ejecutar="Respuesta: "

if /i "%ejecutar%"=="S" (
    echo.
    echo Subiendo a Git...
    git add .
    git commit -m "feat: Sistema completo con scraper de fotos y auditoria"
    git push
    echo.
    echo ========================================
    echo  SUBIDO EXITOSAMENTE!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo  PREPARACION COMPLETADA
    echo ========================================
    echo.
    echo Ejecuta manualmente cuando estes listo:
    echo   git add .
    echo   git commit -m "feat: Sistema completo con scraper de fotos y auditoria"
    echo   git push
)

echo.
pause
