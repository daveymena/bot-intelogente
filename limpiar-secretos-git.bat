@echo off
echo ========================================
echo LIMPIANDO SECRETOS DEL HISTORIAL DE GIT
echo ========================================
echo.

echo 1. Eliminando archivos con secretos del repositorio...
git rm --cached COPIAR_PEGAR_EASYPANEL_COMPLETO.txt 2>nul
git rm --cached VARIABLES_EASYPANEL_CORRECTAS_FINALES.txt 2>nul
git rm --cached COMANDOS_TERMINAL_EASYPANEL.txt 2>nul
git rm --cached SUBIR_CAMBIO_SCHEMA_AHORA.txt 2>nul

echo.
echo 2. Agregando archivos al .gitignore...
echo COPIAR_PEGAR_EASYPANEL_COMPLETO.txt >> .gitignore
echo VARIABLES_EASYPANEL_CORRECTAS_FINALES.txt >> .gitignore
echo COMANDOS_TERMINAL_EASYPANEL.txt >> .gitignore
echo SUBIR_CAMBIO_SCHEMA_AHORA.txt >> .gitignore
echo *EASYPANEL*.txt >> .gitignore
echo *VARIABLES*.txt >> .gitignore

echo.
echo 3. Haciendo commit de los cambios...
git add .gitignore
git commit -m "chore: Agregar archivos con secretos a .gitignore"

echo.
echo 4. Eliminando archivos del historial con filter-branch...
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch COPIAR_PEGAR_EASYPANEL_COMPLETO.txt VARIABLES_EASYPANEL_CORRECTAS_FINALES.txt COMANDOS_TERMINAL_EASYPANEL.txt SUBIR_CAMBIO_SCHEMA_AHORA.txt" --prune-empty --tag-name-filter cat -- --all

echo.
echo 5. Limpiando referencias...
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo.
echo ========================================
echo LIMPIEZA COMPLETADA
echo ========================================
echo.
echo Ahora puedes hacer push con:
echo git push origin main --force
echo.
pause
