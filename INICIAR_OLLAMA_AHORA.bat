@echo off
cls
echo ========================================
echo   SMART SALES BOT PRO - OLLAMA ACTIVO
echo ========================================
echo.
echo Sistema configurado con:
echo - Ollama como IA principal
echo - Formato CARD profesional
echo - AIDA integrado
echo - Memoria conversacional
echo - Fotos automaticas
echo - Saludos dinamicos
echo.
echo ========================================
echo.

echo [1/4] Verificando configuracion...
findstr /C:"USE_OLLAMA=true" .env >nul
if %errorlevel%==0 (
    echo   [OK] Ollama activado
) else (
    echo   [ERROR] Ollama no esta activado en .env
    echo   Activalo con: USE_OLLAMA=true
    pause
    exit /b 1
)

echo.
echo [2/4] Verificando conexion a Ollama...
curl -s https://ollama-ollama.ginee6.easypanel.host/api/tags >nul 2>&1
if %errorlevel%==0 (
    echo   [OK] Ollama responde
) else (
    echo   [ADVERTENCIA] No se pudo verificar Ollama
    echo   Continuando de todas formas...
)

echo.
echo [3/4] Limpiando cache...
if exist .next\cache rmdir /s /q .next\cache >nul 2>&1

echo.
echo [4/4] Iniciando servidor...
echo.
echo ========================================
echo   SERVIDOR INICIANDO...
echo ========================================
echo.
echo Dashboard: http://localhost:3000
echo.
echo Presiona Ctrl+C para detener
echo ========================================
echo.

npm run dev
