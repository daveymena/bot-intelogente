@echo off
echo ========================================
echo   CONFIGURACION COMPLETA DEL SISTEMA
echo ========================================
echo.

echo [1/5] Deteniendo procesos de Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/5] Generando cliente de Prisma...
call npx prisma generate

echo.
echo [3/5] Creando base de datos...
call npx prisma db push --accept-data-loss

echo.
echo [4/5] Creando usuario administrador...
call npx tsx scripts/create-admin.ts

echo.
echo [5/5] Verificando usuarios...
node ver-usuarios-simple.js

echo.
echo ========================================
echo   CONFIGURACION COMPLETADA
echo ========================================
echo.
echo Sistema listo para usar:
echo - Base de datos creada
echo - Usuario admin configurado
echo - Cola de mensajes activada
echo - Reconexion automatica habilitada
echo.
echo Ahora puedes:
echo 1. Ejecutar: npm run dev
echo 2. Abrir: http://localhost:3000
echo 3. Iniciar sesion con tus credenciales
echo.
pause
