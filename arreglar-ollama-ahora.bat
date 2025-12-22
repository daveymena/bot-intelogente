@echo off
echo ========================================
echo   ARREGLAR CONFIGURACION OLLAMA
echo ========================================
echo.
echo Problema detectado:
echo - Tu .env tiene OLLAMA_URL
echo - Pero el codigo busca OLLAMA_BASE_URL
echo.
echo Solucion:
echo - Agregar OLLAMA_BASE_URL al .env
echo.
pause

echo.
echo [1/3] Verificando configuracion actual...
type .env | findstr OLLAMA_URL
echo.

echo [2/3] Agregando OLLAMA_BASE_URL...
echo OLLAMA_BASE_URL=https://davey-ollama2.mapf5v.easypanel.host >> .env
echo.

echo [3/3] Verificando configuracion nueva...
type .env | findstr OLLAMA
echo.

echo ========================================
echo   CONFIGURACION ACTUALIZADA
echo ========================================
echo.
echo Ahora reinicia el servidor:
echo 1. Detener el servidor (Ctrl+C)
echo 2. Ejecutar: npm run dev
echo.
echo Luego prueba: "Busco uno para diseñar"
echo.
pause
