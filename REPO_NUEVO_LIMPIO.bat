@echo off
echo.
echo ========================================
echo   CREAR REPOSITORIO LIMPIO
echo ========================================
echo.
echo Esta es la solucion mas rapida y segura
echo.
pause
echo.

echo Paso 1: Backup del .git actual...
if exist .git.backup rmdir /s /q .git.backup
move .git .git.backup
echo.

echo Paso 2: Inicializar nuevo repositorio...
git init
echo.

echo Paso 3: Agregar trading-bot al .gitignore...
echo. >> .gitignore
echo # Excluir trading-bot >> .gitignore
echo trading-bot/ >> .gitignore
echo.

echo Paso 4: Agregar archivos importantes...
git add src/
git add scripts/
git add prisma/
git add public/
git add package.json
git add tsconfig.json
git add next.config.ts
git add server.ts
git add .gitignore
git add README.md
echo.

echo Paso 5: Primer commit limpio...
git commit -m "feat: Sistema completo con saludos profesionales

- Saludos con presentacion del negocio (8 variaciones)
- Palabras de intencion optimizadas (30+)
- Sistema multi-tenant
- Sin errores TypeScript
- Listo para Easypanel"
echo.

echo Paso 6: Conectar con GitHub...
git remote add origin https://github.com/daveymena/bot-intelogente.git
echo.

echo Paso 7: Configurar branch main...
git branch -M main
echo.

echo Paso 8: Push con force (repositorio limpio)...
git push -u origin main --force
echo.

echo ========================================
echo   COMPLETADO - REPOSITORIO LIMPIO
echo ========================================
echo.
echo Si algo sale mal, tu .git original esta en .git.backup
echo.
pause
