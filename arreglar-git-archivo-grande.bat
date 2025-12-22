@echo off
echo ========================================
echo ARREGLAR ARCHIVO GRANDE EN GIT
echo ========================================
echo.
echo El problema: trading-bot/node_modules tiene archivos muy grandes
echo Solucion: Eliminar del repositorio y volver a intentar
echo.
pause

echo.
echo [1/5] Eliminando trading-bot del cache de Git...
git rm -r --cached trading-bot
if %errorlevel% neq 0 (
    echo ⚠️  trading-bot no estaba en Git o ya fue eliminado
)

echo.
echo [2/5] Verificando .gitignore...
findstr /C:"trading-bot/" .gitignore >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ trading-bot/ ya esta en .gitignore
) else (
    echo trading-bot/ >> .gitignore
    echo ✓ trading-bot/ agregado a .gitignore
)

echo.
echo [3/5] Agregando cambios...
git add .gitignore
git add .

echo.
echo [4/5] Creando commit...
git commit -m "Excluir trading-bot y archivos grandes del repositorio"

echo.
echo [5/5] Subiendo a GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo.
    echo ❌ Aun hay error. Intentando solucion alternativa...
    echo.
    echo Ejecutando limpieza profunda...
    git filter-branch --force --index-filter "git rm -rf --cached --ignore-unmatch trading-bot" --prune-empty --tag-name-filter cat -- --all
    
    echo.
    echo Forzando push...
    git push origin main --force
    
    if %errorlevel% neq 0 (
        echo.
        echo ❌ Error persistente. Solucion manual necesaria.
        echo.
        echo SOLUCION ALTERNATIVA:
        echo 1. Elimina la carpeta trading-bot completamente
        echo 2. Ejecuta: git add .
        echo 3. Ejecuta: git commit -m "Eliminar trading-bot"
        echo 4. Ejecuta: git push origin main --force
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo ✅ PROBLEMA RESUELTO
echo ========================================
echo.
echo trading-bot/ ha sido excluido del repositorio
echo Ahora puedes subir los cambios sin problemas
echo.
pause
