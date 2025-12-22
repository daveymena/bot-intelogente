@echo off
echo.
echo ========================================
echo   DESPLEGAR TIENDA A EASYPANEL
echo ========================================
echo.

echo [1/5] Verificando estado de Git...
git status

echo.
echo [2/5] Agregando cambios...
git add .

echo.
echo [3/5] Creando commit...
git commit -m "feat: Sistema de tiendas individuales con pagos integrados - Tienda individual por usuario (/tienda/[userId]) - Pagina de detalle con MercadoPago, PayPal, WhatsApp - Sistema hibrido de pagos (APIs dinamicas + links manuales) - Bot actualizado con info de metodos de pago - Componente ShareStoreButton en dashboard - Corregidos errores de imagenes y params"

echo.
echo [4/5] Subiendo a GitHub...
git push origin main

echo.
echo [5/5] Deploy iniciado!
echo.
echo ========================================
echo   DEPLOY EN PROGRESO
echo ========================================
echo.
echo Easypanel detectara el push y desplegara automaticamente.
echo.
echo Tiempo estimado: 2-3 minutos
echo.
echo Tu tienda estara disponible en:
echo https://bot-whatsapp-bot-automatizado.sqaoeo.easypanel.host/tienda/cmhjgzsjl0000t526gou8b8x2
echo.
echo Monitorea el progreso en:
echo https://easypanel.io
echo.
echo ========================================
echo   VERIFICACION POST-DEPLOY
echo ========================================
echo.
echo Despues del deploy, verifica:
echo 1. Tienda individual carga correctamente
echo 2. Productos se muestran (96 productos)
echo 3. Boton "Ver Producto" funciona
echo 4. Botones de pago aparecen (MercadoPago, PayPal, WhatsApp)
echo 5. Bot responde preguntas de pago
echo.
pause
