# Asignar Subcategorías - Guía Manual

## Problema

El bot confunde productos porque no tienen subcategorías asignadas. Por ejemplo:
- Buscar "portátiles" muestra tintas y pilas
- Buscar "curso de piano" muestra otros cursos

## Solución

Ya implementamos la lógica de búsqueda que usa subcategorías. Ahora necesitas asignar subcategorías a tus productos.

## Opción 1: Desde el Dashboard (Recomendado)

1. Ve al Dashboard → Productos
2. Edita cada producto
3. Agrega el campo **Subcategoría**:
   - Laptops: `"laptop"`, `"portatil"`, `"gaming"`, `"oficina"`
   - Motos: `"scooter"`, `"deportiva"`, `"urbana"`
   - Cursos: `"piano"`, `"guitarra"`, `"idiomas"`, `"programacion"`
   - Megapacks: `"musica"`, `"diseño"`, `"negocios"`
   - Servicios: `"reparacion"`, `"mantenimiento"`
   - Accesorios: `"tinta"`, `"cartucho"`, `"papel"`

## Opción 2: Script Automático (Cuando tengas acceso a BD)

El script `scripts/asignar-subcategorias-automatico.ts` ya está creado.

**Ejecutar cuando estés conectado a la BD de producción:**

```bash
# Desde Easypanel o servidor con acceso a PostgreSQL
npx tsx scripts/asignar-subcategorias-automatico.ts
```

El script detecta automáticamente subcategorías basándose en:
- Nombre del producto
- Descripción
- Tags existentes
- Categoría principal

## Opción 3: SQL Directo (Rápido)

Si tienes acceso a la consola de PostgreSQL:

```sql
-- Laptops y computadores
UPDATE "Product" 
SET subcategory = 'laptop' 
WHERE LOWER(name) LIKE '%laptop%' 
   OR LOWER(name) LIKE '%portatil%'
   OR LOWER(name) LIKE '%computador%';

-- Motos
UPDATE "Product" 
SET subcategory = 'motocicleta' 
WHERE LOWER(name) LIKE '%moto%';

-- Cursos de piano
UPDATE "Product" 
SET subcategory = 'piano' 
WHERE LOWER(name) LIKE '%piano%' 
   AND category = 'DIGITAL';

-- Cursos de idiomas
UPDATE "Product" 
SET subcategory = 'idiomas' 
WHERE (LOWER(name) LIKE '%ingles%' 
    OR LOWER(name) LIKE '%frances%'
    OR LOWER(name) LIKE '%aleman%'
    OR LOWER(name) LIKE '%idioma%')
   AND category = 'DIGITAL';

-- Megapacks de música
UPDATE "Product" 
SET subcategory = 'musica' 
WHERE LOWER(name) LIKE '%musica%' 
   OR LOWER(name) LIKE '%musical%';

-- Megapacks de diseño
UPDATE "Product" 
SET subcategory = 'diseño' 
WHERE LOWER(name) LIKE '%diseño%' 
   OR LOWER(name) LIKE '%grafico%';

-- Servicios técnicos
UPDATE "Product" 
SET subcategory = 'reparacion' 
WHERE category = 'SERVICE';

-- Tintas y cartuchos
UPDATE "Product" 
SET subcategory = 'tinta' 
WHERE LOWER(name) LIKE '%tinta%' 
   OR LOWER(name) LIKE '%cartucho%'
   OR LOWER(name) LIKE '%toner%';

-- Pilas y baterías
UPDATE "Product" 
SET subcategory = 'bateria' 
WHERE LOWER(name) LIKE '%pila%' 
   OR LOWER(name) LIKE '%bateria%';
```

## Subcategorías Recomendadas por Tipo

### Productos Físicos (PHYSICAL)
- **Computadores**: `laptop`, `desktop`, `gaming`, `oficina`, `estudiante`
- **Motos**: `scooter`, `deportiva`, `urbana`, `electrica`
- **Accesorios**: `tinta`, `cartucho`, `papel`, `cable`, `mouse`, `teclado`
- **Pilas**: `bateria`, `cargador`, `powerbank`

### Productos Digitales (DIGITAL)
- **Cursos**: `piano`, `guitarra`, `idiomas`, `programacion`, `diseño`, `marketing`
- **Megapacks**: `musica`, `diseño`, `negocios`, `educacion`, `software`
- **Software**: `windows`, `office`, `adobe`, `antivirus`

### Servicios (SERVICE)
- **Técnicos**: `reparacion`, `mantenimiento`, `instalacion`, `soporte`
- **Consultoría**: `asesoria`, `capacitacion`, `consultoria`

## Verificar Resultados

Después de asignar subcategorías, prueba:

```bash
# Buscar portátiles (solo debe mostrar laptops)
"Hola, busco portátiles"

# Buscar curso de piano (solo cursos de piano)
"Quiero aprender piano"

# Buscar tintas (solo tintas/cartuchos)
"Necesito tintas para impresora"
```

## Mejoras Implementadas

El sistema ahora:
- ✅ Penaliza productos de categorías incorrectas (-50 puntos)
- ✅ Da bonus a productos con subcategoría correcta (+15 puntos)
- ✅ Detecta automáticamente la categoría esperada desde la query
- ✅ Prioriza productos específicos sobre packs genéricos

## Resultado Esperado

**Antes:**
```
Usuario: "portátiles"
Bot: Te muestro:
1. Laptop ASUS
2. Tinta HP ❌
3. Pilas Duracell ❌
```

**Después:**
```
Usuario: "portátiles"
Bot: Te muestro:
1. Laptop ASUS ✅
2. Laptop Lenovo ✅
3. Laptop HP ✅
```

---

**Nota:** Las mejoras en el código ya están aplicadas. Solo falta asignar las subcategorías a los productos existentes usando cualquiera de las 3 opciones anteriores.
