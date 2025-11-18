@echo off
echo ========================================
echo VERIFICACION DE RAZONAMIENTO PROFUNDO
echo ========================================
echo.

echo [1/3] Verificando variable AI_USE_REASONING...
findstr /C:"AI_USE_REASONING" .env
echo.

echo [2/3] Verificando modelo de Groq...
findstr /C:"GROQ_MODEL" .env
echo.

echo [3/3] Estado de Git...
git status --short
echo.

echo ========================================
echo CONFIGURACION ACTUAL:
echo ========================================
echo.
echo Debe mostrar:
echo   AI_USE_REASONING=true
echo   GROQ_MODEL=llama-3.3-70b-versatile
echo.
echo ========================================
echo SIGUIENTE PASO EN EASYPANEL:
echo ========================================
echo.
echo 1. Ve a tu servicio
echo 2. Click "Rebuild"
echo 3. Espera 3-5 minutos
echo 4. Limpia cache: Ctrl + Shift + R
echo 5. Prueba: "El mega pack 1 de diseño grafico"
echo.
echo ========================================
pause
