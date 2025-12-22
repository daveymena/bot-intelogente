@echo off
echo.
echo ========================================
echo   SUBIR CAMBIOS A GIT - 22 NOV 2025
echo ========================================
echo.
echo Cambios incluidos:
echo - Saludos con presentacion del negocio
echo - Palabras de intencion ampliadas
echo - Correcciones de TypeScript
echo - Sistema multi-tenant optimizado
echo - Listo para Easypanel
echo.
echo ========================================
echo.

echo [1/4] Agregando archivos...
git add .

echo.
echo [2/4] Creando commit...
git commit -m "feat: Saludos profesionales con presentacion del negocio + optimizaciones

- Saludos ahora incluyen presentacion completa de Tecnovariedades D&S
- 8 variaciones de saludo con productos y servicios
- Palabras de intencion ampliadas (30+ palabras)
- Saludos profesionales y casuales reconocidos
- Correcciones TypeScript (sin errores)
- Sistema multi-tenant optimizado
- Listo para deploy en Easypanel

Archivos modificados:
- src/lib/greeting-detector.ts (saludos profesionales)
- src/lib/local-response-handler.ts (usa GreetingDetector)
- src/agents/greeting-agent.ts (usa GreetingDetector)
- src/agents/search-agent.ts (palabras intencion)

Sin API keys, sin errores, listo para produccion"

echo.
echo [3/4] Subiendo a GitHub...
git push origin main

echo.
echo [4/4] Verificando...
git status

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
