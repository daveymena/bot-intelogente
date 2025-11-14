@echo off
echo ========================================
echo  Smart Sales Bot Pro - Sistema Completo
echo ========================================
echo.

echo [1/4] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
) else (
    echo Dependencias OK
)
echo.

echo [2/4] Sincronizando base de datos...
call npx prisma db push
echo.

echo [3/4] Creando y verificando usuario admin...
call npx tsx scripts/create-admin.ts
call npx tsx scripts/verify-admin.ts
echo.

echo [4/4] Iniciando servidor...
echo.
echo ========================================
echo  Sistema listo en http://localhost:3000
echo ========================================
echo.
echo Credenciales de Admin:
echo Email: daveymena16@gmail.com
echo Password: 6715320Dvd.
echo.
echo Presiona Ctrl+C para detener el servidor
echo ========================================
echo.

call npm run dev
