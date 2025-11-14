@echo off
echo ========================================
echo   GENERADOR DE BASE DE CONOCIMIENTO
echo ========================================
echo.
echo Selecciona una opcion:
echo.
echo 1. Generar conocimiento de TODOS los productos
echo 2. Generar solo para productos NUEVOS
echo 3. Probar el sistema de conocimiento
echo 4. Salir
echo.
set /p opcion="Opcion (1-4): "

if "%opcion%"=="1" goto todos
if "%opcion%"=="2" goto nuevos
if "%opcion%"=="3" goto probar
if "%opcion%"=="4" goto salir

:todos
echo.
echo Generando conocimiento para TODOS los productos...
echo.
npx tsx scripts/generar-base-conocimiento.ts
goto fin

:nuevos
echo.
echo Generando conocimiento solo para productos NUEVOS...
echo.
npx tsx scripts/auto-generar-conocimiento-nuevos.ts
goto fin

:probar
echo.
echo Probando sistema de conocimiento...
echo.
npx tsx scripts/test-base-conocimiento.ts
goto fin

:salir
echo.
echo Saliendo...
exit

:fin
echo.
echo ========================================
echo   PROCESO COMPLETADO
echo ========================================
pause
