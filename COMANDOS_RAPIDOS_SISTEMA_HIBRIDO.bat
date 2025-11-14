@echo off
echo ========================================
echo   SISTEMA HIBRIDO INTELIGENTE
echo   Comandos Rapidos
echo ========================================
echo.

:menu
echo.
echo Selecciona una opcion:
echo.
echo 1. Ejecutar pruebas automaticas
echo 2. Iniciar bot (desarrollo)
echo 3. Ver documentacion completa
echo 4. Ver guia de pruebas
echo 5. Ver flujo visual
echo 6. Salir
echo.

set /p opcion="Opcion: "

if "%opcion%"=="1" goto pruebas
if "%opcion%"=="2" goto iniciar
if "%opcion%"=="3" goto docs
if "%opcion%"=="4" goto guia
if "%opcion%"=="5" goto flujo
if "%opcion%"=="6" goto salir

echo Opcion invalida
goto menu

:pruebas
echo.
echo ========================================
echo   EJECUTANDO PRUEBAS AUTOMATICAS
echo ========================================
echo.
npx tsx scripts/test-sistema-hibrido.ts
echo.
pause
goto menu

:iniciar
echo.
echo ========================================
echo   INICIANDO BOT EN MODO DESARROLLO
echo ========================================
echo.
echo El bot se iniciara en http://localhost:4000
echo.
echo Presiona Ctrl+C para detener
echo.
npm run dev
goto menu

:docs
echo.
echo ========================================
echo   ABRIENDO DOCUMENTACION COMPLETA
echo ========================================
echo.
start SISTEMA_HIBRIDO_INTELIGENTE_FINAL.md
echo.
echo Documentacion abierta en tu editor
echo.
pause
goto menu

:guia
echo.
echo ========================================
echo   ABRIENDO GUIA DE PRUEBAS
echo ========================================
echo.
start PROBAR_SISTEMA_HIBRIDO.md
echo.
echo Guia abierta en tu editor
echo.
pause
goto menu

:flujo
echo.
echo ========================================
echo   ABRIENDO FLUJO VISUAL
echo ========================================
echo.
start FLUJO_SISTEMA_HIBRIDO_VISUAL.md
echo.
echo Flujo visual abierto en tu editor
echo.
pause
goto menu

:salir
echo.
echo Hasta pronto!
echo.
exit
