@echo off
echo.
echo ========================================
echo   LIMPIANDO SECRETS DEL HISTORIAL GIT
echo ========================================
echo.

echo [1/3] Removiendo archivo con secrets del historial...
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch RESUMEN_TRABAJO_COMPLETO_FINAL.md" --prune-empty --tag-name-filter cat -- --all

echo.
echo [2/3] Limpiando referencias...
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo.
echo [3/3] Forzando push limpio...
git push origin main --force

echo.
echo ========================================
echo   LIMPIEZA COMPLETADA
echo ========================================
echo.
pause
