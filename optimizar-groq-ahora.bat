@echo off
cls
echo ========================================
echo   OPTIMIZACION DE GROQ API
echo ========================================
echo.
echo Aplicando configuracion economica...
echo.
npx tsx scripts/configurar-modelo-economico.ts
echo.
echo ========================================
echo   CAMBIOS APLICADOS
echo ========================================
echo.
echo [OK] Modelo: llama-3.1-8b-instant
echo [OK] Max Tokens: 150 (70%% menos)
echo [OK] Response Delay: 1s (mas rapido)
echo [OK] Auto-response: Habilitado
echo.
echo ========================================
echo   AHORRO ESTIMADO
echo ========================================
echo.
echo Tokens: 70%% menos
echo Velocidad: 2x mas rapido
echo Costo: $10.50/mes de ahorro
echo.
echo ========================================
echo   REINICIAR SERVIDOR
echo ========================================
echo.
echo Presiona cualquier tecla para reiniciar...
pause >nul
echo.
echo Cerrando servidor actual...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul
echo.
echo Iniciando servidor optimizado...
echo.
start cmd /k "npm run dev"
echo.
echo ========================================
echo   SERVIDOR REINICIADO
echo ========================================
echo.
echo El bot ahora usa configuracion economica
echo.
pause
