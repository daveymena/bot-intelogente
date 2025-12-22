# 🚀 Desplegar Tienda Individual a Easypanel

## 📋 Resumen de Cambios

### ✅ Nuevas Funcionalidades Implementadas:

1. **Tienda Individual por Usuario** (`/tienda/[userId]`)
   - Muestra solo productos del usuario específico
   - Pública (sin login)
   - Botones: "Ver Producto" + "Consultar WhatsApp"

2. **Página de Detalle de Producto** (`/producto/[id]`)
   - Botones de pago: MercadoPago, PayPal, WhatsApp
   - Sistema híbrido: APIs dinámicas (tu caso) o links manuales (otros usuarios)
   - Galería de imágenes
   - Selector de cantidad

3. **Bot Actualizado**
   - Información completa de métodos de pago
   - Envía link de tienda automáticamente
   - Responde preguntas sobre pagos

4. **Componente ShareStoreButton**
   - Botón en dashboard para copiar/compartir URL de tienda
   - Contador de productos

## 🔗 Tu URL de Tienda en Easypanel

Una vez desplegado, tu tienda estará disponible en:
```
https://bot-whatsapp-bot-automatizado.sqaoeo.easypanel.host/tienda/cmhjgzsjl0000t526gou8b8x2
```

## 📦 Archivos Modificados/Creados

### Nuevos Archivos:
- `src/app/tienda/[userId]/page.tsx` - Tienda individual
- `src/app/producto/[id]/page.tsx` - Detalle de producto
- `src/app/api/products/by-user/[userId]/route.ts` - API para productos por usuario
- `src/components/ShareStoreButton.tsx` - Botón compartir tienda
- `scripts/obtener-url-tienda.ts` - Script para ver URLs
- `scripts/probar-tienda-usuario.ts` - Script de prueba

### Archivos Modificados:
- `src/app/tienda/page.tsx` - Corregido manejo de imágenes
- `src/lib/training-data.ts` - Agregada info de pagos
- `src/components/dashboard/main-dashboard.tsx` - Agregado ShareStoreButton
- `next.config.ts` - Agregados dominios de imágenes
- `src/app/api/products/by-user/[userId]/route.ts` - Corregido await params

### Archivos Eliminados:
- `src/app/tienda/[id]/` - Movido a `/producto/[id]`
- `src/app/favicon.ico` - Eliminado duplicado

## 🚀 Pasos para Desplegar

### 1. Verificar Estado Local
```bash
# Ver archivos modificados
git status

# Ver cambios
git diff
```

### 2. Agregar Cambios a Git
```bash
# Agregar todos los cambios
git add .

# Verificar qué se agregó
git status
```

### 3. Crear Commit
```bash
git commit -m "feat: Sistema de tiendas individuales con pagos integrados

- Tienda individual por usuario (/tienda/[userId])
- Página de detalle con MercadoPago, PayPal, WhatsApp
- Sistema híbrido de pagos (APIs dinámicas + links manuales)
- Bot actualizado con info de métodos de pago
- Componente ShareStoreButton en dashboard
- Corregidos errores de imágenes y params
- Eliminado conflicto de rutas [id] vs [userId]"
```

### 4. Push a GitHub
```bash
# Push a la rama principal
git push origin main
```

### 5. Easypanel Deploy Automático
Easypanel detectará el push y desplegará automáticamente en 2-3 minutos.

## 🔍 Verificar Despliegue

### 1. Monitorear en Easypanel
1. Ve a tu proyecto en Easypanel
2. Pestaña "Deployments"
3. Verás el nuevo deploy en progreso
4. Espera a que muestre "Running"

### 2. Verificar URLs

Una vez desplegado, verifica estas URLs:

#### Tu Tienda Individual:
```
https://bot-whatsapp-bot-automatizado.sqaoeo.easypanel.host/tienda/cmhjgzsjl0000t526gou8b8x2
```

#### Detalle de Producto (ejemplo):
```
https://bot-whatsapp-bot-automatizado.sqaoeo.easypanel.host/producto/[id-producto]
```

#### Dashboard:
```
https://bot-whatsapp-bot-automatizado.sqaoeo.easypanel.host
```

### 3. Probar Funcionalidades

#### Prueba 1: Tienda Individual
1. Abre tu URL de tienda
2. Verifica que se muestren tus 96 productos
3. Prueba la búsqueda
4. Prueba los filtros

#### Prueba 2: Detalle de Producto
1. Click en "Ver Producto" en cualquier producto
2. Verifica que se muestren los botones:
   - MercadoPago
   - PayPal
   - WhatsApp
3. Verifica que los links funcionen

#### Prueba 3: Bot de WhatsApp
1. Envía mensaje: "¿Cómo puedo pagar?"
2. Verifica que responda con métodos de pago
3. Verifica que envíe el link de tu tienda

#### Prueba 4: Dashboard
1. Inicia sesión en el dashboard
2. Ve a la página principal
3. Verifica que aparezca "Tu Tienda Personal"
4. Prueba el botón "Copiar URL"

## ⚠️ Posibles Problemas y Soluciones

### Problema 1: Deploy Falla
**Solución:**
```bash
# Ver logs en Easypanel
# O reintentar el deploy manualmente
```

### Problema 2: Imágenes No Cargan
**Causa:** Dominios no configurados en `next.config.ts`
**Solución:** Ya agregados en el código

### Problema 3: Error 404 en Rutas
**Causa:** Caché de Next.js
**Solución:** Easypanel reconstruye desde cero, no debería pasar

### Problema 4: Links de Pago No Funcionan
**Causa:** APIs no configuradas
**Solución:** Verifica variables de entorno en Easypanel:
- `MERCADOPAGO_ACCESS_TOKEN`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`

## 📊 Variables de Entorno Requeridas

Verifica que estas variables estén configuradas en Easypanel:

### Esenciales:
```env
DATABASE_URL=postgresql://...
GROQ_API_KEY=gsk_...
NEXT_PUBLIC_APP_URL=https://bot-whatsapp-bot-automatizado.sqaoeo.easypanel.host
```

### Para Pagos (Opcionales):
```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=live
```

### Para WhatsApp:
```env
NEXT_PUBLIC_WHATSAPP_NUMBER=573005560186
```

## ✅ Checklist Post-Despliegue

- [ ] Deploy completado exitosamente
- [ ] Tienda individual carga correctamente
- [ ] Productos se muestran (96 productos)
- [ ] Búsqueda funciona
- [ ] Filtros funcionan
- [ ] Botón "Ver Producto" funciona
- [ ] Página de detalle carga
- [ ] Botones de pago aparecen
- [ ] Links de MercadoPago funcionan
- [ ] Links de PayPal funcionan
- [ ] Botón WhatsApp funciona
- [ ] Bot responde preguntas de pago
- [ ] Bot envía link de tienda
- [ ] Dashboard muestra ShareStoreButton
- [ ] Botón "Copiar URL" funciona

## 🎯 Próximos Pasos Después del Deploy

### 1. Compartir Tu Tienda
```
🛍️ ¡Visita mi tienda online!
✅ 96 productos disponibles
✅ Pago con MercadoPago, PayPal o WhatsApp
✅ Envíos a toda Colombia

👉 https://bot-whatsapp-bot-automatizado.sqaoeo.easypanel.host/tienda/cmhjgzsjl0000t526gou8b8x2
```

### 2. Actualizar Bot
El bot ya tiene la URL actualizada en el training data.

### 3. Crear Código QR
Genera un QR de tu URL en:
- https://www.qr-code-generator.com/

### 4. Agregar a Redes Sociales
- Instagram Bio
- Facebook
- WhatsApp Status
- Email signature

## 📝 Notas Importantes

### Tiempo de Deploy:
- Commit + Push: 1 minuto
- Easypanel Build: 2-3 minutos
- **Total: ~5 minutos**

### Caché:
- Easypanel reconstruye desde cero
- No hay problemas de caché
- Todos los cambios se reflejan

### Base de Datos:
- Los productos ya están en la BD
- No se pierden datos
- Todo sigue funcionando

### WhatsApp:
- La conexión se mantiene
- No necesita reconectar
- Sigue respondiendo

## 🆘 Soporte

Si algo falla:
1. Revisa los logs en Easypanel
2. Verifica las variables de entorno
3. Prueba las URLs manualmente
4. Revisa la consola del navegador (F12)

## ✅ ¡Listo para Desplegar!

Ejecuta el script de despliegue:
```bash
./desplegar-tienda-easypanel.bat
```

O manualmente:
```bash
git add .
git commit -m "feat: Sistema de tiendas individuales"
git push origin main
```

Luego espera 2-3 minutos y tu tienda estará en producción! 🚀
