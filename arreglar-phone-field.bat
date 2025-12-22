@echo off
cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     🔧 Arreglar Campo Phone en Base de Datos          ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo Este script sincronizará tu schema de Prisma con la base de datos
echo.
pause

echo.
echo 📋 Paso 1: Sincronizando schema con base de datos...
echo.
call npx prisma db push

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Error al sincronizar schema
    echo.
    echo Posibles soluciones:
    echo 1. Verificar que DATABASE_URL esté configurado en .env
    echo 2. Verificar que PostgreSQL esté corriendo
    echo 3. Verificar conexión a base de datos
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Schema sincronizado correctamente
echo.

echo 📋 Paso 2: Regenerando cliente de Prisma...
echo.
call npx prisma generate

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Error al generar cliente de Prisma
    pause
    exit /b 1
)

echo.
echo ✅ Cliente de Prisma regenerado
echo.

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║              ✅ COMPLETADO EXITOSAMENTE                ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo El campo 'phone' ahora existe en tu base de datos.
echo.
echo 📋 Próximos pasos:
echo    1. Reiniciar el servidor: npm run dev
echo    2. Probar la aplicación
echo.
pause
