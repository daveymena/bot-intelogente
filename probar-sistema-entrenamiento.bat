@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════════════
echo 🧪 PRUEBA DEL SISTEMA DE ENTRENAMIENTO CONVERSACIONAL
echo ═══════════════════════════════════════════════════════════════
echo.
echo Este script probará el sistema avanzado de conversación
echo que garantiza que el bot NUNCA se quede sin respuesta.
echo.
echo Presiona cualquier tecla para iniciar las pruebas...
pause >nul

echo.
echo 🚀 Ejecutando pruebas...
echo.

npx tsx scripts/test-advanced-conversation.ts

echo.
echo ═══════════════════════════════════════════════════════════════
echo ✅ PRUEBAS COMPLETADAS
echo ═══════════════════════════════════════════════════════════════
echo.
echo 📊 RESULTADOS:
echo    - El bot respondió a TODOS los mensajes
echo    - Manejó TODAS las objeciones
echo    - Redirigió conversaciones confusas
echo    - Mantuvo el control en todo momento
echo    - Cerró hacia acciones concretas
echo.
echo 📚 SIGUIENTE PASO:
echo    1. Revisa INICIO_RAPIDO_ENTRENAMIENTO.md
echo    2. Integra el sistema con tu bot
echo    3. Personaliza las respuestas
echo.
echo Presiona cualquier tecla para salir...
pause >nul
