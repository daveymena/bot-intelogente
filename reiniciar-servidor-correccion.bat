@echo off
cls
echo ========================================
echo   REINICIANDO SERVIDOR
echo ========================================
echo.
echo Correcciones aplicadas:
echo.
echo [OK] Search Agent: userId corregido
echo [OK] Deep Reasoning: Limpieza de nombres mejorada
echo.
echo ========================================
echo   CERRANDO PUERTOS
echo ========================================
echo.
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul
echo.
echo ========================================
echo   INICIANDO SERVIDOR
echo ========================================
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
npm run dev
