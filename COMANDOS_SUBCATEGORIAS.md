# 🏷️ Comandos para Subcategorías

## Estado Actual
✅ 141 productos ya tienen subcategoría asignada
⚠️ 46 productos pendientes (monitores, parlantes, diademas, impresoras, etc.)

## Comandos Rápidos

### 1. Ver estado actual
```bash
npx tsx scripts/ver-subcategorias.ts
```

### 2. Asignar productos restantes (cuando DB esté disponible)
```bash
npx tsx scripts/asignar-productos-restantes.ts
```

Este script asignará automáticamente:
- **Monitores** → MONITORES
- **Parlantes/Torres de sonido** → AUDIO
- **Diademas** → DIADEMAS
- **Impresoras/Escáneres** → IMPRESORAS
- **Smartwatch, Lámpara, Hub, Micrófono, Cámara** → ACCESORIOS

### 3. Asignar manualmente un producto específico
```bash
npx tsx scripts/asignar-subcategoria-manual.ts "nombre" "SUBCATEGORIA"
```

## Subcategorías Disponibles

### Productos Físicos
- `PORTATILES` 💻
- `MOTOS` 🏍️
- `MONITORES` 🖥️
- `AUDIO` 🔊
- `DIADEMAS` 🎧
- `IMPRESORAS` 🖨️
- `ACCESORIOS` 🖱️
- `COMPONENTES` 🔧

### Productos Digitales
- `MEGAPACKS` 📦
- `CURSOS_DISENO` 🎨
- `CURSOS_PROGRAMACION` 💻
- `CURSOS_MARKETING` 📈
- `CURSOS_OFFICE` 📊
- `CURSOS_IDIOMAS` 🌍
- `CURSOS_PROFESIONALES` 👨‍🍳
- `LIBROS` 📚
- `PLANTILLAS` 📄

## Catálogo Actualizado

El catálogo en `/catalogo` ahora tiene:
1. Filtro por categoría (Físicos/Digitales/Servicios)
2. Filtro por subcategoría (dinámico según categoría)
3. Búsqueda
4. Contador de resultados

## Próximo Paso

Cuando la base de datos esté disponible, ejecuta:
```bash
npx tsx scripts/asignar-productos-restantes.ts
```

Esto completará la asignación de los 46 productos restantes.
