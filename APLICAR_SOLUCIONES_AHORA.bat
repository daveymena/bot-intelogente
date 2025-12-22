@echo off
echo ========================================
echo  APLICANDO SOLUCIONES INTEGRALES
echo ========================================
echo.

echo [1/5] Verificando productos de idiomas...
node ver-todos-productos-ahora.js | findstr /i "idioma ingles"
echo.

echo [2/5] Verificando archivo specific-product-finder.ts...
if exist "src\lib\specific-product-finder.ts" (
    echo ✅ Archivo recreado correctamente
) else (
    echo ❌ Error: Archivo no encontrado
    pause
    exit /b 1
)
echo.

echo [3/5] Verificando configuración .env...
findstr /i "USE_OLLAMA OLLAMA_BASE_URL OLLAMA_TIMEOUT" .env
echo.

echo [4/5] Cerrando puertos ocupados...
call CERRAR_PUERTOS_AHORA.bat
echo.

echo [5/5] Iniciando servidor...
echo.
echo ⚠️  IMPORTANTE: El servidor se iniciará ahora
echo ⚠️  Espera a ver "Ready in" antes de probar
echo.
echo ========================================
echo  SERVIDOR INICIANDO...
echo ========================================
echo.

npm run dev
