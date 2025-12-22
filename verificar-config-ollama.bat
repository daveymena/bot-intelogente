@echo off
echo ========================================
echo VERIFICACION DE CONFIGURACION OLLAMA
echo ========================================
echo.

echo Verificando variables de entorno...
echo.

echo [1] OLLAMA_BASE_URL:
echo    %OLLAMA_BASE_URL%
echo.

echo [2] OLLAMA_MODEL:
echo    %OLLAMA_MODEL%
echo.

echo [3] AI_FALLBACK_ORDER:
echo    %AI_FALLBACK_ORDER%
echo.

echo [4] DISABLE_LOCAL_RESPONSES:
echo    %DISABLE_LOCAL_RESPONSES%
echo.

echo [5] AI_FALLBACK_ENABLED:
echo    %AI_FALLBACK_ENABLED%
echo.

echo ========================================
echo CONFIGURACION ESPERADA:
echo ========================================
echo [1] https://ollama-ollama.sqaoeo.easypanel.host
echo [2] llama3:8b-instruct-q2_K
echo [3] ollama
echo [4] true
echo [5] false
echo ========================================
echo.

pause
