@echo off
echo.
echo ========================================
echo   REINICIAR Y PROBAR FOTOS CARD
echo ========================================
echo.

echo [1/3] Ejecutando test automatico...
node test-envio-fotos-card.js

echo.
echo [2/3] Cerrando puertos ocupados...
call cerrar-puertos-ahora.bat

echo.
echo [3/3] Iniciando servidor...
echo.
echo ========================================
echo   SERVIDOR INICIANDO...
echo ========================================
echo.
echo Probar en WhatsApp:
echo   1. "Mega packs de idiomas"
echo   2. "Quiero el curso de reparacion de celular"
echo   3. "Estoy interesado en el curso de piano"
echo.
echo Verificar:
echo   - Fotos con caption CARD profesional
echo   - Precios correctos de la BD
echo   - NO inventa informacion
echo.
echo ========================================
echo.

npm run dev
