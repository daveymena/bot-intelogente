@echo off
echo ========================================
echo  REINICIAR PARA VER CAMBIOS DEL LOGO
echo ========================================
echo.

echo [1/4] Deteniendo servidor...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo [2/4] Limpiando cache de Next.js...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo [3/4] Reinstalando dependencias...
call npm install

echo [4/4] Iniciando servidor...
echo.
echo ========================================
echo  SERVIDOR INICIANDO...
echo  Abre: http://localhost:3000
echo  Presiona Ctrl+Shift+R para hard refresh
echo ========================================
echo.

call npm run dev
