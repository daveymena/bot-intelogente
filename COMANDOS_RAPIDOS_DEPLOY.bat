@echo off
title Smart Sales Bot Pro - Comandos Rapidos Deploy
color 0A

:MENU
cls
echo.
echo ========================================
echo   SMART SALES BOT PRO v2.0
echo   Comandos Rapidos para Deploy
echo ========================================
echo.
echo [1] Preparar Deploy Completo
echo [2] Ejecutar Tests Basicos
echo [3] Ejecutar Tests Exhaustivos (RECOMENDADO)
echo [4] Subir a GitHub (Repo Privado)
echo.
echo [5] Ver Estado del Bot
echo [6] Limpiar y Reiniciar
echo.
echo [7] Abrir Documentacion de Deploy
echo [8] Ver Variables de Entorno
echo [9] Verificar Servidor Local
echo.
echo [0] Salir
echo.
echo ========================================
echo.

set /p opcion="Selecciona una opcion: "

if "%opcion%"=="1" goto PREPARAR
if "%opcion%"=="2" goto TESTS_BASICOS
if "%opcion%"=="3" goto TESTS_EXHAUSTIVOS
if "%opcion%"=="4" goto GITHUB
if "%opcion%"=="5" goto ESTADO
if "%opcion%"=="6" goto LIMPIAR
if "%opcion%"=="7" goto DOCS
if "%opcion%"=="8" goto VARS
if "%opcion%"=="9" goto VERIFICAR
if "%opcion%"=="0" goto SALIR

echo Opcion invalida
timeout /t 2 >nul
goto MENU

:PREPARAR
cls
echo.
echo ========================================
echo   PREPARANDO DEPLOY COMPLETO
echo ========================================
echo.
call PREPARAR_DEPLOY_COMPLETO.bat
pause
goto MENU

:TESTS_BASICOS
cls
echo.
echo ========================================
echo   TESTS BASICOS
echo ========================================
echo.
call node test-bot-simulacion.js
pause
goto MENU

:TESTS_EXHAUSTIVOS
cls
echo.
echo ========================================
echo   TESTS EXHAUSTIVOS (RECOMENDADO)
echo ========================================
echo.
echo Este test verifica TODAS las capacidades:
echo - Contexto y memoria
echo - Busqueda inteligente
echo - Respuestas coherentes
echo - Razonamiento
echo - Resolucion de problemas
echo - Seguimiento inteligente
echo - Cierre de ventas
echo.
pause
call PROBAR_BOT_EXHAUSTIVO.bat
goto MENU

:GITHUB
cls
echo.
echo ========================================
echo   SUBIR A GITHUB
echo ========================================
echo.
echo [1] Repo Privado (recomendado)
echo [2] Repo Nuevo desde Cero
echo [3] Subida Limpia
echo [0] Volver
echo.
set /p github="Selecciona: "

if "%github%"=="1" (
    call SUBIR_A_REPO_PRIVADO.bat
) else if "%github%"=="2" (
    call CREAR_REPO_LIMPIO_DESDE_CERO.bat
) else if "%github%"=="3" (
    call SUBIR_A_GIT_LIMPIO.bat
) else (
    goto MENU
)
pause
goto MENU

:ESTADO
cls
echo.
echo ========================================
echo   ESTADO DEL BOT
echo ========================================
echo.
type VERIFICACION_FINAL_BOT.md
echo.
pause
goto MENU

:LIMPIAR
cls
echo.
echo ========================================
echo   LIMPIEZA Y REINICIO
echo ========================================
echo.
echo [1/4] Cerrando puertos...
call CERRAR_PUERTOS_AHORA.bat
echo.
echo [2/4] Limpiando archivos temporales...
if exist "temp-audio" rmdir /s /q temp-audio
if exist "temp-images" rmdir /s /q temp-images
if exist ".next" rmdir /s /q .next
echo.
echo [3/4] Limpiando cache...
if exist "node_modules/.cache" rmdir /s /q node_modules\.cache
echo.
echo [4/4] Regenerando Prisma...
call npx prisma generate
echo.
echo Limpieza completada!
pause
goto MENU

:DOCS
cls
echo.
echo ========================================
echo   DOCUMENTACION DE DEPLOY
echo ========================================
echo.
echo Abriendo documentos...
start LEER_ANTES_DE_DEPLOY.md
timeout /t 1 >nul
start INICIO_RAPIDO_PRODUCCION.md
timeout /t 1 >nul
start CHECKLIST_FINAL_DEPLOY.md
echo.
echo Documentos abiertos en tu editor
pause
goto MENU

:VARS
cls
echo.
echo ========================================
echo   VARIABLES DE ENTORNO
echo ========================================
echo.
type VARIABLES_EASYPANEL_SUPER_SALES_AI.env
echo.
echo.
echo Copia estas variables en Easypanel
pause
goto MENU

:VERIFICAR
cls
echo.
echo ========================================
echo   VERIFICAR SERVIDOR LOCAL
echo ========================================
echo.
echo Verificando servidor en http://localhost:3000...
echo.
curl http://localhost:3000/api/health 2>nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Servidor funcionando correctamente
) else (
    echo.
    echo ✗ Servidor no esta corriendo
    echo   Ejecuta: npm run dev
)
echo.
pause
goto MENU

:SALIR
cls
echo.
echo ========================================
echo   Gracias por usar Smart Sales Bot Pro
echo ========================================
echo.
echo Estado: PRODUCTION READY ✓
echo Version: v2.0
echo.
echo Proximos pasos:
echo 1. Preparar Deploy
echo 2. Subir a GitHub
echo 3. Configurar Easypanel
echo 4. Conectar WhatsApp
echo.
echo ¡Exito con tu deploy!
echo.
timeout /t 3 >nul
exit
