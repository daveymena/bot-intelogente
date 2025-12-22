@echo off
echo ========================================
echo CONFIGURACION RAPIDA DE SMART-SALES
echo ========================================
echo.

cd ..\smart-sales

echo [1/4] Configurando base de datos SQLite...
echo DATABASE_URL="file:./dev.db" >> .env
echo GROQ_API_KEY="%GROQ_API_KEY%" >> .env
echo NEXTAUTH_SECRET="smart-sales-secret-2024" >> .env
echo NEXTAUTH_URL="http://localhost:3000" >> .env
echo JWT_SECRET="jwt-secret-2024" >> .env
echo.

echo [2/4] Aplicando schema de Prisma...
call npx prisma db push --accept-data-loss
echo.

echo [3/4] Generando cliente Prisma...
call npx prisma generate
echo.

echo [4/4] Listo!
echo.
echo ========================================
echo CONFIGURACION COMPLETADA
echo ========================================
echo.
echo Ahora puedes:
echo   1. npm run dev (iniciar dashboard)
echo   2. npm run start:bot (iniciar bot)
echo.
echo Dashboard: http://localhost:3000
echo.
pause
