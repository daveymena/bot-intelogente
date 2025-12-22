@echo off
echo Solucionando problema de secrets en Git...
echo.

REM Resetear al commit anterior al problemático
git reset --soft HEAD~1

echo Commit reseteado. Ahora vamos a hacer un nuevo commit sin secrets...
echo.

REM Agregar todos los cambios
git add .

REM Hacer nuevo commit
git commit -m "feat: v2.1 - Generador personalidad + PostgreSQL (sin secrets)"

echo.
echo Listo! Ahora intenta push:
echo git push origin main
echo.
pause
