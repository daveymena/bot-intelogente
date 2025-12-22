@echo off
echo ========================================
echo PROBAR CONEXION DESDE EL SERVIDOR
echo ========================================
echo.
echo Este script probará la conexión de WhatsApp
echo usando el mismo código que usa el servidor.
echo.
echo PASOS:
echo 1. Asegúrate de que el servidor esté corriendo (npm run dev)
echo 2. Abre http://localhost:3000 en tu navegador
echo 3. Inicia sesión
echo 4. Ve a la sección de WhatsApp
echo 5. Haz clic en "Conectar WhatsApp"
echo 6. Observa los logs en la consola del servidor
echo.
echo Los logs ahora mostrarán cada paso del proceso:
echo   📦 Creando cliente
echo   ✅ Cliente creado
echo   🚀 Llamando a client.initialize()
echo   ⏳ Esperando QR...
echo   ✅ QR generado
echo.
echo Si ves "Timeout esperando QR", el problema es que
echo Puppeteer está tardando mucho en iniciar.
echo.
echo ========================================
echo.
echo Presiona cualquier tecla para abrir el navegador...
pause > nul
start http://localhost:3000
echo.
echo Navegador abierto. Ahora:
echo 1. Inicia sesión
echo 2. Conecta WhatsApp
echo 3. Observa los logs del servidor
echo.
pause
