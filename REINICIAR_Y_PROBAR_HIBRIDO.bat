@echo off
echo ═══════════════════════════════════════════════════════
echo 🚀 REINICIAR SERVIDOR Y PROBAR SISTEMA HÍBRIDO
echo ═══════════════════════════════════════════════════════
echo.

echo 📋 PASO 1: Cerrar puertos ocupados...
call CERRAR_PUERTOS_AHORA.bat
timeout /t 2 /nobreak >nul

echo.
echo 📋 PASO 2: Ejecutar test del sistema híbrido...
echo.
node test-sistema-hibrido-completo.js

echo.
echo ═══════════════════════════════════════════════════════
echo ✅ TEST COMPLETADO
echo ═══════════════════════════════════════════════════════
echo.
echo 📋 PRÓXIMOS PASOS:
echo.
echo 1. Revisar los resultados del test arriba
echo 2. Si todo está OK, iniciar el servidor:
echo    npm run dev
echo.
echo 3. Probar en WhatsApp:
echo    - "Curso de piano" → Debe enviar foto CARD
echo    - "Tiene portátil Asus" → Debe enviar foto simple
echo    - "Cuál es mejor para diseño" → Solo texto IA
echo.
echo ═══════════════════════════════════════════════════════

pause
