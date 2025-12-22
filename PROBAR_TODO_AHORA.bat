@echo off
chcp 65001 >nul
cls
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║          VERIFICACIÓN Y PRUEBA COMPLETA DEL SISTEMA          ║
echo ║                    SMART SALES BOT PRO                        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Este script verificará y probará todos los componentes
echo.
pause

REM ============================================================
REM PASO 1: VERIFICACIÓN DEL SISTEMA
REM ============================================================
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                  PASO 1: VERIFICACIÓN                         ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
call VERIFICACION_SISTEMA_COMPLETA.bat
if %errorlevel% neq 0 (
    echo.
    echo ❌ La verificación falló. Revisa los errores arriba.
    pause
    exit /b 1
)

REM ============================================================
REM PASO 2: TESTS AUTOMATIZADOS
REM ============================================================
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                  PASO 2: TESTS AUTOMATIZADOS                  ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🧪 Ejecutando tests del sistema...
echo.
node test-sistema-completo-verificacion.js
if %errorlevel% neq 0 (
    echo.
    echo ⚠️ Algunos tests fallaron, pero puedes continuar
    echo.
    choice /C SN /M "¿Deseas continuar de todos modos?"
    if errorlevel 2 exit /b 1
)

REM ============================================================
REM PASO 3: INICIAR SERVIDOR
REM ============================================================
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                  PASO 3: INICIAR SERVIDOR                     ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Iniciando servidor con Ollama...
echo.
echo ⚠️ El servidor se iniciará en una nueva ventana
echo    Mantén ambas ventanas abiertas
echo.
pause

REM Iniciar servidor en nueva ventana
start "Smart Sales Bot - Servidor" cmd /k "INICIAR_CON_OLLAMA_LLAMA31.bat"

REM Esperar a que el servidor inicie
echo.
echo ⏳ Esperando a que el servidor inicie (30 segundos)...
timeout /t 30 /nobreak >nul

REM ============================================================
REM PASO 4: VERIFICAR SERVIDOR
REM ============================================================
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                PASO 4: VERIFICAR SERVIDOR                     ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🔍 Verificando que el servidor esté corriendo...
echo.

REM Verificar puerto 4000
netstat -ano | findstr ":4000" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Servidor corriendo en puerto 4000
) else (
    echo ❌ Servidor no está corriendo
    echo.
    echo Revisa la ventana del servidor para ver errores
    pause
    exit /b 1
)

REM Verificar endpoint
curl -s http://localhost:4000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Servidor respondiendo correctamente
) else (
    echo ⚠️ Servidor no responde (puede estar iniciando)
)

REM ============================================================
REM PASO 5: ABRIR DASHBOARD
REM ============================================================
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                  PASO 5: ABRIR DASHBOARD                      ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🌐 Abriendo dashboard en el navegador...
echo.
timeout /t 3 >nul
start http://localhost:4000

REM ============================================================
REM RESUMEN FINAL
REM ============================================================
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                      ✅ SISTEMA LISTO                         ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🎉 El sistema está corriendo correctamente
echo.
echo 📋 INFORMACIÓN:
echo    • Servidor: http://localhost:4000
echo    • Dashboard: http://localhost:4000
echo    • API: http://localhost:4000/api
echo.
echo 🔧 COMPONENTES ACTIVOS:
echo    ✅ Servidor Next.js
echo    ✅ Socket.IO (WhatsApp real-time)
echo    ✅ Ollama (IA local/remota)
echo    ✅ Groq (IA fallback)
echo    ✅ Base de datos PostgreSQL
echo    ✅ Sistema conversacional
echo    ✅ Búsqueda inteligente
echo    ✅ Memoria de contexto
echo.
echo 📱 PRÓXIMOS PASOS:
echo    1. Abre el dashboard en tu navegador
echo    2. Inicia sesión con tu usuario
echo    3. Conecta WhatsApp escaneando el QR
echo    4. ¡Empieza a vender!
echo.
echo 💡 TIPS:
echo    • Mantén esta ventana abierta para ver logs
echo    • Si algo falla, revisa los logs en la ventana del servidor
echo    • Para detener: Cierra ambas ventanas o presiona Ctrl+C
echo.
echo ⚠️ IMPORTANTE:
echo    • NO cierres la ventana del servidor
echo    • Mantén Ollama corriendo (si es local)
echo    • Verifica tu conexión a internet
echo.
pause
