@echo off
echo.
echo ========================================
echo   SOLUCION DEFINITIVA - GIT
echo ========================================
echo.

echo Paso 1: Resetear commits problematicos...
git reset --hard HEAD~2
echo.

echo Paso 2: Agregar trading-bot al .gitignore...
echo. >> .gitignore
echo # Excluir trading-bot >> .gitignore
echo trading-bot/ >> .gitignore
echo.

echo Paso 3: Agregar cambios importantes...
git add src/
git add scripts/
git add prisma/
git add package.json
git add tsconfig.json
git add next.config.ts
git add server.ts
git add .gitignore
echo.

echo Paso 4: Commit limpio...
git commit -m "feat: Saludos profesionales y optimizaciones"
echo.

echo Paso 5: Push con force...
git push origin main --force
echo.

echo ========================================
echo   COMPLETADO
echo ========================================
echo.
pause
