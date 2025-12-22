@echo off
echo ========================================
echo LIMPIAR HISTORIAL DE GIT
echo ========================================
echo.
echo ADVERTENCIA: Esto reescribira el historial de Git
echo Solo continua si estas seguro
echo.
pause

echo.
echo [1/3] Limpiando trading-bot del historial...
git filter-branch --force --index-filter "git rm -rf --cached --ignore-unmatch trading-bot" --prune-empty --tag-name-filter cat -- --all

echo.
echo [2/3] Limpiando referencias...
git for-each-ref --format="delete %%(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo.
echo [3/3] Subiendo cambios (forzado)...
git push origin main --force

if %errorlevel% neq 0 (
    echo.
    echo ❌ Error al subir
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ HISTORIAL LIMPIADO Y SUBIDO
echo ========================================
echo.
pause
