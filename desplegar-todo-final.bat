@echo off
echo.
echo ========================================
echo   DESPLIEGUE FINAL A PRODUCCION
echo ========================================
echo.

echo [PASO 1/6] Verificando estado de ADMIN OWNER...
npx tsx scripts/verificar-admin-owner.ts

echo.
echo [PASO 2/6] Verificando cambios en Git...
git status

echo.
echo ¿Continuar con el despliegue? (S/N)
set /p continuar=

if /i "%continuar%" NEQ "S" (
    echo.
    echo Despliegue cancelado.
    pause
    exit /b
)

echo.
echo [PASO 3/6] Agregando todos los cambios...
git add .

echo.
echo [PASO 4/6] Creando commit...
git commit -m "feat: Sistema completo de tiendas individuales

FUNCIONALIDADES IMPLEMENTADAS:
- Tienda individual por usuario (/tienda/[userId])
- Pagina de detalle con MercadoPago, PayPal, WhatsApp
- Sistema hibrido de pagos (APIs dinamicas + links manuales)
- Bot actualizado con info de metodos de pago
- Componente ShareStoreButton en dashboard
- PWA implementada (instalable como app en telefono)
- Service Worker para funcionar offline
- Admin Owner configurado (sin limites, sin pagos)
- Corregidos errores de imagenes y params
- Eliminado conflicto de rutas

ADMIN OWNER:
- Usuario: daveymena16@gmail.com
- Rol: ADMIN
- Membresia: ENTERPRISE
- Expira: NUNCA
- Sin limites de productos/conversaciones/mensajes

URLS:
- Tienda: /tienda/cmhjgzsjl0000t526gou8b8x2
- Producto: /producto/[id]
- Dashboard: /

ESTADISTICAS:
- 96 productos disponibles
- Sistema de pagos completo
- Bot inteligente actualizado"

echo.
echo [PASO 5/6] Subiendo a GitHub...
git push origin main

echo.
echo [PASO 6/6] Deploy iniciado en Easypanel!
echo.
echo ========================================
echo   DEPLOY EN PROGRESO
echo ========================================
echo.
echo Easypanel detectara el push y desplegara automaticamente.
echo.
echo ⏱️ Tiempo estimado: 2-3 minutos
echo.
echo ========================================
echo   TUS URLS EN PRODUCCION
echo ========================================
echo.
echo 🏪 TIENDA INDIVIDUAL:
echo https://bot-whatsapp-bot-automatizado.sqaoeo.easypanel.host/tienda/cmhjgzsjl0000t526gou8b8x2
echo.
echo 🛍️ DETALLE DE PRODUCTO:
echo https://bot-whatsapp-bot-automatizado.sqaoeo.easypanel.host/producto/[id]
echo.
echo 📊 DASHBOARD:
echo https://bot-whatsapp-bot-automatizado.sqaoeo.easypanel.host
echo.
echo ========================================
echo   VERIFICACION POST-DEPLOY
echo ========================================
echo.
echo Despues del deploy (2-3 min), verifica:
echo.
echo ✅ 1. Tienda individual carga correctamente
echo ✅ 2. Productos se muestran (96 productos)
echo ✅ 3. Boton "Ver Producto" funciona
echo ✅ 4. Botones de pago aparecen (MercadoPago, PayPal, WhatsApp)
echo ✅ 5. Bot responde preguntas de pago
echo ✅ 6. Dashboard muestra "Tu Tienda Personal"
echo ✅ 7. PWA se puede instalar (boton "Instalar App")
echo ✅ 8. Funciona offline
echo ✅ 9. Eres ADMIN OWNER (sin limites)
echo.
echo ========================================
echo   ADMIN OWNER CONFIGURADO
echo ========================================
echo.
echo 👤 Usuario: daveymena16@gmail.com
echo ⭐ Rol: ADMIN
echo 💎 Membresia: ENTERPRISE
echo ♾️ Expira: NUNCA
echo 📦 Productos: 96
echo ✅ Sin limites
echo ✅ Sin pagos
echo.
echo ========================================
echo   MONITOREAR DEPLOY
echo ========================================
echo.
echo Ve a Easypanel para ver el progreso:
echo https://easypanel.io
echo.
echo Pestaña: Deployments
echo Estado: Building → Running
echo.
pause
