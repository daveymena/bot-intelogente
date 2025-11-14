# 🧠 SISTEMA DE BÚSQUEDA INTELIGENTE DE PRODUCTOS

## ✅ IMPLEMENTADO

Sistema completo que permite al bot entender nombres parciales de productos y enviar foto + información en un solo mensaje.

## 🎯 Problema Resuelto

**ANTES:**
```
Cliente: "Me interesa el ryzen 3 720u me puedes enviar fotos?"
Bot: "No encontré ese producto" ❌
```

**AHORA:**
```
Cliente: "Me interesa el ryzen 3 720u me puedes enviar fotos?"
Bot: [FOTO] + "✨ Portatil Asus Vivobook S16 M3607ha-Rp111 
      Amd Ryzen™ 9 270 Ddr5 16gb + Slot Adic 512gb Ssd 16″ Wuxga
      💰 Precio: $2,850,000
      📋 Especificaciones: ..." ✅
```

## 🚀 Características

### 1. Búsqueda Inteligente con IA
- **Entiende nombres parciales**: "ryzen 3 720u" → encuentra el producto completo
- **Usa contexto**: Si ya habló de un portátil, sabe cuál es
- **Razonamiento profundo**: Analiza marca, procesador, uso, etc.
- **Confianza medible**: Solo responde si está seguro (>70%)

### 2. Envío Unificado
- **Foto + Texto juntos**: Un solo mensaje con toda la información
- **Caption inteligente**: Nombre, precio, especificaciones
- **Múltiples fotos**: Hasta 3 fotos del producto

### 3. Fallback Inteligente
- Si no encuentra con IA → búsqueda tradicional
- Si no hay foto → solo texto
- Si falla todo → respuesta del sistema híbrido normal

## 📁 Archivos Creados

### 1. `src/lib/intelligent-product-search.ts`
Sistema principal de búsqueda con IA:
- `intelligentProductSearch()` - Búsqueda con IA
- `generateProductResponse()` - Genera respuesta con foto
- `hybridProductSearch()` - Búsqueda con fallback

### 2. `src/lib/media-service.ts`
Servicio para preparar imágenes:
- Descarga desde URL
- Lee desde archivo local
- Valida imágenes
- Prepara buffer para WhatsApp

### 3. `src/lib/baileys-stable-service.ts` (MODIFICADO)
Integración en el bot:
- Detecta intención de búsqueda
- Llama a búsqueda inteligente
- Envía foto + texto juntos
- Fallback a sistema híbrido

## 🧪 Cómo Probar

```bash
# 1. Probar búsqueda inteligente
node botexperimento/test-busqueda-inteligente.js

# 2. Casos de prueba incluidos:
# - "Me interesa el ryzen 3 720u"
# - "Si de ese envíame fotos"
# - "Necesito uno para trabajo"
# - "Tienes algún Asus?"
# - "Ese me gusta, cuánto cuesta?"
```

## 🎯 Ejemplos de Uso

### Ejemplo 1: Nombre Parcial
```
Cliente: "ryzen 3 720u"
IA: Busca productos con "Ryzen 3" y "7320U"
Bot: [FOTO] + Info del Asus Vivobook
```

### Ejemplo 2: Contexto
```
Cliente: "Me interesa el portátil Asus"
Bot: "Tengo el Asus Vivobook..."
Cliente: "Ese, envíame fotos"
IA: Usa contexto → sabe que es el Vivobook
Bot: [FOTO] + Info
```

### Ejemplo 3: Por Uso
```
Cliente: "Necesito uno para trabajo"
IA: Busca portátiles apropiados para trabajo
Bot: [FOTO] + Info del mejor match
```

## 🔧 Configuración

### Variables de Entorno
```env
GROQ_API_KEY=tu_api_key_aqui
```

### Base de Datos
Asegúrate de tener productos con:
- `name` - Nombre completo
- `description` - Descripción
- `price` - Precio
- `images` - Array de URLs de fotos
- `specifications` - JSON con specs
- `isActive` - true

## 📊 Flujo del Sistema

```
1. Cliente envía mensaje
   ↓
2. Bot detecta intención de búsqueda
   ↓
3. Búsqueda inteligente con IA
   ├─ Analiza mensaje
   ├─ Revisa contexto
   ├─ Compara con productos
   └─ Calcula confianza
   ↓
4. Si confianza >= 70%
   ├─ Genera respuesta
   ├─ Prepara foto
   └─ Envía foto + texto juntos
   ↓
5. Si confianza < 70%
   └─ Usa sistema híbrido normal
```

## 🎨 Formato de Respuesta

```
✨ *Nombre del Producto*

Descripción del producto...

💰 *Precio:* $2,850,000

📋 *Especificaciones:*
• Procesador: AMD Ryzen 9
• RAM: 16GB DDR5
• Almacenamiento: 512GB SSD
• Pantalla: 16" WUXGA

🏷️ *Categoría:* Portátiles

¿Te gustaría más información o proceder con la compra? 😊
```

## 🔍 Patrones de Detección

El sistema entiende:
- **Procesadores**: "ryzen 3", "ryzen 5", "i5", "i7"
- **Marcas**: "Asus", "HP", "Lenovo", "Dell"
- **Uso**: "trabajo", "gaming", "estudio"
- **Referencias**: "ese", "el que mencionaste"
- **Solicitudes**: "fotos", "imágenes", "ver", "envíame"

## ⚡ Optimizaciones

1. **Cache de productos**: Carga una vez, usa múltiples veces
2. **Timeout de IA**: 10 segundos máximo
3. **Fallback rápido**: Si IA falla, búsqueda tradicional
4. **Límite de fotos**: Máximo 3 fotos por producto
5. **Compresión**: Imágenes optimizadas para WhatsApp

## 🐛 Manejo de Errores

- ❌ IA no responde → Búsqueda tradicional
- ❌ Foto no disponible → Solo texto
- ❌ URL inválida → Intenta archivo local
- ❌ Producto no existe → Sistema híbrido normal
- ❌ Error de red → Reintenta 3 veces

## 📈 Métricas

El sistema registra:
- Confianza de búsqueda (0-100%)
- Tiempo de respuesta
- Productos encontrados
- Fotos enviadas
- Errores y fallbacks

## 🎯 Próximos Pasos

1. ✅ Búsqueda inteligente implementada
2. ✅ Envío de foto + texto juntos
3. ⏳ Análisis de imágenes con IA
4. ⏳ Recomendaciones personalizadas
5. ⏳ Comparación de productos

## 🚀 Cómo Activar

El sistema está **ACTIVO AUTOMÁTICAMENTE** en el bot.

Solo asegúrate de:
1. Tener `GROQ_API_KEY` configurada
2. Productos en la BD con fotos
3. Bot conectado a WhatsApp

## 📞 Soporte

Si el bot no encuentra productos:
1. Verifica que existan en la BD
2. Revisa que tengan `isActive: true`
3. Confirma que las fotos sean URLs válidas
4. Prueba con el script de test

---

**Estado**: ✅ IMPLEMENTADO Y LISTO
**Versión**: 1.0.0
**Fecha**: 2025-11-06
