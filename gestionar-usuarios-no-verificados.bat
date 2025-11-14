@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   GESTIÓN DE USUARIOS NO VERIFICADOS                      ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Selecciona una opción:
echo.
echo [1] Verificar base de datos
echo [2] Listar usuarios no verificados
echo [3] Activar usuario manualmente
echo [4] Salir
echo.
set /p opcion="Ingresa el número de opción: "

if "%opcion%"=="1" goto verificar
if "%opcion%"=="2" goto listar
if "%opcion%"=="3" goto activar
if "%opcion%"=="4" goto salir

echo.
echo ❌ Opción inválida
pause
exit /b

:verificar
echo.
echo 🔍 Verificando base de datos...
echo.
npx tsx scripts/verificar-database.ts
echo.
pause
exit /b

:listar
echo.
echo 🔍 Listando usuarios no verificados...
echo.
npx tsx scripts/listar-usuarios-no-verificados.ts
echo.
pause
exit /b

:activar
echo.
set /p email="Ingresa el email del usuario a activar: "
echo.
echo 🔧 Activando usuario %email%...
echo.
npx tsx scripts/activar-usuario-manual.ts %email%
echo.
pause
exit /b

:salir
echo.
echo 👋 ¡Hasta luego!
exit /b
