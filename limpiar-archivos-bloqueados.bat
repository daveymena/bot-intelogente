@echo off
echo ========================================
echo LIMPIEZA DE ARCHIVOS BLOQUEADOS
echo ========================================
echo.
echo IMPORTANTE: Cierra el navegador y detén el servidor (Ctrl+C)
echo antes de continuar.
echo.
pause
echo.
echo Eliminando archivos de sesión...
echo.

REM Eliminar directorio completo de sesiones
if exist "whatsapp-sessions" (
    echo Intentando eliminar whatsapp-sessions...
    rmdir /s /q "whatsapp-sessions" 2>nul
    if exist "whatsapp-sessions" (
        echo Algunos archivos siguen bloqueados.
        echo Intentando con PowerShell...
        powershell -Command "Get-ChildItem -Path 'whatsapp-sessions' -Recurse | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue"
        rmdir /s /q "whatsapp-sessions" 2>nul
    )
)

if exist "whatsapp-sessions" (
    echo.
    echo ❌ No se pudieron eliminar todos los archivos
    echo    Algunos procesos siguen usando los archivos.
    echo.
    echo Soluciones:
    echo 1. Cierra TODAS las ventanas del navegador
    echo 2. Detén el servidor (Ctrl+C)
    echo 3. Reinicia tu computadora si es necesario
    echo 4. Ejecuta este script de nuevo
) else (
    echo.
    echo ✅ Archivos eliminados exitosamente
)

echo.
echo ========================================
pause
