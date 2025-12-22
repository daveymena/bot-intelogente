# 💳 Configurar Métodos de Pago en Productos

## 🔴 PROBLEMA ACTUAL

El bot está enviando links genéricos en lugar de los métodos de pago reales configurados.

## ✅ SOLUCIÓN

Cada producto debe tener sus métodos de pago configurados en los **tags**.

## 📋 CÓMO CONFIGURAR

### Opción 1: Desde el Dashboard (Recomendado)

1. Ve al Dashboard → Productos
2. Edita el producto (ej: "Curso Piano")
3. En el campo **"Etiquetas (separadas por comas)"**, pega esto:

```
nequi:3042748687, daviplata:3042748687, hotmart:https://pay.hotmart.com/TU-LINK-REAL, mercadopago:https://mpago.la/TU-LINK-REAL, paypal:https://paypal.me/TU-LINK-REAL, whatsapp:+573042748687, curso, digital
```

4. Guarda el producto

**IMPORTANTE:** El sistema convierte automáticamente el texto separado por comas en un array JSON. NO necesitas poner corchetes `[]` ni comillas `""`.

### Opción 2: Script en Producción

Conéctate a tu servidor de Easypanel y ejecuta:

```bash
# Conectar al contenedor
docker exec -it [nombre-contenedor] sh

# Ejecutar script
npx tsx scripts/actualizar-metodos-pago-piano.ts
```

## 🎯 FORMATO DE TAGS

### Para Productos Digitales (Cursos, Megapacks):

```
nequi:3042748687, daviplata:3042748687, hotmart:https://pay.hotmart.com/LINK-PRODUCTO, mercadopago:https://mpago.la/LINK-PRODUCTO, paypal:https://paypal.me/LINK-PRODUCTO, whatsapp:+573042748687, curso, digital, acceso_inmediatoInvalid `prisma.user.findUnique()` invocation: error: Error validating datasource `db`: the URL must start with the protocol `postgresql://` or `postgres://`. --> schema.prisma:9 | 8 | provider = "postgresql" 9 | url = env("DATABASE_URL") | Validation Error Count: 1


## 🔑 OBTENER TUS LINKS REALES

### Hotmart:
1. Ve a tu cuenta de Hotmart
2. Productos → Selecciona tu producto
3. Copia el link de pago
4. Formato: `hotmart:https://pay.hotmart.com/TU-LINK`

### Mercado Pago:
1. Ve a tu cuenta de Mercado Pago
2. Crear link de pago
3. Ingresa producto y precio
4. Copia el link generado
5. Formato: `mercadopago:https://mpago.la/TU-LINK`

### PayPal:
1. Ve a tu cuenta de PayPal
2. Crear botón de pago o link
3. Copia el link
4. Formato: `paypal:https://paypal.me/TU-LINK`

## 📊 EJEMPLO COMPLETO: Curso de Piano

**Nombre:** Curso Piano Profesional Completo  
**Precio:** 150000  
**Descripción:** Aprende piano desde cero hasta nivel avanzado  
**Etiquetas (campo Tags):**

```
nequi:3042748687, daviplata:3042748687, hotmart:https://pay.hotmart.com/curso-piano-profesional, mercadopago:https://mpago.la/1234567, paypal:https://paypal.me/tecnovariedades/150000, whatsapp:+573042748687, curso, digital, piano, musica
```

## 🤖 CÓMO RESPONDERÁ EL BOT

Una vez configurado, cuando un cliente pregunte por el curso de piano, el bot responderá:

```
🎹 Curso Piano Profesional Completo
💰 Precio: $150.000 COP

📝 Aprende piano desde cero hasta nivel avanzado

💳 Métodos de pago:
💚 Nequi: 3042748687
💙 Daviplata: 3042748687
🌐 Hotmart: [link]
💰 Mercado Pago: [link]
🌍 PayPal: [link]
📱 WhatsApp: +57 304 274 8687

¿Con cuál método prefieres pagar?
```

## ⚡ ACTUALIZACIÓN RÁPIDA

Si quieres actualizar TODOS los productos con los métodos de pago básicos:

```typescript
// Script: actualizar-todos-metodos-pago.ts
const tagsBasicos = [
  "nequi:3042748687",
  "daviplata:3042748687",
  "whatsapp:+573042748687",
  "efectivo:Bogotá,Medellín,Cali"
]

// Actualizar todos los productos
await prisma.product.updateMany({
  data: {
    tags: JSON.stringify(tagsBasicos)
  }
})
```

## 🎯 PRIORIDAD

1. **Curso de Piano** (el que probaste)
2. **Megapacks** (productos digitales más vendidos)
3. **Laptops** (productos físicos)
4. **Motos** (productos físicos)

## ✅ VERIFICAR QUE FUNCIONA

1. Actualiza el producto con los tags
2. Reinicia el bot (o espera hot reload)
3. Envía un audio: "Hola, tienes disponible el curso de piano?"
4. El bot debería responder con los métodos de pago configurados

## 📝 NOTA IMPORTANTE

Los métodos de pago se leen de:
1. **Tags del producto** (prioridad)
2. **Variables de entorno** (fallback)

Si el producto no tiene tags, el bot usará los métodos configurados en las variables de entorno (Nequi, Daviplata, etc.)
