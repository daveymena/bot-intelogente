@echo off
cls
echo.
echo ========================================
echo   SOLUCION APLICADA - REINICIAR AHORA
echo ========================================
echo.
echo PROBLEMA RESUELTO:
echo   Bot NO enviaba fotos con multiples productos
echo.
echo SOLUCION:
echo   Cambiada condicion en SimpleConversationHandler
echo   De: products.length === 1
echo   A:  products.length ^> 0
echo.
echo ========================================
echo.
echo [1/2] Cerrando puertos...
call cerrar-puertos-ahora.bat

echo.
echo [2/2] Iniciando servidor...
echo.
echo ========================================
echo   PROBAR EN WHATSAPP:
echo ========================================
echo.
echo 1. "Tiene portatil Asus"
echo    Esperado: Texto + Fotos del primer producto
echo.
echo 2. "Mega packs de idiomas"
echo    Esperado: Texto + Fotos del primer megapack
echo.
echo 3. "Curso de piano"
echo    Esperado: Texto + Fotos del curso
echo.
echo ========================================
echo   VERIFICAR EN LOGS:
echo ========================================
echo.
echo [SimpleHandler] Enviando foto del primer producto
echo [Conversacion] Procesando fotos para: ...
echo [Conversacion] Caption CARD generado
echo [Conversacion] Imagenes validas encontradas: 3
echo [Conversacion] Agregadas 3 fotos en formato CARD
echo [Conversacion] Enviando 3 fotos en formato CARD
echo.
echo ========================================
echo.

npm run dev
