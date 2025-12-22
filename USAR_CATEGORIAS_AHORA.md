# 🚀 Usar Sistema de Categorías - AHORA

## ⚡ Pasos Rápidos

### 1️⃣ Asignar Categorías a Productos Existentes
```bash
npm run categories:assign
```
Esto analiza todos tus productos y les asigna automáticamente categorías y subcategorías.

### 2️⃣ Probar el Sistema
```bash
npm run categories:test
```
Verifica que el sistema funciona correctamente.

### 3️⃣ Reiniciar el Bot
```bash
npm run dev
```

## 💬 Cómo Funciona en WhatsApp

### El cliente puede preguntar:

**Opción 1: Ver todas las categorías**
```
Cliente: "¿Qué productos tienen?"
Cliente: "Mostrar categorías"
Cliente: "Ver catálogo"
```

**Opción 2: Buscar por categoría**
```
Cliente: "Quiero ver portátiles"
Cliente: "Tienen motos?"
Cliente: "Cursos de música"
```

**Opción 3: Buscar por subcategoría**
```
Cliente: "Teclados gaming"
Cliente: "Monitores para diseño"
Cliente: "Audífonos"
```

## 📋 Categorías Configuradas

✅ **Computadores** (Portátiles, Escritorio, Gaming, Workstation)
✅ **Monitores** (Gaming, Oficina, Diseño)
✅ **Audio y Video** (Audífonos, Parlantes, Micrófonos)
✅ **Zona Gaming** (Teclados, Mouse, Sillas, Controles)
✅ **Accesorios** (Teclados, Mouse, Cables, Mochilas)
✅ **Celulares** (Smartphones, Accesorios)
✅ **Vehículos** (Motos, Bicicletas)
✅ **Cursos Digitales** (Música, Diseño, Programación, Idiomas)
✅ **Megapacks** (Música, Diseño, Desarrollo)
✅ Y más...

## 🎯 Ventajas

1. **Búsqueda Más Fácil**: Cliente encuentra productos rápido
2. **Organización Clara**: Todo bien categorizado
3. **Automático**: Se asigna solo a productos nuevos
4. **Inteligente**: Detecta errores de escritura
5. **Visual**: Con emojis para mejor experiencia

## 🔄 Agregar Más Categorías

Edita: `src/lib/product-categories.ts`

Ejemplo:
```typescript
{
  id: 'tablets',
  name: 'Tablets',
  emoji: '📱',
  keywords: ['tablet', 'ipad'],
  subcategories: [
    {
      id: 'tablets-android',
      name: 'Tablets Android',
      emoji: '🤖',
      keywords: ['android', 'samsung', 'huawei']
    }
  ]
}
```

Luego ejecuta:
```bash
npm run categories:assign
```

## ✅ Verificar que Funciona

1. Ejecuta: `npm run categories:test`
2. Inicia el bot: `npm run dev`
3. Envía mensaje de WhatsApp: "¿Qué productos tienen?"
4. Deberías ver todas las categorías con emojis

## 📊 Ver Productos por Categoría

En el dashboard puedes filtrar productos por:
- Categoría principal
- Subcategoría
- Categoría personalizada

## 🎨 Personalizar Mensajes

Edita: `src/lib/product-categories.ts`

Funciones:
- `generateCategoriesMessage()` - Mensaje de todas las categorías
- `generateSubcategoriesMessage()` - Mensaje de subcategorías

## 🐛 Si Algo No Funciona

1. Verifica que ejecutaste: `npm run categories:assign`
2. Reinicia el bot: `npm run dev`
3. Revisa logs en consola
4. Ejecuta pruebas: `npm run categories:test`

## 📝 Notas Importantes

- Las categorías se asignan automáticamente a productos nuevos
- Puedes reasignar categorías en cualquier momento
- El sistema es tolerante a errores de escritura
- Funciona en español con acentos y sin acentos

## 🎉 ¡Listo!

Tu bot ahora tiene un sistema de categorías profesional como las grandes tiendas online.

Los clientes pueden navegar fácilmente por tu catálogo y encontrar exactamente lo que buscan.
