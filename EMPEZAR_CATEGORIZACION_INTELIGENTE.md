# 🚀 Empezar con Categorización Inteligente

## ⚡ Inicio Rápido (3 pasos)

### 1️⃣ Actualizar Base de Datos

```bash
# Opción A: Con migración (recomendado para producción)
npm run categorize:migrate

# Opción B: Push directo (más rápido para desarrollo)
npm run categorize:push
```

### 2️⃣ Categorizar Productos

```bash
# Si ya ejecutaste el paso 1, esto ya se hizo automáticamente
# Si no, ejecuta:
npm run categorize:products
```

### 3️⃣ Verificar Resultados

El script mostrará algo como:

```
🚀 Iniciando categorización automática de productos...

📦 Encontrados 68 productos para categorizar

📊 Lote 1/7
────────────────────────────────────────────────────────────
✅ Portátil Asus Vivobook 15
   → Tecnología / Laptops
   → Tags: portátil, computador, asus
   → Accesorio: No
   → Confianza: 95%

✅ Mouse Inalámbrico Logitech
   → Tecnología / Accesorios de Computador
   → Tags: mouse, inalámbrico, accesorio
   → Accesorio: Sí
   → Confianza: 90%

...

============================================================
📊 RESUMEN DE CATEGORIZACIÓN
============================================================
✅ Exitosos: 65
❌ Errores: 3
📦 Total procesados: 68
============================================================

📈 DISTRIBUCIÓN POR CATEGORÍAS:
────────────────────────────────────────────────────────────

Tecnología (45 productos):
  • Laptops: 15
  • Accesorios de Computador: 10
  • Audio: 8
  • Gaming: 7
  • Componentes: 5

Cursos Digitales (18 productos):
  • Música: 8
  • Idiomas: 6
  • Diseño: 4

Megapacks (5 productos):
  • Cursos Variados: 5

✅ Categorización completada exitosamente!
```

## 🎯 ¿Qué Hace Esto?

El sistema automáticamente:

1. **Analiza cada producto** con IA (Groq Llama 3.1)
2. **Asigna categoría principal** (Tecnología, Cursos, Megapacks, etc.)
3. **Asigna subcategoría** (Laptops, Música, etc.)
4. **Genera tags** para búsqueda inteligente
5. **Detecta accesorios** automáticamente
6. **Guarda todo en la BD** con confianza y razonamiento

## 📊 Ejemplo de Categorización

### Antes
```
Producto: "Portátil Asus Vivobook 15"
- name: "Portátil Asus Vivobook 15"
- description: "Intel Core i5, 8GB RAM, 256GB SSD"
- price: 1500000
```

### Después
```
Producto: "Portátil Asus Vivobook 15"
- name: "Portátil Asus Vivobook 15"
- description: "Intel Core i5, 8GB RAM, 256GB SSD"
- price: 1500000
- mainCategory: "Tecnología"
- subCategory: "Laptops"
- productTags: ["portátil", "computador", "asus", "intel", "i5"]
- isAccessory: false
- categorizationConfidence: 0.95
- categorizationReasoning: "Laptop de marca reconocida con especificaciones claras"
```

## 🔍 Búsqueda Mejorada

### Antes (Hardcoded)
```typescript
// ❌ Buscar "portátil" también encontraba "mouse para portátil"
if (query.includes('portátil')) {
  // Devuelve TODO lo que tenga "portátil" en el nombre
}
```

### Después (Inteligente)
```typescript
// ✅ Buscar solo laptops, sin accesorios
const laptops = await db.product.findMany({
  where: {
    mainCategory: 'Tecnología',
    subCategory: 'Laptops',
    isAccessory: false  // 🎯 Excluye accesorios
  }
})
```

## 🎨 Categorías Disponibles

### 💻 Tecnología
- Laptops
- Computadores de Escritorio
- Tablets
- Celulares
- Accesorios de Computador
- Audio
- Gaming
- Componentes
- Redes
- Almacenamiento

### 📚 Cursos Digitales
- Música
- Idiomas
- Programación
- Diseño
- Marketing
- Negocios
- Desarrollo Personal

### 📦 Megapacks
- Cursos Variados
- Recursos Digitales
- Plantillas
- Software

### 🛠️ Servicios
- Reparación
- Instalación
- Consultoría
- Soporte Técnico

## 🔄 Re-categorizar Productos

Si necesitas re-categorizar (por ejemplo, después de editar descripciones):

```bash
npm run categorize:products
```

El script detectará productos ya categorizados y preguntará si quieres re-categorizarlos.

## 🐛 Solución de Problemas

### Error: "GROQ_API_KEY no configurada"

Asegúrate de tener tu API key en `.env`:
```env
GROQ_API_KEY=tu_api_key_aqui
```

### Error en Migración

Si `categorize:migrate` falla:
```bash
# Usar push directo
npm run categorize:push
```

### Productos No Categorizados

Si algunos productos no se categorizaron:
1. Verifica que tengan nombre y descripción
2. Revisa los logs para ver el error específico
3. Ejecuta de nuevo: `npm run categorize:products`

## 📝 Próximos Pasos

Una vez categorizados los productos:

1. ✅ **Actualizar servicio de búsqueda** - Usar categorías en lugar de hardcoding
2. ✅ **Agregar filtros en dashboard** - Filtrar por categoría/subcategoría
3. ✅ **Mejorar respuestas del bot** - Usar categorías para respuestas más precisas
4. ✅ **Implementar recomendaciones** - Sugerir productos de la misma categoría

## 🎓 Documentación Completa

Ver: `SISTEMA_CATEGORIZACION_INTELIGENTE.md`

## 💡 Tips

1. **Primera vez**: Usa `categorize:push` (más rápido)
2. **Producción**: Usa `categorize:migrate` (más seguro)
3. **Re-categorizar**: Solo ejecuta `categorize:products`
4. **Verificar**: Revisa el dashboard después de categorizar

## 🚀 ¡Listo!

Después de estos pasos, tu sistema tendrá:
- ✅ Productos categorizados inteligentemente
- ✅ Búsqueda más precisa
- ✅ Sin hardcoding de categorías
- ✅ Listo para multi-tenant
