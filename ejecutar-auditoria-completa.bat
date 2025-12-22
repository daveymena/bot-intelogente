@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════════════════════════════
echo 🔍 AUDITORÍA COMPLETA DEL BOT - SMART SALES BOT PRO
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
echo Problemas identificados en la imagen:
echo   1. Pérdida de contexto (MegaPack idiomas → mercado libre)
echo   2. PayPal por email en vez de link dinámico
echo   3. Productos irrelevantes (Piano, Auriculares)
echo.
echo ═══════════════════════════════════════════════════════════════════════════════
echo.

pause

echo.
echo 📋 PASO 1: Auditoría completa del sistema...
echo ─────────────────────────────────────────────────────────────────────────────
echo.
call npx tsx scripts/auditoria-bot-completa.ts
if errorlevel 1 (
    echo.
    echo ❌ Error en la auditoría
    pause
    exit /b 1
)

echo.
echo ✅ Auditoría completada
echo 💾 Reporte guardado en: auditoria-reporte.json
echo.
pause

echo.
echo 🧪 PASO 2: Test específico del problema de la imagen...
echo ─────────────────────────────────────────────────────────────────────────────
echo.
call npx tsx scripts/test-problema-imagen.ts
if errorlevel 1 (
    echo.
    echo ❌ Error en el test
    pause
    exit /b 1
)

echo.
echo ✅ Test completado
echo.
pause

echo.
echo 🔧 PASO 3: Corrección automática de problemas críticos...
echo ─────────────────────────────────────────────────────────────────────────────
echo.
call npx tsx scripts/corregir-problemas-criticos.ts
if errorlevel 1 (
    echo.
    echo ❌ Error en las correcciones
    pause
    exit /b 1
)

echo.
echo ✅ Correcciones aplicadas
echo.
pause

echo.
echo ═══════════════════════════════════════════════════════════════════════════════
echo 📊 RESUMEN FINAL
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
echo ✅ Auditoría completa ejecutada
echo ✅ Test específico ejecutado
echo ✅ Correcciones automáticas aplicadas
echo.
echo 📝 PRÓXIMOS PASOS MANUALES:
echo.
echo 1. Revisar el archivo: auditoria-reporte.json
echo 2. Leer las instrucciones en: EJECUTAR_AUDITORIA_AHORA.md
echo 3. Modificar los archivos indicados:
echo    - src/agents/shared-memory.ts
echo    - src/agents/payment-agent.ts
echo    - src/agents/search-agent.ts
echo    - src/lib/product-intelligence-service.ts
echo.
echo 4. Ejecutar tests de verificación:
echo    npx tsx scripts/test-contexto-producto-corregido.ts
echo    npx tsx scripts/test-paypal-dinamico.ts
echo    npx tsx scripts/test-busqueda-simple.ts
echo.
echo 5. Probar conversación completa:
echo    npx tsx scripts/test-bot-conversacion-real.js
echo.
echo ═══════════════════════════════════════════════════════════════════════════════
echo.

pause
