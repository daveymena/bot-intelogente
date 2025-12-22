@echo off
echo.
echo ========================================
echo   SUBIENDO A GIT - SISTEMA COMPLETO
echo ========================================
echo.

echo [1/5] Verificando estado de Git...
git status

echo.
echo [2/5] Agregando todos los archivos...
git add .

echo.
echo [3/5] Creando commit...
git commit -m "Sistema completo funcionando - Agentes + Pagos + Tests pasados"

echo.
echo [4/5] Verificando rama actual...
git branch

echo.
echo [5/5] Subiendo a GitHub...
git push origin main

echo.
echo ========================================
echo   SUBIDA COMPLETADA
echo ========================================
echo.
echo Siguiente paso: Desplegar en Easypanel
echo.
pause
