@echo off
echo ========================================
echo 🚨 ACTIVAR SISTEMA DE ESCALAMIENTO INTELIGENTE
echo ========================================
echo.
echo Este script va a:
echo 1. Aplicar migración de base de datos
echo 2. Ejecutar tests del sistema
echo 3. Mostrar instrucciones finales
echo.
pause

echo.
echo ========================================
echo 📊 PASO 1: Aplicando migración...
echo ========================================
echo.
call npm run db:push

echo.
echo ========================================
echo 🧪 PASO 2: Ejecutando tests...
echo ========================================
echo.
call npx tsx test-escalamiento-inteligente.ts

echo.
echo ========================================
echo ✅ SISTEMA ACTIVADO
echo ========================================
echo.
echo El sistema de escalamiento está listo!
echo.
echo PRÓXIMOS PASOS:
echo 1. Reinicia el bot: npm run dev
echo 2. Monitorea los logs para ver escalamientos
echo 3. Revisa el dashboard para conversaciones escaladas
echo.
echo BUSCA EN LOGS:
echo   [Baileys] 🚨 ESCALAMIENTO DETECTADO
echo.
echo DOCUMENTACIÓN:
echo   - SISTEMA_ESCALAMIENTO_HUMANO_COMPLETO.md
echo   - INTEGRACION_ESCALAMIENTO_COMPLETADA.md
echo.
pause
