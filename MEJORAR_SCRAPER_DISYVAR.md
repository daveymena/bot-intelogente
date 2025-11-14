# 🔧 Mejorar Scraper de Disyvar

## 📊 Situación Actual

El scraper básico solo extrajo **16 productos** porque:
- El sitio usa JavaScript para cargar productos
- Tiene lazy loading (carga al hacer scroll)
- La estructura HTML es compleja (Tiendanube)
- Necesita esperar a que el DOM se cargue completamente

## ✅ Solución: Puppeteer

He creado un scraper mejorado que usa **Puppeteer** (navegador headless) para:
- ✅ Ejecutar JavaScript del sitio
- ✅ Hacer scroll automático para cargar todos los productos
- ✅ Esperar a que los elementos se carguen
- ✅ Extraer datos correctamente

## 🚀 Ejecutar Scraper Mejorado

```bash
npx tsx scripts/scrape-disyvar-puppeteer.ts
```

Este scraper:
1. Abre un navegador headless (Chrome)
2. Navega a la página de productos
3. Hace scroll para cargar lazy loading
4. Extrae TODOS los productos visibles
5. Enriquece los primeros 20 con detalles completos
6. Guarda en `scripts/disyvar-productos.json`

## 📈 Resultados Esperados

Con Puppeteer deberías obtener:
- **50-150 productos** (depende del catálogo actual)
- Información completa de cada producto
- Imágenes correctas (no placeholders)
- Precios precisos
- URLs funcionales

## 🔄 Comparación

### Scraper Básico (Axios + Cheerio)
```
❌ Solo HTML estático
❌ No ejecuta JavaScript
❌ No maneja lazy loading
❌ 16 productos extraídos
```

### Scraper Mejorado (Puppeteer)
```
✅ Navegador real
✅ Ejecuta JavaScript
✅ Maneja lazy loading
✅ 50-150+ productos esperados
```

## 🎯 Pasos Siguientes

### 1. Ejecutar Scraper Mejorado

```bash
npx tsx scripts/scrape-disyvar-puppeteer.ts
```

### 2. Verificar Resultados

```bash
# Ver cuántos productos se extrajeron
cat scripts/disyvar-productos.json | findstr "name"
```

### 3. Importar a Base de Datos

```bash
npx tsx scripts/import-disyvar.ts
```

## 🐛 Si Aún Hay Pocos Productos

### Opción 1: Aumentar Tiempo de Espera

Edita `scripts/scrape-disyvar-puppeteer.ts`:

```typescript
// Línea ~60
await page.goto(`${BASE_URL}/productos/`, {
  waitUntil: 'networkidle2',
  timeout: 120000  // Aumentar a 2 minutos
});
```

### Opción 2: Scrapear Categorías Específicas

Agrega más URLs para scrapear:

```typescript
const urls = [
  `${BASE_URL}/productos/`,
  `${BASE_URL}/productos/categoria-1/`,
  `${BASE_URL}/productos/categoria-2/`,
  // Agrega más categorías
];

for (const url of urls) {
  await page.goto(url, { waitUntil: 'networkidle2' });
  // ... extraer productos
}
```

### Opción 3: Hacer Más Scroll

Aumenta el scroll automático:

```typescript
// En la función autoScroll
const distance = 200; // Aumentar distancia
// O agregar más tiempo
await new Promise(resolve => setTimeout(resolve, 5000));
```

## 📝 Estructura del Sitio Disyvar

El sitio usa **Tiendanube** (plataforma e-commerce):

```html
<div class="js-item-product" data-product-id="...">
  <a href="/productos/nombre-producto/">
    <img class="js-item-image" data-src="imagen.jpg">
    <div class="js-item-name">Nombre del Producto</div>
    <span class="js-price-display">$99.990</span>
    <span class="js-compare-price-display">$129.990</span>
  </a>
</div>
```

## 🔍 Debugging

### Ver qué está scrapeando

Cambia `headless: true` a `headless: false`:

```typescript
const browser = await puppeteer.launch({
  headless: false,  // Ver el navegador
  args: ['--no-sandbox']
});
```

Esto abrirá una ventana de Chrome para ver qué está haciendo.

### Tomar Screenshots

Agrega después de cargar la página:

```typescript
await page.screenshot({ path: 'debug-disyvar.png', fullPage: true });
console.log('📸 Screenshot guardado en debug-disyvar.png');
```

### Ver HTML Extraído

```typescript
const html = await page.content();
fs.writeFileSync('debug-disyvar.html', html);
console.log('📄 HTML guardado en debug-disyvar.html');
```

## 💡 Alternativa: Scraper Manual

Si Puppeteer no funciona bien, puedes:

1. **Visitar el sitio manualmente**
2. **Abrir DevTools** (F12)
3. **Ejecutar en consola:**

```javascript
// Extraer todos los productos visibles
const products = [];
document.querySelectorAll('.js-item-product').forEach(el => {
  const name = el.querySelector('.js-item-name')?.textContent?.trim();
  const price = el.querySelector('.js-price-display')?.textContent?.trim();
  const url = el.querySelector('a')?.href;
  const img = el.querySelector('img')?.src;
  
  if (name && price) {
    products.push({ name, price, url, img });
  }
});

console.log(JSON.stringify(products, null, 2));
// Copiar el resultado y pegarlo en un archivo JSON
```

## 🎯 Objetivo

Extraer **al menos 50-100 productos** del catálogo de Disyvar para tener un buen punto de partida para dropshipping.

## 📞 Soporte

Si después de ejecutar el scraper mejorado sigues teniendo pocos productos:

1. Verifica que el sitio esté accesible
2. Revisa si hay categorías específicas con más productos
3. Considera contactar a Disyvar para un catálogo en CSV/Excel
4. Usa la alternativa manual para productos específicos

---

**Ejecuta ahora:**
```bash
npx tsx scripts/scrape-disyvar-puppeteer.ts
```

Y deberías obtener muchos más productos! 🚀
