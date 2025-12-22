@echo off
cls
echo ========================================
echo   SISTEMA HIBRIDO ACTIVADO
echo ========================================
echo.
echo El bot ahora decide inteligentemente:
echo.
echo [LOCAL] Saludos, precios, fotos, info
echo         → 0 tokens, instantaneo
echo.
echo [GROQ]  Razonamiento complejo
echo         → Tokens solo cuando necesario
echo.
echo ========================================
echo   AHORRO ESTIMADO
echo ========================================
echo.
echo 70%% de mensajes: Respuesta local (0 tokens)
echo 30%% de mensajes: Groq API (150 tokens)
echo.
echo Ahorro total: 70%% en tokens
echo Costo: $1.35/mes (antes $4.50/mes)
echo.
echo ========================================
echo   REINICIANDO SERVIDOR
echo ========================================
echo.
echo Cerrando servidor actual...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul
echo.
echo Iniciando servidor con sistema hibrido...
echo.
start cmd /k "npm run dev"
echo.
echo ========================================
echo   SERVIDOR REINICIADO
echo ========================================
echo.
echo Busca en los logs:
echo   [HYBRID] Respondiendo localmente (0 tokens)
echo   [HYBRID] Requiere razonamiento → Usando Groq
echo.
pause
