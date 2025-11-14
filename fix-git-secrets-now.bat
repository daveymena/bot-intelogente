@echo off
echo ========================================
echo ARREGLANDO GIT - REMOVIENDO SECRETOS
echo ========================================
echo.

REM Agregar archivos con secretos al .gitignore
echo VARIABLES_EASYPANEL_ACTUALIZADAS.txt >> .gitignore
echo CAMBIOS_VARIABLES_EASYPANEL.md >> .gitignore
echo AGREGAR_ESTAS_VARIABLES_EASYPANEL.txt >> .gitignore
echo ACTUALIZAR_EASYPANEL_VARIABLES.md >> .gitignore
echo RESUMEN_SESION_COMPLETA_FINAL.md >> .gitignore
echo VARIABLES_EASYPANEL_LISTAS.txt >> .gitignore

echo Archivos agregados a .gitignore
echo.

REM Remover archivos del staging
git rm --cached VARIABLES_EASYPANEL_ACTUALIZADAS.txt 2>nul
git rm --cached CAMBIOS_VARIABLES_EASYPANEL.md 2>nul
git rm --cached AGREGAR_ESTAS_VARIABLES_EASYPANEL.txt 2>nul
git rm --cached ACTUALIZAR_EASYPANEL_VARIABLES.md 2>nul
git rm --cached RESUMEN_SESION_COMPLETA_FINAL.md 2>nul
git rm --cached VARIABLES_EASYPANEL_LISTAS.txt 2>nul

echo Archivos removidos del staging
echo.

REM Hacer commit de los cambios
git add .gitignore
git add .
git commit -m "Fix: Remover archivos con secretos del repositorio"

echo.
echo ========================================
echo LISTO - Ahora puedes hacer push
echo ========================================
echo.
echo Ejecuta: git push origin main
echo.
pause
