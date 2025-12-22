# 🏷️ Cómo Configurar Tags en Productos

## ✅ FORMATO CORRECTO

En el Dashboard, cuando editas un producto, verás un campo que dice:

**"Etiquetas (separadas por comas)"**

Ahí debes pegar tus métodos de pago así:

```
nequi:3042748687, daviplata:3042748687, hotmart:https://pay.hotmart.com/tu-link, mercadopago:https://mpago.la/tu-link, whatsapp:+573042748687
```

## 🔄 Cómo Funciona Internamente

1. **Tú escribes**: `nequi:3042748687, daviplata:3042748687`
2. **El sistema convierte a**: `["nequi:3042748687","daviplata:3042748687"]`
3. **Se guarda en la BD como**: String JSON
4. **El bot lo lee como**: Array de strings

## 📋 Ejemplos por Tipo de Producto

### Curso Digital (Piano)

```
nequi:3042748687, daviplata:3042748687, hotmart:https://pay.hotmart.com/curso-piano, whatsapp:+573042748687, curso, digital, piano, musica
```

### Megapack Digital

```
nequi:3042748687, daviplata:3042748687, hotmart:https://pay.hotmart.com/megapack, mercadopago:https://mpago.la/megapack, whatsapp:+573042748687, megapack, digital
```

### Laptop (Producto Físico)

```
nequi:3042748687, daviplata:3042748687, mercadopago:https://mpago.la/laptop, whatsapp:+573042748687, laptop, computadora, fisico
```

### Moto (Producto Físico)

```
nequi:3042748687, daviplata:3042748687, whatsapp:+573042748687, efectivo, moto, vehiculo, fisico
```

## 🎯 Tipos de Tags Soportados

### Métodos de Pago:
- `nequi:NUMERO` - Número de Nequi
- `daviplata:NUMERO` - Número de Daviplata
- `hotmart:URL` - Link de pago de Hotmart
- `mercadopago:URL` - Link de pago de MercadoPago
- `paypal:URL` - Link de pago de PayPal
- `whatsapp:NUMERO` - Número de WhatsApp con código de país

### Palabras Clave (para búsqueda):
- `curso`, `digital`, `piano`, `musica`
- `laptop`, `computadora`, `fisico`
- `moto`, `vehiculo`, `transporte`
- `megapack`, `coleccion`

## ⚠️ Errores Comunes

### ❌ INCORRECTO:
```
["nequi:3042748687","daviplata:3042748687"]
```
No pongas corchetes ni comillas manualmente.

### ❌ INCORRECTO:
```
nequi:3042748687,daviplata:3042748687
```
Sin espacios después de las comas es difícil de leer.

### ✅ CORRECTO:
```
nequi:3042748687, daviplata:3042748687, hotmart:https://pay.hotmart.com/link
```
Texto simple, separado por comas, con espacios.

## 🤖 Cómo el Bot Usa los Tags

Cuando un cliente pregunta por un producto, el bot:

1. **Busca el producto** por nombre o palabras clave en los tags
2. **Extrae los métodos de pago** de los tags que tienen formato `tipo:valor`
3. **Genera la respuesta** con los métodos disponibles

Ejemplo de respuesta del bot:

```
🎹 Curso Piano Profesional Completo
💰 $150.000 COP

📝 Aprende piano desde cero hasta nivel avanzado

💳 Métodos de pago disponibles:
💚 Nequi: 3042748687
💙 Daviplata: 3042748687
🌐 Hotmart: https://pay.hotmart.com/curso-piano
📱 WhatsApp: +57 304 274 8687

¿Con cuál método prefieres pagar?
```

## 🚀 Pasos Rápidos

1. **Abre tu Dashboard** en Easypanel
2. **Ve a Productos**
3. **Edita el producto** que quieres configurar
4. **En el campo "Etiquetas"**, pega:
   ```
   nequi:3042748687, daviplata:3042748687, hotmart:TU-LINK-AQUI, whatsapp:+573042748687
   ```
5. **Guarda**
6. **Prueba** enviando un mensaje al bot preguntando por ese producto

## ✅ Verificar que Funciona

Después de configurar:

1. Envía un audio al bot: "Hola, tienes disponible el curso de piano?"
2. El bot debe responder con los métodos de pago que configuraste
3. Si no aparecen, verifica que los tags estén bien escritos

## 🔧 Solución de Problemas

### El bot no muestra los métodos de pago:
- Verifica que los tags tengan el formato `tipo:valor`
- Asegúrate de que no haya espacios dentro del formato (ej: `nequi: 123` está mal)
- Revisa que los links estén completos y empiecen con `https://`

### Los tags no se guardan:
- Asegúrate de hacer clic en "Guardar" o "Actualizar"
- Verifica que no haya caracteres especiales raros
- Intenta con menos tags primero para probar

### El bot muestra links genéricos:
- Significa que el producto no tiene tags configurados
- Agrega los tags como se indica arriba
- Espera unos segundos para que el sistema actualice (hot reload)

## 📞 Soporte

Si tienes problemas, revisa:
- `CONFIGURAR_METODOS_PAGO_PRODUCTOS.md` - Guía completa
- `scripts/verificar-metodos-pago.ts` - Script para verificar configuración
- `scripts/actualizar-metodos-pago-piano.ts` - Script para actualizar automáticamente
