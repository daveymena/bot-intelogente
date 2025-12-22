# 💳 CONFIGURACIÓN DE MÉTODOS DE PAGO

## 📋 MÉTODOS DISPONIBLES POR TIPO DE PRODUCTO

### 🎓 PRODUCTOS DIGITALES (Cursos, Megapacks)
```
✅ MercadoPago (tarjeta, PSE, efectivo)
✅ PayPal (tarjeta internacional)
✅ Consignación Bancaria
```

### 📦 PRODUCTOS FÍSICOS (Laptops, Motos, etc.)
```
✅ MercadoPago (tarjeta, PSE, efectivo)
✅ PayPal (tarjeta internacional)
✅ Consignación Bancaria
✅ Nequi (transferencia móvil)
✅ Daviplata (transferencia móvil)
✅ Contraentrega (pago al recibir)
```

---

## 🔧 CONFIGURACIÓN CENTRALIZADA

### Archivo: `src/lib/payment-methods-config.ts`

Este archivo centraliza toda la configuración de métodos de pago:

```typescript
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'mercadopago',
    name: 'MercadoPago',
    icon: '💳',
    description: 'Tarjeta, PSE, Efectivo',
    availableFor: 'all', // Disponible para todos
    instructions: '...',
  },
  {
    id: 'nequi',
    name: 'Nequi',
    icon: '📱',
    description: 'Transferencia móvil',
    availableFor: 'physical', // Solo productos físicos
    instructions: '...',
    accountInfo: {
      number: '3136174267',
    },
  },
  // ... más métodos
];
```

---

## 📊 LÓGICA DE DETECCIÓN

### ¿Cómo se determina si un producto es digital?

```typescript
PaymentMethodsConfig.isDigitalProduct(product)
```

**Palabras clave detectadas**:
- curso
- megapack
- digital
- online
- ebook
- software
- licencia
- descarga
- virtual
- electrónico

**Busca en**:
- `product.category`
- `product.name`
- `product.type`

---

## 💬 EJEMPLO DE CONVERSACIÓN

### Producto Digital (Curso de Piano)

```
👤 Cliente: "Cómo puedo pagar?"

🤖 Bot: "¡Perfecto! 💳 Puedes pagar *Curso de Piano* por:

💰 *Monto:* 65.000 COP

📱 *Métodos de Pago:*

1️⃣ *MercadoPago* 💳
   Tarjeta, PSE, Efectivo

2️⃣ *PayPal* 💰
   Tarjeta internacional

3️⃣ *Consignación Bancaria* 🏦
   Bancolombia y otros bancos

¿Con cuál método prefieres pagar? 🤔"

👤 Cliente: "MercadoPago"

🤖 Bot: "¡Excelente elección! 💳

📦 *Producto:* Curso de Piano
💰 *Monto:* 65.000 COP

🔗 *Link de pago:*
https://www.mercadopago.com.co/...

💳 *MercadoPago:*

*Pasos:*
1️⃣ Haz clic en el link
2️⃣ Elige tu método (tarjeta, PSE, efectivo)
3️⃣ Completa el pago

📧 *Entrega:* Recibirás el acceso por correo inmediatamente después de confirmar el pago ✅"
```

### Producto Físico (Portátil Acer)

```
👤 Cliente: "Cómo puedo pagar?"

🤖 Bot: "¡Perfecto! 💳 Puedes pagar *Portátil Acer A15* por:

💰 *Monto:* 1.899.900 COP

📱 *Métodos de Pago:*

1️⃣ *MercadoPago* 💳
   Tarjeta, PSE, Efectivo

2️⃣ *PayPal* 💰
   Tarjeta internacional

3️⃣ *Consignación Bancaria* 🏦
   Bancolombia y otros bancos

4️⃣ *Nequi* 📱
   Transferencia móvil

5️⃣ *Daviplata* 📱
   Transferencia móvil

6️⃣ *Contraentrega* 🚚
   Pago al recibir (solo algunas zonas)

¿Con cuál método prefieres pagar? 🤔"

👤 Cliente: "Contraentrega"

🤖 Bot: "¡Excelente elección! 💳

📦 *Producto:* Portátil Acer A15
💰 *Monto:* 1.899.900 COP

🚚 *Pago Contraentrega:*

*Monto a pagar:* 1.899.900 COP
*Producto:* Portátil Acer A15

*Pasos:*
1️⃣ Confirma tu dirección de entrega
2️⃣ Pagas cuando recibas el producto
3️⃣ Verifica el producto antes de pagar

⚠️ *Nota:* Disponible solo en algunas zonas.
Confirma disponibilidad con nosotros.

📦 *Envío:* Procesaremos tu pedido inmediatamente después de confirmar el pago ✅"
```

---

## 🚫 VALIDACIÓN DE MÉTODOS

### Ejemplo: Cliente intenta usar contraentrega para producto digital

```
👤 Cliente: "Contraentrega"

🤖 Bot: "⚠️ *Contraentrega* no está disponible para productos digitales.

Por favor elige otro método de pago."
```

---

## 🔧 INFORMACIÓN DE CUENTAS

### Consignación Bancaria
```
Banco: Bancolombia
Tipo de cuenta: Ahorros
Número: 123-456789-01
Titular: Tecnovariedades D&S
```

### Nequi / Daviplata
```
Número: 3136174267
```

---

## 📝 CÓMO AGREGAR UN NUEVO MÉTODO

### 1. Editar `src/lib/payment-methods-config.ts`

```typescript
{
  id: 'nuevo_metodo',
  name: 'Nuevo Método',
  icon: '🆕',
  description: 'Descripción breve',
  availableFor: 'all', // 'all', 'physical', o 'digital'
  instructions: `*Pasos:*
1️⃣ Paso 1
2️⃣ Paso 2
3️⃣ Paso 3`,
  accountInfo: {
    // Información de cuenta si es necesario
    number: '123456789',
  },
}
```

### 2. Actualizar detección en `PaymentAgent`

```typescript
// En detectPaymentMethod()
if (msg.includes('nuevo_metodo') || msg === 'nuevo_metodo') {
  return 'nuevo_metodo';
}
```

### 3. Listo! El sistema lo usará automáticamente

---

## 🧪 CÓMO PROBAR

### 1. Ejecutar test
```bash
npx tsx scripts/test-sistema-conversacional-completo.ts
```

### 2. Probar con WhatsApp
```bash
npm run dev
```

### 3. Enviar mensajes de prueba
```
"Hola"
"Busco un curso"
"De piano"
"Cómo puedo pagar?"
"MercadoPago"
```

---

## 📊 MÉTODOS POR CATEGORÍA

### Métodos Virtuales (Online)
- ✅ MercadoPago
- ✅ PayPal

### Transferencias Móviles
- ✅ Nequi (solo físicos)
- ✅ Daviplata (solo físicos)

### Transferencias Bancarias
- ✅ Consignación Bancaria (todos)

### Pago en Efectivo
- ✅ Contraentrega (solo físicos)
- ✅ MercadoPago efectivo (todos)

---

## 🎯 VENTAJAS DEL SISTEMA

### ✅ Centralizado
- Toda la configuración en un solo archivo
- Fácil de mantener y actualizar

### ✅ Validación Automática
- Detecta automáticamente si un producto es digital
- Valida que el método esté disponible
- Muestra mensajes de error apropiados

### ✅ Flexible
- Fácil agregar nuevos métodos
- Fácil cambiar información de cuentas
- Fácil personalizar instrucciones

### ✅ Consistente
- Mismo formato en todos los agentes
- Mismas instrucciones en toda la app
- Misma lógica de validación

---

## 🔄 ACTUALIZAR INFORMACIÓN DE CUENTAS

### Cambiar número de Nequi/Daviplata

Editar en `src/lib/payment-methods-config.ts`:

```typescript
{
  id: 'nequi',
  // ...
  accountInfo: {
    number: 'NUEVO_NUMERO', // ← Cambiar aquí
  },
}
```

### Cambiar cuenta bancaria

```typescript
{
  id: 'consignacion',
  // ...
  accountInfo: {
    bank: 'Bancolombia',
    accountType: 'Ahorros',
    number: 'NUEVA_CUENTA', // ← Cambiar aquí
    holder: 'Tecnovariedades D&S',
  },
}
```

---

## 📚 ARCHIVOS RELACIONADOS

```
src/lib/payment-methods-config.ts     ← Configuración centralizada
src/agents/payment-agent.ts           ← Agente de pagos
src/lib/payment-link-generator.ts     ← Generador de links
```

---

## ✅ CHECKLIST DE CONFIGURACIÓN

- [x] Métodos definidos en payment-methods-config.ts
- [x] Detección de producto digital implementada
- [x] Validación de métodos disponibles
- [x] Instrucciones personalizadas por método
- [x] Información de cuentas actualizada
- [x] Mensajes de error apropiados
- [x] Integración con PaymentAgent
- [x] Tests funcionando

---

**¡La configuración de métodos de pago está completa y lista para usar! 💳**
