@echo off
echo ========================================
echo   REINICIO LIMPIO DEL SERVIDOR
echo ========================================
echo.
echo Limpiando cache y reiniciando...
echo.

echo [1/3] Cerrando puertos...
taskkill /F /IM node.exe >nul 2>&1

echo [2/3] Limpiando cache de Next.js...
if exist ".next" rmdir /s /q .next
if exist "node_modules\.cache" rmdir /s /q node_modules\.cache

echo [3/3] Iniciando servidor limpio...
echo.
echo ========================================
echo   SERVIDOR INICIANDO
echo ========================================
echo.
echo Dashboard: http://localhost:3000
echo.
echo IMPORTANTE: El servidor esta usando:
echo - USE_OLLAMA=false (Groq activo)
echo - Busqueda semantica activada
echo - Respuestas rapidas garantizadas
echo.
echo ========================================
echo.

npm run dev
