@echo off
echo ========================================
echo PROBANDO CORRECCIONES COMPLETAS
echo ========================================
echo.
echo Este script verifica:
echo 1. Contexto se mantiene entre mensajes
echo 2. Fotos se envian automaticamente
echo 3. Formato card visual funciona
echo.
echo ========================================
echo.

echo [1/3] Verificando archivos corregidos...
if exist "src\lib\super-sales-ai-fixed.ts" (
    echo ✓ super-sales-ai-fixed.ts existe
) else (
    echo ✗ super-sales-ai-fixed.ts NO existe
    pause
    exit /b 1
)

if exist "CORRECCION_CONTEXTO_Y_FOTOS_COMPLETA.md" (
    echo ✓ Documentacion existe
) else (
    echo ✗ Documentacion NO existe
)

echo.
echo [2/3] Verificando integracion en controlador...
findstr /C:"super-sales-ai-fixed" "src\conversational-module\ai\conversacionController.ts" >nul
if %errorlevel% == 0 (
    echo ✓ Controlador usa version corregida
) else (
    echo ✗ Controlador NO usa version corregida
    pause
    exit /b 1
)

echo.
echo [3/3] Iniciando servidor para pruebas...
echo.
echo ========================================
echo INSTRUCCIONES DE PRUEBA:
echo ========================================
echo.
echo 1. Espera a que el servidor inicie
echo 2. Conecta WhatsApp desde el dashboard
echo 3. Envia mensaje: "me interesa el curso de piano"
echo 4. Verifica que:
echo    - Respuesta tiene formato card visual
echo    - Se envia foto automaticamente
echo 5. Envia mensaje: "que precio tiene?"
echo 6. Verifica que:
echo    - Bot recuerda el producto
echo    - Responde el precio correcto
echo 7. Envia mensaje: "quiero comprarlo"
echo 8. Verifica que:
echo    - Genera links de pago
echo    - Links son del producto correcto
echo.
echo ========================================
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

npm run dev
