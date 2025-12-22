@echo off
echo.
echo ========================================
echo   LIMPIAR TODO EL HISTORIAL
echo ========================================
echo.
echo ADVERTENCIA: Esto reescribira TODO el historial
echo.
pause
echo.

echo Paso 1: Limpiar historial con filter-branch...
git filter-branch --force --index-filter "git rm -rf --cached --ignore-unmatch trading-bot" --prune-empty --tag-name-filter cat -- --all
echo.

echo Paso 2: Limpiar referencias...
git for-each-ref --format="delete %%(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive
echo.

echo Paso 3: Agregar al .gitignore...
echo. >> .gitignore
echo # Excluir trading-bot >> .gitignore
echo trading-bot/ >> .gitignore
git add .gitignore
git commit -m "chore: Excluir trading-bot"
echo.

echo Paso 4: Push con force...
git push origin main --force
echo.

echo ========================================
echo   COMPLETADO
echo ========================================
echo.
pause
