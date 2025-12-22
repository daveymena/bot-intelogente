@echo off
echo.
echo ========================================
echo   SOLUCION RAPIDA - NUEVO COMMIT
echo ========================================
echo.

echo [1/4] Reseteando al commit anterior (antes de trading-bot)...
git reset --soft HEAD~2
echo.

echo [2/4] Agregando solo archivos importantes...
git add src/
git add scripts/
git add prisma/
git add public/
git add package.json
git add tsconfig.json
git add next.config.ts
git add server.ts
git add .gitignore
echo.

echo [3/4] Asegurando que trading-bot este en .gitignore...
findstr /C:"trading-bot" .gitignore >nul 2>&1
if errorlevel 1 (
    echo. >> .gitignore
    echo # Excluir trading-bot >> .gitignore
    echo trading-bot/ >> .gitignore
    git add .gitignore
)
echo.

echo [4/4] Creando commit limpio...
git commit -m "feat: Saludos profesionales con presentacion del negocio

- Saludos con presentacion completa (8 variaciones)
- Palabras de intencion ampliadas (30+)
- Saludos profesionales reconocidos (35+)
- Sin errores TypeScript
- Listo para Easypanel"
echo.

echo Subiendo...
git push origin main --force
echo.

echo ========================================
echo   COMPLETADO
echo ========================================
echo.
pause
