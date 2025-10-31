# 🤖 Implementar Bot Inteligente para Productos Específicos

## 📋 Situación Actual

Tienes:
- ✅ Base de datos con 79 productos (con imágenes)
- ✅ Servicio WhatsApp unificado (`whatsapp-unified.ts`)
- ✅ Sistema ultra inteligente (`ultra-intelligent-system.js`)
- ✅ Servicio de IA (`ai-service.ts`)
- ❌ **FALTA**: Lógica específica para responder sobre productos individuales

## 🎯 Objetivo

El bot debe:
1. **Responder específicamente** sobre cada producto cuando se pregunta
2. **Razonamiento lógico** según la intención del cliente:
   - Si pide **información** → Dar detalles del producto
   - Si pide **precio** → Dar precio y preguntar si desea comprarlo
   - Si pide **link/enlace** → Enviar enlace de compra
   - Si quiere **comprar** → Guiar al proceso con enlace

## 📝 Ejemplos de Conversaciones Esperadas

### Ejemplo 1: Curso de Piano

**Cliente:** "Info del curso de piano"
```
🎹 Curso Piano Profesional Completo

✅ +80 lecciones en video HD
✅ Módulos progresivos
✅ Acceso de por vida
✅ Soporte directo del profesor
💰 Precio: $60.000 COP

¿Te gustaría comprarlo?
```

**Cliente:** "Cuánto cuesta el curso de piano?"
```
El Curso de Piano Profesional Completo cuesta $60.000 COP 🎹

Incluye +80 lecciones y acceso de por vida.
¿Deseas el enlace de compra?
```

**Cliente:** "Dame el link del curso de piano"
```
¡Perfecto! 🎹

Aquí está el enlace de compra:
👉 https://pay.hotmart.com/I95497720H

También puedes ver más info aquí:
📄 https://landein-page-pian2.vercel.app/
```

**Cliente:** "Quiero comprar el curso de piano"
```
¡Excelente decisión! 🎉

Curso Piano Profesional: $60.000 COP

Compra aquí:
👉 https://pay.hotmart.com/I95497720H

Acceso inmediato después del pago ✅
```

### Ejemplo 2: Laptop

**Cliente:** "Info de la laptop ASUS"
```
💻 ASUS VivoBook GO 15 - AMD Ryzen 3

✅ Procesador AMD Ryzen 3 7320U
✅ 8GB DDR5 RAM
✅ 512GB SSD
✅ Pantalla 15.6" FHD
✅ Color Silver
💰 Precio: $1.189.000 COP

📦 5 unidades disponibles
📸 5 fotos disponibles

¿Te interesa?
```

**Cliente:** "Cuánto cuesta?"
```
La ASUS VivoBook GO 15 cuesta $1.189.000 COP 💻

Tenemos 5 unidades disponibles.
¿Deseas más información o hacer el pedido?
```

**Cliente:** "Quiero comprarla"
```
¡Perfecto! 🎉

ASUS VivoBook GO 15: $1.189.000 COP

Para hacer tu pedido:
📱 WhatsApp: +57 304 274 8687
📧 Email: deinermen25@gmail.com

¿Necesitas ayuda con algo más?
```

### Ejemplo 3: Moto

**Cliente:** "Info de la moto"
```
🏍️ Bajaj Pulsar NS 160 FI 2020

✅ Cilindraje: 160cc
✅ Inyección electrónica
✅ Frenos disco delantero y trasero
✅ Excelente estado
✅ Papeles al día
✅ Mantenimiento completo
💰 Precio: $6.000.000 COP

📦 1 unidad disponible
📸 Fotos disponibles

¿Te gustaría verla?
```

## 🛠️ Implementación Necesaria

### Opción 1: Actualizar `ai-service.ts` (Recomendado)

Este archivo ya existe y se conecta con la base de datos. Necesita:

1. **Búsqueda inteligente de productos**
   - Detectar producto específico en el mensaje
   - Buscar en base de datos por nombre, tags, descripción

2. **Detección de intención**
   - Información → Mostrar detalles completos
   - Precio → Mostrar precio y stock
   - Link/Enlace → Enviar enlaces
   - Compra → Guiar al proceso

3. **Formato de respuesta**
   - Usar emojis relevantes
   - Formato claro con saltos de línea
   - Incluir precio siempre
   - Agregar call-to-action

### Opción 2: Crear `product-intelligence-service.ts`

Nuevo servicio especializado en productos:

```typescript
export class ProductIntelligenceService {
  // Buscar producto específico
  static async findProduct(query: string): Promise<Product | null>
  
  // Detectar intención del cliente
  static detectIntent(message: string): 'info' | 'price' | 'link' | 'buy' | 'general'
  
  // Generar respuesta según intención
  static generateResponse(product: Product, intent: string): string
  
  // Extraer enlaces del producto
  static extractLinks(product: Product): { info?: string, buy?: string }
}
```

## 📊 Datos Necesarios en la Base de Datos

Para que funcione correctamente, cada producto debe tener:

```json
{
  "name": "Curso Piano Profesional Completo",
  "description": "Curso 100% en línea...",
  "price": 60000,
  "stock": null,
  "category": "DIGITAL",
  "images": "['/fotos/piano1.jpg', '/fotos/piano2.jpg']",
  "tags": "[
    'piano', 
    'curso', 
    'música',
    'https://landein-page-pian2.vercel.app/',
    'https://pay.hotmart.com/I95497720H'
  ]"
}
```

**Importante:** Los enlaces deben estar en el campo `tags` como strings que empiezan con `http`

## 🔄 Flujo de Procesamiento

```
1. Cliente envía mensaje
   ↓
2. Detectar producto mencionado
   ↓
3. Buscar producto en BD
   ↓
4. Detectar intención (info/precio/link/compra)
   ↓
5. Generar respuesta específica
   ↓
6. Enviar respuesta + imágenes (si aplica)
```

## ✅ Checklist de Implementación

- [ ] Actualizar productos en BD con enlaces en tags
- [ ] Crear/actualizar servicio de inteligencia de productos
- [ ] Implementar búsqueda inteligente de productos
- [ ] Implementar detección de intención
- [ ] Crear templates de respuesta por intención
- [ ] Integrar con servicio de WhatsApp
- [ ] Probar con casos reales
- [ ] Ajustar respuestas según feedback

## 🚀 Próximos Pasos

1. **Actualizar productos con enlaces**
   ```bash
   # Crear script para agregar enlaces a productos
   npx tsx scripts/agregar-enlaces-productos.ts
   ```

2. **Crear servicio de inteligencia**
   ```bash
   # Crear nuevo archivo
   src/lib/product-intelligence-service.ts
   ```

3. **Integrar con WhatsApp**
   ```bash
   # Actualizar baileys-service.ts para usar el nuevo servicio
   ```

4. **Probar**
   ```bash
   # Iniciar bot y probar conversaciones
   iniciar-whatsapp-real.bat
   ```

## 📝 Notas Importantes

- El bot debe mantener contexto de conversación
- Si el cliente dice "ese" o "el anterior", debe recordar el último producto mencionado
- Las respuestas deben ser naturales y conversacionales
- Usar emojis relevantes pero sin exagerar
- Siempre incluir call-to-action al final

---

**¿Quieres que implemente esto ahora?** 🚀
