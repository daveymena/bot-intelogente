@echo off
echo ========================================
echo   ARREGLAR TIMEOUT DE OLLAMA
echo ========================================
echo.
echo Problema: OLLAMA_TIMEOUT=30000 (muy corto)
echo Solucion: OLLAMA_TIMEOUT=90000 (90 segundos)
echo.
pause

echo.
echo [1/2] Creando backup del .env...
copy .env .env.backup.timeout
echo ✅ Backup creado: .env.backup.timeout
echo.

echo [2/2] Actualizando OLLAMA_TIMEOUT...
powershell -Command "(Get-Content .env) -replace 'OLLAMA_TIMEOUT=30000', 'OLLAMA_TIMEOUT=90000' | Set-Content .env"
echo ✅ OLLAMA_TIMEOUT actualizado a 90000ms (90 segundos)
echo.

echo Verificando cambio...
type .env | findstr OLLAMA_TIMEOUT
echo.

echo ========================================
echo   TIMEOUT ACTUALIZADO
echo ========================================
echo.
echo Ahora reinicia el servidor:
echo 1. Detener (Ctrl+C)
echo 2. Ejecutar: npm run dev
echo.
echo El timeout ahora es de 90 segundos.
echo.
pause
