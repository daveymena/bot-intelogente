# 🎨 Sistema Completo de Scraper de Fotos

## ✅ IMPLEMENTACIÓN COMPLETADA

Se ha creado un sistema completo para extraer fotos de productos desde múltiples tiendas online y actualizar automáticamente la base de datos.

---

## 📦 Archivos Creados

### Scripts TypeScript (4 archivos)

1. **`scripts/scraper-fotos-todas-tiendas.ts`** ⭐ PRINCIPAL
   - Scraper universal para múltiples tiendas
   - Soporta 3 modos: sin-fotos, pocas-fotos, todos
   - Genera reportes detallados

2. **`scripts/actualizar-fotos-productos.ts`**
   - Actualizador básico
   - Detecta tienda origen automáticamente
   - Busca y actualiza fotos

3. **`scripts/verificar-productos-sin-fotos.ts`**
   - Diagnóstico completo
   - Estadísticas detalladas
   - Recomendaciones automáticas

4. **`scripts/extraer-fotos-url-directa.ts`**
   - Extracción desde URL específica
   - Útil para casos puntuales
   - Actualización manual

### Archivos Batch (4 archivos)

1. **`ver-productos-sin-fotos.bat`**
   - Verificar estado actual
   - Ver estadísticas

2. **`actualizar-fotos-sin-imagenes.bat`**
   - Actualizar productos sin fotos
   - Modo rápido

3. **`actualizar-fotos-pocas-imagenes.bat`**
   - Actualizar productos con <2 fotos
   - Modo intermedio

4. **`actualizar-todas-fotos.bat`**
   - Actualizar TODOS los productos
   - Modo completo

### Documentación (2 archivos)

1. **`GUIA_ACTUALIZAR_FOTOS_PRODUCTOS.md`**
   - Guía completa y detallada
   - Ejemplos de uso
   - Troubleshooting

2. **`EMPEZAR_ACTUALIZAR_FOTOS.txt`**
   - Inicio rápido
   - Pasos simples
   - Referencias

---

## 🏪 Tiendas Soportadas

El sistema busca automáticamente en:

| Tienda | URL | Estado |
|--------|-----|--------|
| Disyvar | disyvar.com.co | ✅ Activo |
| SmartJoys | smartjoys.co | ✅ Activo |
| MegaComputer | megacomputer.com.co | ✅ Activo |
| Alkosto | alkosto.com | ✅ Activo |
| Éxito | exito.com | ✅ Activo |

---

## 🚀 Uso Rápido

### 1. Verificar Estado
```bash
ver-productos-sin-fotos.bat
```

### 2. Actualizar Fotos
```bash
# Opción A: Solo sin fotos
actualizar-fotos-sin-imagenes.bat

# Opción B: Pocas fotos
actualizar-fotos-pocas-imagenes.bat

# Opción C: Todos
actualizar-todas-fotos.bat
```

### 3. Verificar Resultados
```bash
ver-productos-sin-fotos.bat
```

---

## 🎯 Características Principales

### ✅ Detección Inteligente
- Detecta automáticamente la tienda origen
- Busca primero en la tienda correcta
- Fallback a otras tiendas si es necesario

### ✅ Extracción Completa
- Múltiples selectores CSS
- Scroll automático para lazy loading
- Filtrado de placeholders y logos
- Normalización de URLs

### ✅ Actualización Segura
- Combina fotos actuales con nuevas
- Elimina duplicados automáticamente
- No sobrescribe fotos existentes
- Transacciones seguras en DB

### ✅ Reportes Detallados
- Estadísticas en tiempo real
- Reporte JSON completo
- Logs detallados por producto
- Recomendaciones automáticas

---

## 📊 Modos de Operación

### Modo 1: Sin Fotos
```bash
actualizar-fotos-sin-imagenes.bat
```
- Procesa solo productos sin imágenes
- Más rápido (~10-15 min para 50 productos)
- Ideal para primera ejecución

### Modo 2: Pocas Fotos
```bash
actualizar-fotos-pocas-imagenes.bat
```
- Procesa productos con <2 imágenes
- Tiempo medio (~20-30 min para 100 productos)
- Ideal para mantenimiento

### Modo 3: Todos
```bash
actualizar-todas-fotos.bat
```
- Procesa TODOS los productos
- Más lento (1-2 horas para 200+ productos)
- Ideal para actualización completa

---

## 🔧 Configuración

### Agregar Nueva Tienda

Edita `scripts/scraper-fotos-todas-tiendas.ts`:

```typescript
const TIENDAS: TiendaConfig[] = [
  // ... tiendas existentes
  {
    nombre: 'NuevaTienda',
    baseUrl: 'https://nuevatienda.com',
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

// Tiempo entre tiendas (ms)
await new Promise(resolve => setTimeout(resolve, 2000));
```

---

## 📈 Ejemplo de Salida

### Consola
```
🚀 Scraper Universal de Fotos de Productos

============================================================

📦 Modo: Productos SIN fotos (45)

[1/45] Laptop HP 15-dy2021la
------------------------------------------------------------
   🏪 Tienda detectada: DISYVAR
   🔍 Disyvar: https://disyvar.com.co/buscar?q=Laptop+HP...
   📸 Extrayendo fotos...
   ✅ 5 imágenes encontradas
   📷 Imágenes actuales: 0
   ✅ Actualizado: 0 → 5 imágenes

[2/45] Audífonos Bluetooth TWS
------------------------------------------------------------
   🏪 Tienda detectada: SMARTJOYS
   🔍 SmartJoys: https://smartjoys.co/search?q=Audifonos...
   📸 Extrayendo fotos...
   ✅ 4 imágenes encontradas
   📷 Imágenes actuales: 0
   ✅ Actualizado: 0 → 4 imágenes

...

============================================================

📊 RESUMEN:
   ✅ Actualizados: 42
   ⚠️  Sin cambios: 3
   ❌ Errores: 0

💾 Reporte guardado en: scripts/reporte-fotos.json

✨ Proceso completado!
```

### Reporte JSON
```json
[
  {
    "id": "clx123abc",
    "nombre": "Laptop HP 15-dy2021la",
    "antes": 0,
    "despues": 5,
    "nuevas": [
      "https://disyvar.com.co/images/laptop-hp-1.jpg",
      "https://disyvar.com.co/images/laptop-hp-2.jpg",
      "https://disyvar.com.co/images/laptop-hp-3.jpg",
      "https://disyvar.com.co/images/laptop-hp-4.jpg",
      "https://disyvar.com.co/images/laptop-hp-5.jpg"
    ]
  }
]
```

---

## 🎓 Casos de Uso

### Caso 1: Primera Importación
```bash
# Importaste productos sin fotos
npm run import:productos

# Ahora actualiza las fotos
ver-productos-sin-fotos.bat
actualizar-fotos-sin-imagenes.bat
```

### Caso 2: Mantenimiento Semanal
```bash
# Verifica y actualiza productos con pocas fotos
ver-productos-sin-fotos.bat
actualizar-fotos-pocas-imagenes.bat
```

### Caso 3: Actualización Completa
```bash
# Actualiza todo el catálogo (fin de semana)
actualizar-todas-fotos.bat
```

### Caso 4: Producto Específico
```bash
# Tienes la URL exacta del producto
npx tsx scripts/extraer-fotos-url-directa.ts https://disyvar.com.co/producto/laptop-hp abc123
```

---

## ⚠️ Consideraciones

### Tiempo de Ejecución
- **50 productos**: 10-15 minutos
- **100 productos**: 20-30 minutos
- **200+ productos**: 1-2 horas

### Recursos
- Conexión a internet estable
- ~200-500 MB RAM
- Espacio en disco para reportes

### Limitaciones
- Respeta rate limits de las tiendas
- Algunas tiendas pueden bloquear scrapers
- Productos descontinuados no se encuentran

---

## 🐛 Troubleshooting

### Problema: No encuentra productos
**Solución**: Verifica que el nombre del producto sea correcto

### Problema: Timeout constante
**Solución**: Aumenta los tiempos de espera en el código

### Problema: Fotos no se guardan
**Solución**: Verifica conexión a base de datos

### Problema: Muchos errores
**Solución**: Ejecuta en horario de bajo tráfico

---

## 📞 Comandos Útiles

```bash
# Ver estado
ver-productos-sin-fotos.bat

# Actualizar sin fotos
actualizar-fotos-sin-imagenes.bat

# Actualizar pocas fotos
actualizar-fotos-pocas-imagenes.bat

# Actualizar todos
actualizar-todas-fotos.bat

# URL específica
npx tsx scripts/extraer-fotos-url-directa.ts <URL>

# URL + actualizar producto
npx tsx scripts/extraer-fotos-url-directa.ts <URL> <PRODUCT_ID>
```

---

## 🎯 Próximos Pasos

1. ✅ Ejecuta `ver-productos-sin-fotos.bat`
2. ✅ Ejecuta `actualizar-fotos-sin-imagenes.bat`
3. ✅ Verifica en el dashboard
4. ✅ Prueba el catálogo público
5. ✅ Verifica que el bot envíe fotos

---

## 📚 Documentación

- **Guía Completa**: `GUIA_ACTUALIZAR_FOTOS_PRODUCTOS.md`
- **Inicio Rápido**: `EMPEZAR_ACTUALIZAR_FOTOS.txt`
- **Este Archivo**: `SISTEMA_SCRAPER_FOTOS_COMPLETO.md`

---

## ✨ Resumen

Sistema completo y funcional para:
- ✅ Extraer fotos de 5 tiendas diferentes
- ✅ Actualizar automáticamente la base de datos
- ✅ Generar reportes detallados
- ✅ Manejar errores gracefully
- ✅ Fácil de usar con archivos .bat

**¡Todo listo para usar! 🚀**

Ejecuta: `ver-productos-sin-fotos.bat` para empezar
