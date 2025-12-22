@echo off
echo ========================================
echo LIMPIANDO HISTORIAL DE GIT COMPLETO
echo ========================================
echo.
echo ADVERTENCIA: Esto reescribira el historial de Git
echo.
pause

REM Crear backup de la rama actual
git branch backup-antes-limpiar

echo.
echo Limpiando commits con secretos del historial...
echo.

REM Usar filter-repo para limpiar archivos con secretos
git filter-branch --force --index-filter ^
"git rm --cached --ignore-unmatch VARIABLES_EASYPANEL_LISTAS.txt RESUMEN_SESION_COMPLETA_FINAL.md CAMBIOS_VARIABLES_EASYPANEL.md VARIABLES_EASYPANEL_ACTUALIZADAS.txt AGREGAR_ESTAS_VARIABLES_EASYPANEL.txt ACTUALIZAR_EASYPANEL_VARIABLES.md" ^
--prune-empty --tag-name-filter cat -- --all

echo.
echo Forzando garbage collection...
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo.
echo ========================================
echo LISTO - Historial limpio
echo ========================================
echo.
echo Ahora ejecuta:
echo git push origin main --force
echo.
echo NOTA: Esto reescribira el historial en GitHub
echo.
pause
