@echo off
echo.
echo ========================================
echo   PREPARACION COMPLETA PARA DEPLOY
echo   Smart Sales Bot Pro v2.0
echo ========================================
echo.

echo [1/6] Cerrando puertos ocupados...
call CERRAR_PUERTOS_AHORA.bat
timeout /t 2 >nul

echo.
echo [2/6] Limpiando archivos temporales...
if exist "temp-audio" rmdir /s /q temp-audio
if exist "temp-images" rmdir /s /q temp-images
if exist ".next" rmdir /s /q .next
if exist "dist" rmdir /s /q dist
echo ✓ Limpieza completada

echo.
echo [3/6] Instalando dependencias...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ✗ Error instalando dependencias
    pause
    exit /b 1
)
echo ✓ Dependencias instaladas

echo.
echo [4/6] Generando cliente Prisma...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo ✗ Error generando Prisma
    pause
    exit /b 1
)
echo ✓ Prisma generado

echo.
echo [5/6] Compilando TypeScript...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ✗ Error compilando TypeScript
    pause
    exit /b 1
)
echo ✓ Compilación exitosa

echo.
echo [6/6] Ejecutando tests de verificación...
call node test-bot-simulacion.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠ ADVERTENCIA: Algunos tests fallaron
    echo ⚠ Revisa los resultados arriba
    echo.
    choice /C SN /M "¿Continuar con el deploy de todas formas?"
    if errorlevel 2 (
        echo Deploy cancelado
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo   ✓ PREPARACION COMPLETADA
echo ========================================
echo.
echo El bot está listo para deploy.
echo.
echo Próximos pasos:
echo 1. Ejecutar: SUBIR_A_REPO_PRIVADO.bat
echo 2. Configurar Easypanel (ver CHECKLIST_FINAL_DEPLOY.md)
echo 3. Conectar WhatsApp en producción
echo.
pause
