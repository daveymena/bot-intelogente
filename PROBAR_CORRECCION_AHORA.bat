@echo off
cls
echo ========================================
echo CORRECCION: Productos Digitales vs Fisicos
echo ========================================
echo.
echo Cambios aplicados:
echo [x] Productos digitales NO mencionan recogida/envio
echo [x] Productos fisicos SI mencionan opciones de entrega
echo [x] Disponibilidad: si esta en BD = disponible
echo [x] Links de pago se generan automaticamente
echo.
echo ========================================
echo.
echo Opciones:
echo.
echo 1. Ver tipo de producto (Curso de Piano)
echo 2. Ejecutar test completo
echo 3. Reiniciar servidor
echo 4. Ver documentacion
echo.
set /p opcion="Selecciona una opcion (1-4): "

if "%opcion%"=="1" (
    echo.
    echo Verificando tipo de producto...
    npx tsx scripts/verificar-tipo-producto-piano.ts
    pause
    goto menu
)

if "%opcion%"=="2" (
    echo.
    echo Ejecutando tests...
    npx tsx scripts/test-producto-digital-vs-fisico.ts
    pause
    goto menu
)

if "%opcion%"=="3" (
    echo.
    echo Reiniciando servidor...
    echo Presiona Ctrl+C para detener el servidor actual
    echo Luego ejecuta: npm run dev
    pause
    goto menu
)

if "%opcion%"=="4" (
    echo.
    echo Abriendo documentacion...
    start RESUMEN_CORRECCION_PRODUCTOS_DIGITALES.md
    pause
    goto menu
)

:menu
cls
goto :eof
