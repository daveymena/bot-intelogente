@echo off
echo.
echo ========================================
echo   ACTIVAR OLLAMA COMO PRINCIPAL
echo ========================================
echo.
echo Esto configurara Ollama en Easypanel como IA principal
echo Groq quedara como fallback
echo.
pause
echo.

echo [1/3] Backup del .env actual...
if exist .env (
    copy .env .env.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%
    echo Backup creado: .env.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%
)
echo.

echo [2/3] Copiando configuracion de Ollama...
copy .env.ollama-principal .env
echo.

echo [3/3] Verificando configuracion...
findstr "AI_PROVIDER" .env
findstr "OLLAMA_BASE_URL" .env
findstr "OLLAMA_MODEL" .env
echo.

echo ========================================
echo   CONFIGURACION APLICADA
echo ========================================
echo.
echo IA Principal: Ollama (Easypanel)
echo Modelo: llama3:8b-instruct-q2_K
echo Fallback: Groq
echo.
echo IMPORTANTE:
echo 1. Edita .env y agrega tus GROQ_API_KEY
echo 2. Edita .env y agrega tu DATABASE_URL
echo 3. Reinicia el servidor: npm run dev
echo.
pause
