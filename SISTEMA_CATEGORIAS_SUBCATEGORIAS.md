# 🏷️ Sistema de Categorías y Subcategorías

Sistema estructurado para organizar productos y facilitar la búsqueda en el bot de WhatsApp.

## 📋 Categorías Disponibles

### 💻 Computadores
- Portátiles
- Computadores de Escritorio
- Gaming
- Workstation

### 🖥️ Monitores
- Monitores Gaming
- Monitores Oficina
- Monitores Diseño

### 📷 Cámaras
- Cámaras Web
- Cámaras de Seguridad

### 🖨️ Impresoras y Scanners
- Impresoras Láser
- Impresoras de Tinta
- Scanners

### 🎧 Audio y Video
- Audífonos
- Parlantes
- Micrófonos

### 🎮 Zona Gaming
- Teclados Gaming
- Mouse Gaming
- Sillas Gaming
- Controles

### 🔌 Accesorios
- Teclados
- Mouse
- Cables y Adaptadores
- Mochilas y Maletines

### 🏠 Línea Hogar
- Electrodomésticos
- Iluminación

### 📱 Celulares
- Smartphones
- Accesorios para Celular

### 🏍️ Vehículos
- Motos
- Bicicletas

### 📚 Cursos Digitales
- Cursos de Música
- Cursos de Diseño
- Cursos de Programación
- Cursos de Idiomas

### 📦 Megapacks
- Megapack Música
- Megapack Diseño
- Megapack Desarrollo

## 🚀 Comandos Disponibles

### Asignar Subcategorías Automáticamente
```bash
npm run categories:assign
```
Este comando analiza todos los productos y les asigna automáticamente categorías y subcategorías basándose en su nombre y descripción.

### Probar el Sistema de Categorías
```bash
npm run categories:test
```
Ejecuta pruebas del sistema de categorías para verificar que funciona correctamente.

## 💬 Uso en el Bot de WhatsApp

### Cliente pregunta por categorías
**Cliente:** "¿Qué productos tienen?"
**Bot:** Muestra todas las categorías disponibles con emojis

### Cliente busca por categoría
**Cliente:** "Quiero ver portátiles"
**Bot:** Muestra todos los portátiles disponibles ordenados por precio

### Cliente busca por subcategoría
**Cliente:** "Busco teclados gaming"
**Bot:** Muestra solo teclados gaming

### Búsqueda inteligente
El sistema detecta automáticamente la categoría incluso con errores de escritura:
- "portatil" → Portátiles
- "audifonos" → Audífonos
- "curso piano" → Cursos de Música

## 🔧 Integración Técnica

### Archivos Principales

1. **`src/lib/product-categories.ts`**
   - Define todas las categorías y subcategorías
   - Palabras clave para búsqueda
   - Funciones de búsqueda

2. **`src/lib/category-search-service.ts`**
   - Servicio de búsqueda por categorías
   - Integración con base de datos
   - Generación de mensajes

3. **`src/lib/product-intelligence-service.ts`**
   - Integración con el bot
   - Detección de intención de categoría
   - Respuestas inteligentes

### Base de Datos

Los productos tienen los siguientes campos:
- `category`: Tipo de producto (PHYSICAL, DIGITAL, SERVICE)
- `subcategory`: Subcategoría específica (ej: "Portátiles")
- `customCategory`: Categoría personalizada (ej: "Computadores")

## 📊 Ejemplo de Flujo

```
Cliente: "Hola, ¿qué tienen?"
Bot: 📋 CATEGORÍAS DISPONIBLES
     💻 Computadores
        💻 Portátiles
        🖥️ Computadores de Escritorio
        🎮 Gaming
     ...

Cliente: "Quiero ver portátiles"
Bot: 💻 COMPUTADORES
     💻 Portátiles
     
     ✅ Encontré 5 productos disponibles:
     
     1. 💻 Portátil Asus Vivobook
        💰 $1.849.900 COP
        ✅ 3 disponibles
     
     2. 💻 Portátil HP 15-dy2xxx
        💰 $2.100.000 COP
        ✅ 2 disponibles
     ...

Cliente: "El número 1"
Bot: [Muestra detalles completos del producto]
```

## ✨ Ventajas

1. **Organización Clara**: Productos organizados jerárquicamente
2. **Búsqueda Fácil**: Cliente encuentra rápido lo que busca
3. **Escalable**: Fácil agregar nuevas categorías
4. **Inteligente**: Detecta categorías automáticamente
5. **Tolerante a Errores**: Funciona con errores de escritura

## 🔄 Actualización de Productos

Cuando agregas nuevos productos:

1. El sistema detecta automáticamente la categoría
2. Asigna la subcategoría correspondiente
3. El producto aparece en las búsquedas de esa categoría

Para reasignar categorías a productos existentes:
```bash
npm run categories:assign
```

## 📝 Agregar Nueva Categoría

Edita `src/lib/product-categories.ts`:

```typescript
{
  id: 'nueva-categoria',
  name: 'Nueva Categoría',
  emoji: '🆕',
  keywords: ['palabra1', 'palabra2'],
  subcategories: [
    {
      id: 'subcategoria-1',
      name: 'Subcategoría 1',
      emoji: '📌',
      keywords: ['keyword1', 'keyword2']
    }
  ]
}
```

## 🎯 Mejores Prácticas

1. **Palabras Clave**: Incluye todas las variaciones posibles
2. **Emojis**: Usa emojis descriptivos y consistentes
3. **Nombres Claros**: Nombres descriptivos y fáciles de entender
4. **Jerarquía**: Mantén máximo 2 niveles (categoría → subcategoría)
5. **Actualización**: Ejecuta `categories:assign` después de cambios

## 🐛 Solución de Problemas

### Productos sin categoría
```bash
npm run categories:assign
```

### Categoría no detectada
Agrega más palabras clave en `product-categories.ts`

### Pruebas
```bash
npm run categories:test
```

## 📚 Recursos

- Código fuente: `src/lib/product-categories.ts`
- Servicio: `src/lib/category-search-service.ts`
- Scripts: `scripts/asignar-subcategorias-automatico.ts`
- Pruebas: `scripts/test-categorias.ts`
