# 🏷️ Sistema de Subcategorías para Catálogo

## ✅ Implementado

Sistema completo de subcategorías para organizar el catálogo y la tienda.

## 📋 Subcategorías Disponibles

### Productos Físicos (PHYSICAL)
- **PORTATILES** 💻 - Laptops, notebooks, computadores portátiles
- **MOTOS** 🏍️ - Motocicletas, scooters
- **ACCESORIOS** 🖱️ - Mouse, teclados, audífonos, cables, fundas
- **COMPONENTES** 🔧 - RAM, discos, SSD, procesadores, tarjetas

### Productos Digitales (DIGITAL)
- **MEGAPACKS** 📦 - Todos los megapacks
- **CURSOS_DISENO** 🎨 - Photoshop, Illustrator, After Effects, diseño gráfico
- **CURSOS_PROGRAMACION** 💻 - Python, JavaScript, desarrollo web
- **CURSOS_MARKETING** 📈 - Marketing digital, ventas, redes sociales
- **CURSOS_OFFICE** 📊 - Excel, Word, PowerPoint, Office
- **CURSOS_IDIOMAS** 🌍 - Inglés, francés, alemán, etc.
- **CURSOS_PROFESIONALES** 👨‍🍳 - Gastronomía, construcción, oficios
- **LIBROS** 📚 - Libros digitales, ebooks, audiolibros
- **PLANTILLAS** 📄 - Plantillas, templates, presets

## 🚀 Comandos

### 1. Ver subcategorías actuales
```bash
npx tsx scripts/ver-subcategorias.ts
```

### 2. Asignar subcategorías automáticamente
```bash
npx tsx scripts/asignar-subcategorias-automatico.ts
```

Este script analiza el nombre y descripción de cada producto y asigna automáticamente la subcategoría más apropiada.

### 3. Asignar subcategoría manualmente
```bash
npx tsx scripts/asignar-subcategoria-manual.ts "nombre del producto" "SUBCATEGORIA"
```

Ejemplos:
```bash
# Asignar todos los megapacks
npx tsx scripts/asignar-subcategoria-manual.ts "Mega Pack" "MEGAPACKS"

# Asignar portátiles
npx tsx scripts/asignar-subcategoria-manual.ts "Portátil" "PORTATILES"

# Asignar cursos de diseño
npx tsx scripts/asignar-subcategoria-manual.ts "Photoshop" "CURSOS_DISENO"
```

## 🎨 Catálogo Mejorado

El catálogo ahora tiene:

1. **Filtro por categoría principal** (Físicos, Digitales, Servicios)
2. **Filtro por subcategoría** (se muestra dinámicamente según la categoría)
3. **Contador de resultados** (muestra cuántos productos se están viendo)
4. **Búsqueda** (funciona en conjunto con los filtros)

### Flujo de usuario:
1. Usuario entra al catálogo → ve todos los productos
2. Selecciona "Productos Digitales" → aparecen subcategorías de digitales
3. Selecciona "📦 Megapacks" → solo ve megapacks
4. Puede buscar dentro de los megapacks

## 📁 Archivos Modificados

- `src/app/catalogo/page.tsx` - Catálogo con filtros de subcategoría
- `scripts/ver-subcategorias.ts` - Ver subcategorías actuales
- `scripts/asignar-subcategorias-automatico.ts` - Asignación automática
- `scripts/asignar-subcategoria-manual.ts` - Asignación manual

## 🔄 Próximos Pasos

1. Ejecutar el script automático para asignar subcategorías
2. Revisar productos sin subcategoría
3. Asignar manualmente los que no se detectaron
4. Verificar el catálogo en el navegador

## 💡 Notas

- Las subcategorías se detectan por palabras clave en nombre y descripción
- Puedes agregar más subcategorías editando el script automático
- El catálogo se actualiza en tiempo real al cambiar filtros
- Los filtros son acumulativos (categoría + subcategoría + búsqueda)
