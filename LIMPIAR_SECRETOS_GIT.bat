@echo off
echo ============================================
echo LIMPIANDO SECRETOS DEL HISTORIAL DE GIT
echo ============================================
echo.
echo Este proceso va a:
echo 1. Crear un nuevo commit limpio sin secretos
echo 2. Reescribir el historial
echo 3. Forzar el push a GitHub
echo.
echo IMPORTANTE: Esto reescribira el historial de Git
echo.
pause

echo.
echo Paso 1: Guardando cambios actuales...
git add .
git commit -m "Archivos limpios sin secretos" 2>nul

echo.
echo Paso 2: Creando rama temporal...
git branch backup-antes-limpiar

echo.
echo Paso 3: Eliminando commit con secretos del historial...
echo Esto puede tardar un momento...
git reset --soft HEAD~2

echo.
echo Paso 4: Creando nuevo commit limpio...
git add .
git commit -m "Sistema completo sin secretos expuestos"

echo.
echo Paso 5: Forzando push (reescribe historial remoto)...
git push origin main --force

echo.
echo ============================================
echo LISTO!
echo ============================================
echo.
echo Si algo sale mal, puedes restaurar con:
echo   git checkout backup-antes-limpiar
echo.
pause
