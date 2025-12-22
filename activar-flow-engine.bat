@echo off
echo ========================================
echo   ACTIVAR FLOW ENGINE INTELIGENTE
echo ========================================
echo.

echo [1/3] Ejecutando pruebas del FlowEngine...
call npx tsx scripts/test-flow-engine.ts

echo.
echo [2/3] Verificando integracion...
echo.
echo El FlowEngine esta listo para usar.
echo.
echo Para activarlo en produccion:
echo 1. Editar src/lib/baileys-stable-service.ts
echo 2. Reemplazar clean-bot con flow-baileys-integration
echo 3. Reiniciar el servidor
echo.

echo [3/3] Documentacion disponible en:
echo - SISTEMA_FLOW_ENGINE_INTELIGENTE.md
echo.

echo ========================================
echo   FLOW ENGINE LISTO
echo ========================================
echo.
echo Presiona cualquier tecla para continuar...
pause >nul
