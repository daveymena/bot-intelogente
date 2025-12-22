# 🚨 IMPORTANTE: LEER ANTES DE PUBLICAR ANUNCIO

## ⚠️ PRECIOS EN DOCUMENTACIÓN SON EJEMPLOS

Todos los precios mencionados en la documentación ($65.000, $60.000, etc.) son **SOLO EJEMPLOS** para ilustrar el formato.

## ✅ EL BOT USA PRECIOS REALES

El bot está configurado para:
- ✅ Buscar productos en la base de datos
- ✅ Usar el precio EXACTO que está en el catálogo
- ✅ Usar la descripción EXACTA que está en el catálogo
- ✅ NO inventar información

## 🔍 VERIFICAR PRECIOS REALES

### Paso 1: Ejecutar Verificación
```bash
verificar-precios-catalogo.bat
```

### Paso 2: Ver Precios Reales
El comando mostrará:
```
🎹 CURSOS DE PIANO EN EL CATÁLOGO:
1. [Nombre del producto]
   💰 Precio REAL: $XX.XXX COP  ← USAR ESTE PRECIO

🎓 MEGAPACKS EN EL CATÁLOGO:
1. [Nombre del producto]
   💰 Precio REAL: $XX.XXX COP  ← USAR ESTE PRECIO
```

### Paso 3: Actualizar Anuncios
Usa los precios REALES que viste en el paso 2 para tus anuncios.

## 📋 Checklist Antes de Publicar

- [ ] ✅ Ejecutar `verificar-precios-catalogo.bat`
- [ ] ✅ Anotar precios REALES del catálogo
- [ ] ✅ Actualizar texto del anuncio con precios REALES
- [ ] ✅ Ejecutar `actualizar-links-entrega.bat`
- [ ] ✅ Ejecutar `probar-flujo-ventas-completo.bat`
- [ ] ✅ Verificar que bot muestra precios correctos
- [ ] ✅ Iniciar bot: `npm run dev`
- [ ] ✅ Publicar anuncio con precios REALES

## 🎯 Flujo Correcto

### 1. Verificar Catálogo
```bash
verificar-precios-catalogo.bat
```

### 2. Anotar Información Real
```
Producto: [Nombre exacto del catálogo]
Precio: $[Precio exacto del catálogo]
Descripción: [Descripción exacta del catálogo]
```

### 3. Crear Anuncio con Datos Reales
```
🎹 [NOMBRE REAL DEL PRODUCTO]

[DESCRIPCIÓN REAL DEL CATÁLOGO]

💰 Precio: $[PRECIO REAL] COP

¡Escríbenos por WhatsApp! 👇
```

### 4. Configurar Links de Entrega
```bash
actualizar-links-entrega.bat
```

### 5. Probar Todo
```bash
probar-flujo-ventas-completo.bat
```

### 6. Iniciar Bot
```bash
npm run dev
```

### 7. Publicar Anuncio
Con los datos REALES del catálogo.

## 🛡️ Protección del Sistema

El bot tiene múltiples capas de protección:

### 1. Búsqueda en Base de Datos
```typescript
// El bot SIEMPRE busca en BD primero
const product = await db.product.findFirst({
  where: { name: { contains: query } }
});
```

### 2. Uso de Datos Reales
```typescript
// Usa precio EXACTO de BD
const price = product.price;

// Usa descripción EXACTA de BD
const description = product.description;
```

### 3. Validación
```typescript
// Si no existe, no inventa
if (!product) {
  return "No encontré ese producto";
}
```

## ✅ Garantías

- ✅ El bot NO puede inventar precios
- ✅ El bot NO puede inventar descripciones
- ✅ El bot usa SOLO información de la BD
- ✅ Si no existe, dice "no disponible"

## 🚀 Comandos Rápidos

```bash
# 1. Ver precios reales
verificar-precios-catalogo.bat

# 2. Actualizar links
actualizar-links-entrega.bat

# 3. Probar todo
probar-flujo-ventas-completo.bat

# 4. Iniciar bot
npm run dev
```

## 📝 Ejemplo Real

### ❌ NO HACER (Usar ejemplos):
```
Anuncio:
🎹 Curso de Piano - $65.000  ← EJEMPLO, NO REAL
```

### ✅ HACER (Usar catálogo):
```
1. Ejecutar: verificar-precios-catalogo.bat
2. Ver precio real: $XX.XXX
3. Usar en anuncio:

🎹 Curso de Piano - $XX.XXX  ← PRECIO REAL
```

## 🎯 Resumen

1. **Documentación** = Ejemplos para ilustrar formato
2. **Base de Datos** = Fuente de verdad con precios reales
3. **Bot** = Usa SOLO información de la base de datos
4. **Anuncios** = Deben usar precios reales del catálogo

## ⚠️ IMPORTANTE

**ANTES de publicar cualquier anuncio:**

```bash
verificar-precios-catalogo.bat
```

**Y usa los precios REALES que veas ahí.**

---

## 🚨 ACCIÓN INMEDIATA

```bash
# Ejecuta AHORA para ver precios reales:
verificar-precios-catalogo.bat
```

Luego actualiza tus anuncios con esos precios reales.

---

**El bot está listo. Solo asegúrate de usar precios reales del catálogo en tus anuncios.** ✅
