@echo off
echo ========================================
echo PREPARAR PROYECTO PARA GIT CON POSTGRESQL
echo ========================================
echo.

echo [1/5] Verificando que .env este en .gitignore...
findstr /C:".env" .gitignore >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ .env ya esta en .gitignore
) else (
    echo .env >> .gitignore
    echo ✓ .env agregado a .gitignore
)

echo.
echo [2/5] Generando cliente Prisma...
call npx prisma generate

echo.
echo [3/5] Verificando archivos a subir...
git status

echo.
echo [4/5] Agregando cambios al staging...
git add prisma/schema.prisma
git add .env.example
git add .gitignore
git add CONFIGURAR_POSTGRES_PRODUCCION.md

echo.
echo [5/5] Estado final...
git status

echo.
echo ========================================
echo LISTO PARA COMMIT
echo ========================================
echo.
echo Archivos preparados:
echo   - prisma/schema.prisma (actualizado a PostgreSQL)
echo   - .env.example (plantilla sin credenciales)
echo   - CONFIGURAR_POSTGRES_PRODUCCION.md (guia)
echo.
echo SIGUIENTE PASO:
echo   git commit -m "Actualizar a PostgreSQL para produccion"
echo   git push origin main
echo.
echo IMPORTANTE:
echo   - El archivo .env NO se subira (esta en .gitignore)
echo   - Las credenciales estan seguras
echo   - En Easypanel, configura DATABASE_URL manualmente
echo.
pause
