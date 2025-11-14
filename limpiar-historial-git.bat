@echo off
echo ========================================
echo LIMPIANDO HISTORIAL DE GIT - SECRETOS
echo ========================================
echo.
echo ADVERTENCIA: Esto reescribira el historial de Git
echo.
pause

echo Paso 1: Eliminando archivos del historial...
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch CAMBIOS_VARIABLES_EASYPANEL.md VARIABLES_EASYPANEL_ACTUALIZADAS.txt AGREGAR_ESTAS_VARIABLES_EASYPANEL.txt VARIABLES_EASYPANEL_LISTAS.txt RESUMEN_SESION_COMPLETA_FINAL.md" --prune-empty --tag-name-filter cat -- --all

echo.
echo Paso 2: Limpiando referencias...
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo.
echo Paso 3: Haciendo push forzado...
git push origin --force --all

echo.
echo ========================================
echo LISTO! Historial limpiado
echo ========================================
pause
