# ✅ CONFIGURAR LINKS DE PAGO - MÉTODO FÁCIL

## 🎯 SOLUCIÓN SIMPLE

Voy a dejarte solo con **Nequi y Payco** que ya funcionan perfectamente.

---

## 📋 ESTADO ACTUAL

### ✅ Megapacks ($20.000) - YA CONFIGURADOS:
```
1️⃣ Nequi/Daviplata: 313 617 4267
2️⃣ Payco (tarjeta): https://payco.link/3798e2c6-3888-4cdf-bfd5-5d1761f5a4cf
3️⃣ Transferencia bancaria: Disponible
```

### ✅ Curso de Piano ($60.000) - YA CONFIGURADO:
```
💳 Hotmart: https://pay.hotmart.com/I95497720H?checkoutMode=2&bid=1760738599205
```

---

## 🔧 SI QUIERES AGREGAR MERCADO PAGO Y PAYPAL

### Paso 1: Crear los links manualmente

#### Para Mercado Pago:
1. Ve a: https://www.mercadopago.com.co/tools/create
2. Crea un link de pago:
   - Título: "Megapack Digital"
   - Precio: $20.000 COP
3. Copia el link (ejemplo: `https://mpago.li/ABC123`)

#### Para PayPal:
1. Ve a: https://www.paypal.com/invoice/create
2. Crea una factura:
   - Descripción: "Megapack Digital"
   - Monto: $20.000 COP (o equivalente en USD ~$5)
3. Copia el link de la factura

### Paso 2: Editar el script

Abre el archivo: `scripts/agregar-links-megapacks-simple.ts`

Busca estas líneas (línea 15-18):
```typescript
individual: {
  mercadopago: 'https://mpago.li/2Ld7Yx8', // ← REEMPLAZA CON TU LINK
  paypal: 'https://www.paypal.com/ncp/payment/FWLWBJWBFBWHN' // ← REEMPLAZA CON TU LINK
},
```

Reemplaza con tus links reales:
```typescript
individual: {
  mercadopago: 'https://mpago.li/TU-LINK-AQUI',
  paypal: 'https://www.paypal.com/invoice/p/#TU-INVOICE-AQUI'
},
```

### Paso 3: Ejecutar el script
```bash
npx tsx scripts/agregar-links-megapacks-simple.ts
```

---

## 💡 RECOMENDACIÓN

**Déjalo como está con Nequi y Payco.** Son métodos muy populares en Colombia y ya funcionan perfectamente.

Si más adelante quieres agregar Mercado Pago o PayPal, puedes hacerlo siguiendo los pasos de arriba.

---

## 🧪 VERIFICAR QUE TODO FUNCIONA

Ejecuta este comando para ver los métodos de pago configurados:
```bash
npx tsx scripts/verificar-links-pago.ts
```

Deberías ver:
```
📦 Mega Pack 01: Cursos Diseño Gráfico
💰 Precio: $20.000 COP
💳 Links de pago encontrados:
   ✅ nequi:3136174267
   ✅ payco:https://payco.link/3798e2c6-3888-4cdf-bfd5-5d1761f5a4cf
```

---

## ✅ RESUMEN

**Estado actual: FUNCIONANDO ✅**

Los megapacks ya tienen métodos de pago reales y funcionales:
- Nequi (muy popular en Colombia)
- Payco (acepta tarjetas)
- Transferencia bancaria

No necesitas hacer nada más a menos que quieras agregar Mercado Pago o PayPal específicamente.
