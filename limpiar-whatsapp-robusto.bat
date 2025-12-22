@echo off
echo ============================================================
echo LIMPIEZA ROBUSTA DE WHATSAPP
echo ============================================================
echo.

echo Este script va a:
echo - Eliminar TODOS los archivos de sesion
echo - Limpiar TODAS las conexiones en la base de datos
echo - Preparar para una conexion desde cero
echo.

echo ADVERTENCIA: Esto eliminara la sesion actual de WhatsApp
echo.

set /p confirm="Estas seguro? (S/N): "
if /i not "%confirm%"=="S" (
    echo Operacion cancelada
    pause
    exit /b
)

echo.
echo Ejecutando limpieza robusta...
echo.

npx tsx scripts/limpiar-whatsapp-robusto.ts

echo.
echo ============================================================
echo Limpieza completada
echo ============================================================
echo.

pause
