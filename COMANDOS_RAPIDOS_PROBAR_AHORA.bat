@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════
echo   🚀 COMANDOS RÁPIDOS - SISTEMA HÍBRIDO
echo ═══════════════════════════════════════════════════════
echo.
echo ESTADO: ✅ Sistema híbrido implementado y funcional
echo         ✅ Error Prisma corregido
echo         ✅ Hot reload aplicado (cambios activos)
echo.
echo ═══════════════════════════════════════════════════════
echo   📋 OPCIONES DISPONIBLES
echo ═══════════════════════════════════════════════════════
echo.
echo [1] Verificar servidor (ver si está corriendo)
echo [2] Iniciar servidor (si no está corriendo)
echo [3] Ver logs en tiempo real
echo [4] Ejecutar test automático
echo [5] Abrir dashboard (http://localhost:3000)
echo [6] Ver documentación completa
echo [7] Salir
echo.
echo ═══════════════════════════════════════════════════════
echo.

set /p opcion="Selecciona una opción (1-7): "

if "%opcion%"=="1" goto verificar
if "%opcion%"=="2" goto iniciar
if "%opcion%"=="3" goto logs
if "%opcion%"=="4" goto test
if "%opcion%"=="5" goto dashboard
if "%opcion%"=="6" goto docs
if "%opcion%"=="7" goto salir

echo.
echo ❌ Opción inválida
pause
goto :eof

:verificar
echo.
echo 🔍 Verificando servidor...
echo.
netstat -ano | findstr :3000
if %errorlevel%==0 (
    echo ✅ Servidor corriendo en puerto 3000
    echo.
    echo 📊 Dashboard: http://localhost:3000
    echo 📸 Listo para probar en WhatsApp
) else (
    echo ❌ Servidor NO está corriendo
    echo.
    echo 💡 Ejecuta opción [2] para iniciar
)
echo.
pause
goto :eof

:iniciar
echo.
echo 🚀 Iniciando servidor...
echo.
echo ⚠️  IMPORTANTE: Esto abrirá una nueva ventana
echo    NO cierres esta ventana mientras pruebes
echo.
pause
start cmd /k "npm run dev"
echo.
echo ✅ Servidor iniciando...
echo.
echo 📊 Dashboard: http://localhost:3000
echo 📸 Conecta WhatsApp y prueba:
echo    - "Curso de piano" (producto específico)
echo    - "Tienes portátil Asus" (múltiples productos)
echo.
pause
goto :eof

:logs
echo.
echo 📋 Logs en tiempo real...
echo.
echo ⚠️  Presiona Ctrl+C para salir
echo.
pause
npm run dev
goto :eof

:test
echo.
echo 🧪 Ejecutando test automático...
echo.
node test-sistema-completo-final.js
echo.
echo ✅ Test completado
echo.
pause
goto :eof

:dashboard
echo.
echo 🌐 Abriendo dashboard...
echo.
start http://localhost:3000
echo.
echo ✅ Dashboard abierto en navegador
echo.
echo 📸 Pasos siguientes:
echo    1. Escanear QR si no está conectado
echo    2. Esperar "✅ Conectado"
echo    3. Enviar mensaje de prueba por WhatsApp
echo.
pause
goto :eof

:docs
echo.
echo 📖 Documentación disponible:
echo.
echo ═══════════════════════════════════════════════════════
echo   GUÍAS DE PRUEBA
echo ═══════════════════════════════════════════════════════
echo.
echo 📖 PROBAR_SISTEMA_HIBRIDO_AHORA.md
echo    → Guía completa paso a paso
echo.
echo 📖 LISTO_AHORA.txt
echo    → Referencia rápida
echo.
echo ═══════════════════════════════════════════════════════
echo   DOCUMENTACIÓN TÉCNICA
echo ═══════════════════════════════════════════════════════
echo.
echo 📖 RESUMEN_SESION_COMPLETA_14_DIC_FINAL.md
echo    → Resumen completo de la sesión
echo.
echo 📖 SISTEMA_HIBRIDO_IMPLEMENTADO.md
echo    → Documentación técnica detallada
echo.
echo 📖 VISUAL_SISTEMA_HIBRIDO_FINAL.md
echo    → Diagramas y flujos visuales
echo.
echo 📖 CORRECCION_DELIVERYLINK_APLICADA.md
echo    → Corrección error Prisma
echo.
echo ═══════════════════════════════════════════════════════
echo   TESTS
echo ═══════════════════════════════════════════════════════
echo.
echo 🧪 test-sistema-completo-final.js
echo    → Test automatizado completo
echo.
echo 🧪 test-sistema-hibrido-completo.js
echo    → Test específico del sistema híbrido
echo.
echo ═══════════════════════════════════════════════════════
echo.
pause
goto :eof

:salir
echo.
echo 👋 ¡Hasta luego!
echo.
echo 💡 Recuerda:
echo    - Servidor debe estar corriendo para probar
echo    - WhatsApp debe estar conectado
echo    - Revisa logs para verificar funcionamiento
echo.
pause
exit

:eof
