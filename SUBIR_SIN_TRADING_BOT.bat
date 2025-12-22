@echo off
echo.
echo ========================================
echo   SUBIR A GIT (Sin trading-bot)
echo ========================================
echo.

echo [1/5] Eliminando carpeta trading-bot del repositorio...
git rm -r --cached trading-bot
echo.

echo [2/5] Agregando trading-bot al .gitignore...
echo trading-bot/ >> .gitignore
echo.

echo [3/5] Agregando archivos actualizados...
git add .
echo.

echo [4/5] Creando commit...
git commit -m "feat: Saludos profesionales + optimizaciones (sin trading-bot)

Cambios principales:
- Saludos con presentacion completa del negocio (8 variaciones)
- Palabras de intencion ampliadas (30+)
- Saludos profesionales y casuales reconocidos (35+)
- Correcciones TypeScript (sin errores)
- Sistema multi-tenant optimizado
- Eliminado trading-bot (archivos muy grandes)

Archivos modificados:
- src/lib/greeting-detector.ts
- src/lib/local-response-handler.ts
- src/agents/greeting-agent.ts
- src/agents/search-agent.ts

Listo para Easypanel"
echo.

echo [5/5] Subiendo a GitHub...
git push origin main --force
echo.

echo ========================================
echo   SUBIDA COMPLETADA
echo ========================================
echo.
echo Siguiente paso:
echo 1. Ir a Easypanel
echo 2. Hacer Pull del repositorio
echo 3. Rebuild de la aplicacion
echo.
pause
