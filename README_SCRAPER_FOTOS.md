# 🖼️ Scraper de Fotos de Productos

Sistema automatizado para extraer fotos de productos desde múltiples tiendas online y actualizar la base de datos.

---

## 🚀 Inicio Rápido (3 pasos)

```bash
# 1. Verificar estado
ver-productos-sin-fotos.bat

# 2. Actualizar fotos
actualizar-fotos-sin-imagenes.bat

# 3. ¡Listo! Verifica en el dashboard
```

---

## 📦 ¿Qué Incluye?

### Scripts TypeScript
- `scraper-fotos-todas-tiendas.ts` - Scraper principal
- `actualizar-fotos-productos.ts` - Actualizador básico
- `verificar-productos-sin-fotos.ts` - Diagnóstico
- `extraer-fotos-url-directa.ts` - Extracción manual

### Archivos Batch (Windows)
- `ver-productos-sin-fotos.bat` - Ver estadísticas
- `actualizar-fotos-sin-imagenes.bat` - Actualizar sin fotos
- `actualizar-fotos-pocas-imagenes.bat` - Actualizar pocas fotos
- `actualizar-todas-fotos.bat` - Actualizar todos

### Comandos NPM
```bash
npm run fotos:verificar           # Ver estadísticas
npm run fotos:sin-imagenes        # Actualizar sin fotos
npm run fotos:pocas-imagenes      # Actualizar pocas fotos
npm run fotos:actualizar-todas    # Actualizar todos
npm run fotos:url <URL> [ID]      # Extraer de URL específica
```

---

## 🏪 Tiendas Soportadas

| Tienda | URL | Estado |
|--------|-----|--------|
| **Disyvar** | disyvar.com.co | ✅ |
| **SmartJoys** | smartjoys.co | ✅ |
| **MegaComputer** | megacomputer.com.co | ✅ |
| **Alkosto** | alkosto.com | ✅ |
| **Éxito** | exito.com | ✅ |

---

## 📊 Modos de Operación

### 1. Sin Fotos (Recomendado para empezar)
```bash
actualizar-fotos-sin-imagenes.bat
```
- Solo productos sin imágenes
- Más rápido (~10-15 min / 50 productos)

### 2. Pocas Fotos (Mantenimiento)
```bash
actualizar-fotos-pocas-imagenes.bat
```
- Productos con menos de 2 imágenes
- Tiempo medio (~20-30 min / 100 productos)

### 3. Todos (Actualización completa)
```bash
actualizar-todas-fotos.bat
```
- TODOS los productos
- Más lento (1-2 horas / 200+ productos)

---

## 🎯 Características

✅ **Detección Automática** - Identifica la tienda origen del producto
✅ **Búsqueda Inteligente** - Busca en múltiples tiendas si es necesario
✅ **Extracción Completa** - Obtiene todas las fotos disponibles
✅ **Sin Duplicados** - Elimina imágenes repetidas automáticamente
✅ **Actualización Segura** - No sobrescribe fotos existentes
✅ **Reportes Detallados** - JSON con todos los cambios
✅ **Manejo de Errores** - Continúa aunque falle un producto

---

## 📖 Documentación

- **[GUIA_ACTUALIZAR_FOTOS_PRODUCTOS.md](GUIA_ACTUALIZAR_FOTOS_PRODUCTOS.md)** - Guía completa
- **[EJEMPLOS_USO_SCRAPER_FOTOS.md](EJEMPLOS_USO_SCRAPER_FOTOS.md)** - Casos de uso reales
- **[SISTEMA_SCRAPER_FOTOS_COMPLETO.md](SISTEMA_SCRAPER_FOTOS_COMPLETO.md)** - Documentación técnica
- **[EMPEZAR_ACTUALIZAR_FOTOS.txt](EMPEZAR_ACTUALIZAR_FOTOS.txt)** - Inicio rápido

---

## 💡 Ejemplos Comunes

### Ejemplo 1: Primera vez
```bash
ver-productos-sin-fotos.bat
actualizar-fotos-sin-imagenes.bat
```

### Ejemplo 2: Producto específico
```bash
npm run fotos:url https://disyvar.com.co/producto/laptop-hp clx123abc
```

### Ejemplo 3: Mantenimiento semanal
```bash
actualizar-fotos-pocas-imagenes.bat
```

---

## 📈 Salida Esperada

```
🚀 Scraper Universal de Fotos de Productos
============================================================

📦 Modo: Productos SIN fotos (45)

[1/45] Laptop HP 15-dy2021la
------------------------------------------------------------
   🏪 Tienda detectada: DISYVAR
   🔍 Disyvar: https://disyvar.com.co/buscar?q=...
   📸 Extrayendo fotos...
   ✅ 5 imágenes encontradas
   ✅ Actualizado: 0 → 5 imágenes

============================================================

📊 RESUMEN:
   ✅ Actualizados: 42
   ⚠️  Sin cambios: 3
   ❌ Errores: 0

💾 Reporte guardado en: scripts/reporte-fotos.json
✨ Proceso completado!
```

---

## ⚙️ Configuración

### Agregar Nueva Tienda

Edita `scripts/scraper-fotos-todas-tiendas.ts`:

```typescript
const TIENDAS: TiendaConfig[] = [
  {
    nombre: 'MiTienda',
    baseUrl: 'https://mitienda.com',
    searchPath: '/buscar?q=',
    selectors: {
      productItem: '.producto',
      productLink: 'a',
      productImages: '.galeria img'
    }
  }
];
```

### Ajustar Velocidad

```typescript
// Tiempo entre productos (ms)
await new Promise(resolve => setTimeout(resolve, 4000));
```

---

## ⚠️ Consideraciones

### Tiempo de Ejecución
- 50 productos: 10-15 minutos
- 100 productos: 20-30 minutos
- 200+ productos: 1-2 horas

### Recursos Necesarios
- Conexión a internet estable
- ~200-500 MB RAM
- Puppeteer instalado

### Limitaciones
- Respeta rate limits de tiendas
- Algunas tiendas pueden bloquear scrapers
- Productos descontinuados no se encuentran

---

## 🐛 Troubleshooting

### "No se encontraron productos"
**Solución**: Ejecuta `ver-productos-sin-fotos.bat` primero

### "Timeout en todas las tiendas"
**Solución**: Verifica tu conexión a internet

### "Fotos no se guardan"
**Solución**: Verifica conexión a base de datos

---

## 📞 Comandos Útiles

```bash
# Ver estado
ver-productos-sin-fotos.bat
npm run fotos:verificar

# Actualizar sin fotos
actualizar-fotos-sin-imagenes.bat
npm run fotos:sin-imagenes

# Actualizar pocas fotos
actualizar-fotos-pocas-imagenes.bat
npm run fotos:pocas-imagenes

# Actualizar todos
actualizar-todas-fotos.bat
npm run fotos:actualizar-todas

# URL específica
npm run fotos:url <URL>
npm run fotos:url <URL> <PRODUCT_ID>
```

---

## 🎯 Workflow Recomendado

### Primera Vez
1. `ver-productos-sin-fotos.bat` - Diagnóstico
2. `actualizar-fotos-sin-imagenes.bat` - Actualizar
3. `ver-productos-sin-fotos.bat` - Verificar

### Mantenimiento Semanal
1. `actualizar-fotos-pocas-imagenes.bat` - Mejorar catálogo
2. Verificar en dashboard

### Actualización Mensual
1. `actualizar-todas-fotos.bat` - Actualización completa
2. Revisar `scripts/reporte-fotos.json`

---

## 📊 Métricas de Éxito

### Objetivo Mínimo
- ✅ 80% productos con ≥1 foto
- ✅ 50% productos con ≥2 fotos

### Objetivo Ideal
- ✅ 95% productos con ≥1 foto
- ✅ 70% productos con ≥3 fotos
- ✅ 40% productos con ≥5 fotos

---

## 🔗 Enlaces Útiles

- [Guía Completa](GUIA_ACTUALIZAR_FOTOS_PRODUCTOS.md)
- [Ejemplos de Uso](EJEMPLOS_USO_SCRAPER_FOTOS.md)
- [Documentación Técnica](SISTEMA_SCRAPER_FOTOS_COMPLETO.md)

---

## 📝 Notas

- El sistema respeta tiempos de espera para no sobrecargar tiendas
- Las URLs se normalizan automáticamente
- Se eliminan duplicados automáticamente
- El proceso es seguro y reversible

---

## ✨ Próximos Pasos

1. ✅ Ejecuta `ver-productos-sin-fotos.bat`
2. ✅ Ejecuta `actualizar-fotos-sin-imagenes.bat`
3. ✅ Verifica en el dashboard
4. ✅ Prueba el catálogo público

---

**¡Listo para mejorar tu catálogo! 🚀**

```bash
ver-productos-sin-fotos.bat
```
