@echo off
echo ========================================
echo  Reiniciando Smart Sales Bot Pro
echo ========================================
echo.

echo [1/4] Limpiando cache...
if exist ".next" (
    rmdir /s /q ".next"
    echo Cache .next eliminado
)
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo Cache node_modules eliminado
)
echo.

echo [2/4] Verificando admin...
call npx tsx scripts/reset-admin-password.ts
echo.

echo [3/4] Compilando proyecto...
call npm run build
echo.

echo [4/4] Iniciando servidor...
echo.
echo ========================================
echo  Sistema listo en http://localhost:3000
echo ========================================
echo.
echo Credenciales:
echo Email: daveymena16@gmail.com
echo Password: 6715320Dvd.
echo.
echo IMPORTANTE: Despues de iniciar sesion,
echo seras redirigido automaticamente al dashboard
echo.
echo Presiona Ctrl+C para detener el servidor
echo ========================================
echo.

call npm run dev
