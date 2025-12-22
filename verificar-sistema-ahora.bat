@echo off
echo ========================================
echo VERIFICACION RAPIDA DEL SISTEMA
echo ========================================
echo.

echo 1. Verificando .env...
findstr "USE_OLLAMA" .env
echo.

echo 2. Verificando curso de piano en BD...
node ver-curso-piano.js
echo.

echo 3. Estado del servidor:
echo    - Si esta corriendo: OK
echo    - Si NO esta corriendo: Iniciar con "npm run dev"
echo.

echo ========================================
echo SIGUIENTE PASO:
echo ========================================
echo.
echo Si el servidor esta corriendo:
echo   1. Detenerlo (Ctrl+C)
echo   2. Esperar 5 segundos
echo   3. Iniciar: npm run dev
echo   4. Probar: "curso de piano"
echo.
pause
