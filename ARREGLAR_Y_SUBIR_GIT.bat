@echo off
echo.
echo ========================================
echo   ARREGLAR Y SUBIR A GIT
echo ========================================
echo.

echo [1/6] Verificando .gitignore...
findstr /C:"trading-bot" .gitignore >nul 2>&1
if errorlevel 1 (
    echo Agregando trading-bot al .gitignore...
    echo. >> .gitignore
    echo # Excluir trading-bot (archivos muy grandes) >> .gitignore
    echo trading-bot/ >> .gitignore
) else (
    echo trading-bot ya esta en .gitignore
)
echo.

echo [2/6] Eliminando trading-bot del cache de Git...
git rm -r --cached trading-bot 2>nul
echo.

echo [3/6] Agregando cambios importantes...
git add src/
git add scripts/
git add prisma/
git add .gitignore
git add package.json
git add tsconfig.json
git add next.config.ts
git add server.ts
echo.

echo [4/6] Creando commit...
git commit -m "feat: Saludos profesionales con presentacion del negocio

Mejoras implementadas:
- Saludos con presentacion completa de Tecnovariedades D&S (8 variaciones)
- Palabras de intencion ampliadas para busquedas precisas (30+)
- Reconocimiento de saludos profesionales y casuales (35+)
- Correcciones TypeScript (0 errores)
- Sistema multi-tenant optimizado
- Excluido trading-bot del repositorio

Archivos clave modificados:
- src/lib/greeting-detector.ts (saludos profesionales)
- src/lib/local-response-handler.ts (usa GreetingDetector)
- src/agents/greeting-agent.ts (usa GreetingDetector)
- src/agents/search-agent.ts (palabras intencion)

Estado: Listo para produccion en Easypanel"
echo.

echo [5/6] Subiendo a GitHub...
git push origin main
echo.

echo [6/6] Verificando estado...
git status
echo.

echo ========================================
echo   COMPLETADO
echo ========================================
echo.
echo Proximo paso:
echo 1. Ir a Easypanel
echo 2. Pull del repositorio
echo 3. Rebuild de la app
echo.
pause
