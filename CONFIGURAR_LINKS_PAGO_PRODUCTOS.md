# 🔗 CONFIGURAR LINKS DE PAGO EN PRODUCTOS

## ❌ PROBLEMA DETECTADO

El bot dice "no tengo link de pago" porque **los productos no tienen los links configurados en la base de datos**.

## ✅ SOLUCIÓN

### Opción 1: Desde el Dashboard (Recomendado)

1. **Inicia el servidor:**
   ```bash
   npm run dev
   ```

2. **Abre el dashboard:**
   ```
   http://localhost:3000
   ```

3. **Ve a Productos:**
   - Click en "Productos" en el menú

4. **Edita el producto:**
   - Busca "Curso Piano Profesional Completo"
   - Click en "Editar"

5. **Agrega los links:**
   - **Hotmart Link:** `https://pay.hotmart.com/TU_CODIGO`
   - **MercadoPago Link:** `https://mpago.la/TU_CODIGO`
   - **PayPal Link:** `https://paypal.me/tuusuario/60`
   - **Payment Methods:** `Hotmart, MercadoPago, PayPal, Nequi, Daviplata`

6. **Guarda los cambios**

---

### Opción 2: Con Script

1. **Edita el script:**
   ```bash
   # Abre: scripts/actualizar-links-piano.ts
   ```

2. **Reemplaza los links:**
   ```typescript
   const paymentLinks = {
     hotmartLink: 'https://pay.hotmart.com/TU_LINK_REAL',
     mercadoPagoLink: 'https://mpago.la/TU_LINK_REAL',
     paypalLink: 'https://paypal.me/tuusuario/60',
     paymentMethods: 'Hotmart, MercadoPago, PayPal, Nequi, Daviplata'
   }
   ```

3. **Ejecuta el script:**
   ```bash
   npx tsx scripts/actualizar-links-piano.ts
   ```

---

## 📋 CAMPOS DISPONIBLES

Cada producto puede tener estos campos de pago:

### Links Directos
- **hotmartLink** - Link de Hotmart
- **mercadoPagoLink** - Link de MercadoPago
- **paypalLink** - Link de PayPal
- **stripeLink** - Link de Stripe (opcional)

### Información Adicional
- **paymentMethods** - Lista de métodos aceptados
- **price** - Precio del producto
- **category** - DIGITAL o PHYSICAL

---

## 🎯 CÓMO OBTENER LOS LINKS

### Hotmart
1. Ve a tu cuenta de Hotmart
2. Selecciona tu producto
3. Ve a "Checkout" → "Link de pago"
4. Copia el link: `https://pay.hotmart.com/XXXXXXXX`

### MercadoPago
1. Ve a tu cuenta de MercadoPago
2. Crea un link de pago
3. Configura el monto
4. Copia el link: `https://mpago.la/XXXXXXX`

### PayPal
1. Usa PayPal.me: `https://paypal.me/tuusuario/MONTO`
2. O crea un botón de pago en PayPal
3. Copia el link generado

---

## 🤖 CÓMO RESPONDE EL BOT

### Cuando SÍ tiene links configurados:

```
Cliente: "quiero el link del curso de piano"

Bot: ¡Perfecto! Aquí están los métodos de pago para 
     Curso Piano Profesional Completo 🎹

     💰 Precio: 60,000 COP

     1️⃣ HOTMART (Recomendado)
        🔗 https://pay.hotmart.com/XXXXX

     2️⃣ MERCADO PAGO
        🔗 https://mpago.la/XXXXX

     3️⃣ PAYPAL
        🔗 https://paypal.me/usuario/60

     ✨ Elige el método que prefieras y completa 
        tu compra de forma segura.
```

### Cuando NO tiene links configurados:

```
Cliente: "quiero el link del curso de piano"

Bot: ¡Perfecto! Aquí están los métodos de pago para 
     Curso Piano Profesional Completo 🎹

     💰 Precio: 60,000 COP

     1️⃣ NEQUI / DAVIPLATA
        📱 Número: 3136174267

     2️⃣ TRANSFERENCIA BANCARIA
        🏦 Banco: Bancolombia
        📋 Cuenta: 12345678901

     📞 Soporte: +57 304 274 8687

     ¿Con cuál método deseas pagar?
```

---

## 🔍 VERIFICAR CONFIGURACIÓN

### Ver qué productos tienen links:

```bash
npx tsx scripts/verificar-piano-links.ts
```

Esto mostrará:
- ✅ Links configurados
- ❌ Links faltantes
- 📝 Respuesta que generará el bot

---

## 📝 ACTUALIZAR MÚLTIPLES PRODUCTOS

Si tienes varios productos digitales, puedes crear un script:

```typescript
// scripts/actualizar-todos-los-links.ts
import { db } from '../src/lib/db'

async function main() {
  // Curso de Piano
  await db.product.update({
    where: { id: 'ID_DEL_PRODUCTO' },
    data: {
      hotmartLink: 'https://pay.hotmart.com/PIANO',
      mercadoPagoLink: 'https://mpago.la/PIANO',
      paypalLink: 'https://paypal.me/usuario/60',
      paymentMethods: 'Hotmart, MercadoPago, PayPal'
    }
  })

  // Megapack
  await db.product.update({
    where: { id: 'ID_DEL_MEGAPACK' },
    data: {
      hotmartLink: 'https://pay.hotmart.com/MEGAPACK',
      mercadoPagoLink: 'https://mpago.la/MEGAPACK',
      paypalLink: 'https://paypal.me/usuario/100',
      paymentMethods: 'Hotmart, MercadoPago, PayPal'
    }
  })

  console.log('✅ Todos los links actualizados')
}

main()
```

---

## 🎯 PRODUCTOS FÍSICOS vs DIGITALES

### Productos Digitales (category: DIGITAL)
- **Requieren:** Links de pago online
- **Ejemplos:** Cursos, megapacks, software
- **Respuesta:** Links directos de Hotmart, MercadoPago, PayPal

### Productos Físicos (category: PHYSICAL)
- **Requieren:** Información de contacto
- **Ejemplos:** Laptops, motos, hardware
- **Respuesta:** Teléfono, dirección, métodos locales

---

## ✅ CHECKLIST

Para cada producto digital:

- [ ] Crear link en Hotmart
- [ ] Crear link en MercadoPago
- [ ] Crear link en PayPal
- [ ] Agregar links al producto en el dashboard
- [ ] Verificar con el script
- [ ] Probar con el bot en WhatsApp

---

## 🚀 DESPUÉS DE CONFIGURAR

1. **Reinicia el bot** (si está corriendo)
2. **Prueba en WhatsApp:**
   - "quiero el link del curso de piano"
   - "cómo pago el curso"
   - "métodos de pago piano"

3. **Verifica que responda con los links**

---

## 💡 TIPS

### Para Hotmart
- Usa el link corto de pago
- Configura el precio correcto
- Activa el checkout transparente

### Para MercadoPago
- Crea links específicos por producto
- Configura el monto exacto
- Activa notificaciones

### Para PayPal
- Usa PayPal.me para links simples
- O crea botones de pago personalizados
- Especifica el monto en el link

---

## 🔧 TROUBLESHOOTING

### El bot sigue diciendo "no tengo link"

1. **Verifica que el producto tenga los campos:**
   ```bash
   npx tsx scripts/verificar-piano-links.ts
   ```

2. **Reinicia el servidor:**
   ```bash
   # Detén el servidor (Ctrl+C)
   npm run dev
   ```

3. **Limpia la caché de Prisma:**
   ```bash
   npx prisma generate
   ```

### Los links no se muestran

1. **Verifica que sean URLs válidas**
2. **Verifica que el producto sea DIGITAL**
3. **Revisa los logs del servidor**

---

## 📚 DOCUMENTACIÓN RELACIONADA

- **CONFIGURAR_METODOS_PAGO_PRODUCTOS.md** - Métodos de pago
- **SISTEMA_PAGOS_COMPLETO.md** - Sistema de pagos
- **METODOS_PAGO.md** - Configuración general

---

**Estado:** ⏳ Pendiente de configurar links
**Acción:** Agrega los links de pago en el dashboard o con el script
**Resultado:** El bot responderá con links directos de pago

---

**Siguiente paso:** Edita el producto en el dashboard y agrega los links de Hotmart, MercadoPago y PayPal.
