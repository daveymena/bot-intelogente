# 🛒 Guía para Importar Productos de MegaComputer

## 📊 Estado Actual

Tienes **51 productos** en tu base de datos:
- 11 productos originales (laptops, periféricos, moto, cursos)
- 40 megapacks digitales

## 🎯 Objetivo

Importar los ~70 productos de tu proveedor MegaComputer (https://megacomputer.com.co/)

---

## ⚠️ Limitación

No puedo hacer web scraping directamente de sitios externos. Pero te doy 3 opciones:

---

## Opción 1: Exportar desde MegaComputer (Recomendada)

Si tienes acceso como distribuidor, pídeles:

1. **CSV o Excel** con el catálogo completo
2. **API** si tienen disponible
3. **Archivo JSON** con los productos

### Formato ideal del archivo:
```csv
nombre,descripcion,precio,categoria,imagen_url,marca,modelo
"Laptop HP...",  "Descripción...", 1500000, "Laptops", "https://...", "HP", "Victus"
```

Una vez tengas el archivo, te ayudo a importarlo automáticamente.

---

## Opción 2: Usar una Herramienta de Scraping

### Herramientas Recomendadas:

#### A) ParseHub (Gratis, Visual)
1. Descarga: https://www.parsehub.com/
2. Abre MegaComputer.com.co
3. Selecciona los productos visualmente
4. Exporta a JSON/CSV
5. Dame el archivo y lo importo

#### B) Octoparse (Gratis, Fácil)
1. Descarga: https://www.octoparse.com/
2. Crea un proyecto con la URL
3. Configura qué datos extraer
4. Exporta y me lo pasas

#### C) Web Scraper (Chrome Extension)
1. Instala: https://webscraper.io/
2. Crea un sitemap para MegaComputer
3. Extrae productos
4. Exporta a CSV

---

## Opción 3: Script Manual (Te ayudo)

Si me das la estructura HTML de una página de producto, te creo un script de Node.js que extraiga todo.

### Pasos:

1. Abre MegaComputer.com.co
2. Ve a un producto
3. Click derecho → Inspeccionar
4. Copia el HTML de un producto
5. Pégamelo y te creo el scraper

---

## 📝 Formato que Necesito

Para importar automáticamente, necesito un archivo con esta estructura:

### JSON:
```json
[
  {
    "nombre": "Laptop HP Victus 15",
    "descripcion": "Gaming laptop con RTX 3050",
    "precio": 3200000,
    "categoria": "Laptops",
    "marca": "HP",
    "modelo": "Victus 15",
    "imagen": "https://megacomputer.com.co/imagen.jpg",
    "especificaciones": {
      "procesador": "Intel i5",
      "ram": "16GB",
      "almacenamiento": "512GB SSD"
    }
  }
]
```

### CSV:
```csv
nombre,descripcion,precio,categoria,marca,imagen
"Laptop HP Victus","Gaming laptop",3200000,"Laptops","HP","https://..."
```

---

## 🚀 Una Vez Tengas el Archivo

Te creo un script que:

1. ✅ Lee el archivo (JSON/CSV/Excel)
2. ✅ Descarga las imágenes automáticamente
3. ✅ Las guarda en `public/fotos/`
4. ✅ Crea todos los productos en la base de datos
5. ✅ Asigna tags automáticamente
6. ✅ Configura respuestas automáticas

---

## 💡 Alternativa Rápida

Si quieres empezar YA, puedo:

1. Usar las fotos que ya tienes en `public/fotos/`
2. Crear productos genéricos basados en los nombres de las fotos
3. Tú editas los detalles desde el dashboard

### Ejemplo:

Tienes: `portatil_hp_victus_15fa1029nr__1.webp`

Creo automáticamente:
- **Nombre**: Portátil HP Victus 15-fa1029nr
- **Categoría**: PHYSICAL
- **Fotos**: Las 5 imágenes correspondientes
- **Tags**: hp, victus, gaming, laptop
- **Precio**: Lo configuras tú después

---

## 🎯 ¿Qué Prefieres?

1. **Opción A**: Dame un CSV/JSON de MegaComputer
2. **Opción B**: Uso las fotos actuales y creo productos genéricos
3. **Opción C**: Me das HTML de ejemplo y te creo el scraper

Dime cuál prefieres y continuamos. 🚀

---

## 📊 Productos Actuales

Ya tienes estos productos funcionando:
- ✅ 11 productos físicos con fotos
- ✅ 40 megapacks digitales
- ✅ 1 curso de piano
- ✅ 1 moto Bajaj

**Total: 51 productos listos para vender**

El bot ya puede responder sobre todos estos productos automáticamente.
