@echo off
echo ========================================
echo   REINICIANDO NEXT.JS LIMPIO
echo ========================================
echo.

echo Cerrando procesos de Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Limpiando cache de Next.js...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo Iniciando servidor...
npm run dev

pause
