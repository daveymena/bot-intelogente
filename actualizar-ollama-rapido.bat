@echo off
echo ========================================
echo ACTUALIZANDO OLLAMA AL MODELO MAS RAPIDO
echo ========================================
echo.

echo [1/2] Actualizando .env...
powershell -Command "(Get-Content .env) -replace 'OLLAMA_MODEL=.*', 'OLLAMA_MODEL=llama3.2:3b' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace 'OLLAMA_TIMEOUT=.*', 'OLLAMA_TIMEOUT=30000' | Set-Content .env"

echo [2/2] Verificando configuracion...
echo.
echo OLLAMA_MODEL=llama3.2:3b (527ms - MAS RAPIDO)
echo OLLAMA_TIMEOUT=30000 (30 segundos)
echo.

echo ========================================
echo LISTO! Reinicia el servidor:
echo npm run dev
echo ========================================
pause
