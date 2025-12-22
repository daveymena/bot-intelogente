# 🚀 CONFIGURAR PANEL DE PAGOS Y TAGS - GUÍA COMPLETA

## ✅ TODO FUNCIONA, PERO FALTA CONFIGURAR

Tu bot responde correctamente, pero dice "[ENLACE DE ARRIBA]" porque:
1. No has configurado los links de pago en el dashboard
2. No has configurado los tags en los productos
3. La base de datos necesita inicialización

## 📋 SOLUCIÓN EN 3 PASOS

### PASO 1: Inicializar Configuración de Pagos

En la terminal de Easypanel, ejecuta:

```bash
npx tsx scripts/inicializar-config-pagos.ts
```

Esto creará la configuración inicial de pagos en la base de datos.

### PASO 2: Acceder al Dashboard

1. Ve a: https://bot-whatsapp-what-auto2.sqaoeo.easypanel.host
2. Inicia sesión con:
   - Email: daveymena16@gmail.com
   - Password: 6715320Dvd.

### PASO 3: Configurar en el Dashboard

Una vez dentro del dashboard, verás varias secciones:

#### A) PANEL DE INTEGRACIONES DE PAGO

Busca la sección "Integraciones de Pago" o "Payment Integrations"

Aquí puedes configurar:

**Hotmart:**
- ✅ Habilitar
- API Key: (tu key de Hotmart)
- Product ID: (ID del producto)
- Checkout URL: (URL de checkout)
- Email: deinermena25@gmail.com

**MercadoPago:**
- ✅ Habilitar
- Access Token: APP_USR-8419296773492182-072623-ec7505166228860ec8b43957c948e7da-2021591453
- Public Key: APP_USR-23c2d74a-d01f-473e-a305-0e5999f023bc
- Email: deinermena25@gmail.com

**PayPal:**
- ✅ Habilitar
- Client ID: BAAtdQwVN8LvIoRstmHZWlo2ndcJBP8dFZdXLc8HJGdYUXstriO6mO0GJMZimkBCdZHotBkulELqeFm_R4
- Client Secret: EP5jZdzbUuHva4I8ERnbNYSHQ_BNe0niXQe91Bvf33Kl88nRKY-ivRx0_PGERS72JbjQSiMr63y9lEEL
- Email: deinermena25@gmail.com
- Mode: live

**Nequi:**
- ✅ Habilitar
- Teléfono: 3005560186
- Nombre: Deiner Mena

**Daviplata:**
- ✅ Habilitar
- Teléfono: 3005560186
- Nombre: Deiner Mena

**Transferencia Bancaria:**
- ✅ Habilitar
- Banco: Bancolombia
- Número de cuenta: 12345678901
- Tipo: Ahorros
- Titular: Deiner Mena

#### B) CONFIGURAR PRODUCTOS CON TAGS

Ve a la sección "Productos" y para cada producto:

1. **Edita el producto**
2. **Agrega Tags** (palabras clave que los clientes usarán):
   
   Ejemplo para "Curso de Piano":
   ```
   piano, curso piano, aprender piano, clases piano, tutorial piano
   ```

3. **Agrega Links de Pago** (si tienes links específicos):
   - Link MercadoPago: (tu link)
   - Link PayPal: (tu link)
   - Link Personalizado: (Hotmart, etc.)

4. **Guarda** los cambios

## 🎯 CÓMO FUNCIONAN LOS TAGS

Los tags permiten que el bot identifique qué producto quiere el cliente:

**Cliente dice:** "Quiero aprender piano"
**Bot detecta:** Tag "piano" → Encuentra "Curso de Piano"
**Bot responde:** Con el link de pago real

## 📝 EJEMPLO DE CONFIGURACIÓN COMPLETA

### Producto: Curso de Piano

- **Nombre:** Curso Completo de Piano
- **Precio:** $50.000 COP
- **Tags:** `piano, curso piano, aprender piano, clases piano`
- **Link MercadoPago:** https://mpago.la/tu-link
- **Link PayPal:** https://paypal.me/tu-link
- **Link Hotmart:** https://pay.hotmart.com/tu-link

### Producto: Laptop HP

- **Nombre:** Laptop HP 15.6" Intel i5
- **Precio:** $1.500.000 COP
- **Tags:** `laptop, computador, hp, portatil, notebook`
- **Link MercadoPago:** https://mpago.la/laptop-hp

## ✅ VERIFICAR QUE FUNCIONA

1. **Configura** al menos un producto con tags y link de pago
2. **Prueba** enviando un mensaje al bot con uno de los tags
3. **El bot debe responder** con el link real de pago

Ejemplo:
```
Tú: "Quiero el curso de piano"
Bot: "¡Perfecto! Aquí está el enlace de compra 🎹
👉 https://mpago.la/tu-link
Acceso inmediato después del pago. ¿Alguna duda?"
```

## 🔧 SI NO VES EL PANEL DE INTEGRACIONES

Si no aparece el panel en el dashboard, ejecuta en Easypanel:

```bash
# Verificar que las tablas existen
npx prisma db push

# Inicializar configuración
npx tsx scripts/inicializar-config-pagos.ts

# Reiniciar la aplicación
# (Easypanel lo hace automáticamente)
```

## 📚 DOCUMENTACIÓN ADICIONAL

- `PANEL_INTEGRACIONES_COMPLETO.md` - Guía completa del panel
- `CONFIGURAR_LINKS_PAGO_PRODUCTOS.md` - Cómo configurar links
- `COMO_CONFIGURAR_TAGS_PRODUCTOS.md` - Guía de tags

## 💡 TIPS

1. **Usa tags variados** - Piensa en cómo los clientes buscarían el producto
2. **Configura múltiples métodos** - Da opciones a tus clientes
3. **Prueba primero** - Verifica que los links funcionen antes de publicar
4. **Actualiza precios** - Mantén los precios actualizados en el dashboard

---

¿Necesitas ayuda con algo específico? ¡Avísame!
