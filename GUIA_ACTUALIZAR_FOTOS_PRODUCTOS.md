# 🖼️ Guía Completa: Actualizar Fotos de Productos

## 📋 Descripción

Sistema automatizado para extraer fotos de productos desde las tiendas originales (Disyvar, SmartJoys, MegaComputer, Alkosto, Éxito) y actualizar la base de datos.

---

## 🎯 ¿Qué hace este sistema?

1. **Detecta** productos sin fotos o con pocas imágenes
2. **Busca** el producto en múltiples tiendas online
3. **Extrae** todas las fotos disponibles del producto
4. **Actualiza** automáticamente la base de datos
5. **Genera** un reporte detallado del proceso

---

## 🚀 Inicio Rápido

### Paso 1: Verificar qué productos necesitan fotos

```bash
ver-productos-sin-fotos.bat
```

Esto te mostrará:
- ❌ Cuántos productos NO tienen fotos
- ⚠️ Cuántos tienen solo 1 foto
- ✅ Cuántos tienen suficientes fotos

### Paso 2: Actualizar fotos según necesidad

**Opción A: Solo productos SIN fotos**
```bash
actualizar-fotos-sin-imagenes.bat
```

**Opción B: Productos con POCAS fotos (menos de 2)**
```bash
actualizar-fotos-pocas-imagenes.bat
```

**Opción C: TODOS los productos**
```bash
actualizar-todas-fotos.bat
```
⚠️ **Advertencia**: Esto puede tardar varias horas

---

## 🏪 Tiendas Soportadas

El scraper busca automáticamente en:

1. **Disyvar** - https://disyvar.com.co
2. **SmartJoys** - https://smartjoys.co
3. **MegaComputer** - https://megacomputer.com.co
4. **Alkosto** - https://www.alkosto.com
5. **Éxito** - https://www.exito.com

El sistema detecta automáticamente de qué tienda proviene cada producto y busca primero ahí.

---

## 📊 Proceso Detallado

### 1. Detección de Origen

El sistema detecta la tienda origen del producto mediante:
- Tags del producto (`disyvar`, `smartjoys`, etc.)
- Nombre del producto
- Descripción del producto

### 2. Búsqueda Inteligente

Para cada producto:
1. Busca en la tienda de origen primero
2. Si no encuentra, busca en otras tiendas
3. Se detiene cuando encuentra 5+ imágenes

### 3. Extracción de Fotos

- Navega a la página del producto
- Hace scroll para cargar imágenes lazy
- Extrae todas las imágenes de la galería
- Filtra placeholders y logos
- Normaliza las URLs

### 4. Actualización

- Combina fotos actuales con nuevas
- Elimina duplicados
- Actualiza la base de datos
- Genera reporte JSON

---

## 📁 Archivos Creados

### Scripts TypeScript

- `scripts/scraper-fotos-todas-tiendas.ts` - Scraper principal
- `scripts/actualizar-fotos-productos.ts` - Actualizador básico
- `scripts/verificar-productos-sin-fotos.ts` - Verificador

### Archivos Batch (Windows)

- `ver-productos-sin-fotos.bat` - Ver estadísticas
- `actualizar-fotos-sin-imagenes.bat` - Actualizar sin fotos
- `actualizar-fotos-pocas-imagenes.bat` - Actualizar pocas fotos
- `actualizar-todas-fotos.bat` - Actualizar todos

### Reportes Generados

- `scripts/reporte-fotos.json` - Reporte detallado de actualizaciones

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Primera vez

```bash
# 1. Ver el estado actual
ver-productos-sin-fotos.bat

# 2. Actualizar productos sin fotos
actualizar-fotos-sin-imagenes.bat

# 3. Verificar de nuevo
ver-productos-sin-fotos.bat
```

### Ejemplo 2: Mantenimiento regular

```bash
# Actualizar productos con pocas fotos
actualizar-fotos-pocas-imagenes.bat
```

### Ejemplo 3: Actualización completa

```bash
# Actualizar TODOS (hacer en horario de bajo tráfico)
actualizar-todas-fotos.bat
```

---

## 🔧 Configuración Avanzada

### Modificar tiendas

Edita `scripts/scraper-fotos-todas-tiendas.ts`:

```typescript
const TIENDAS: TiendaConfig[] = [
  {
    nombre: 'TuTienda',
    baseUrl: 'https://tutienda.com',
    searchPath: '/buscar?q=',
    selectors: {
      productItem: '.producto',
      productLink: 'a',
      productImages: '.galeria img'
    }
  },
  // ... más tiendas
];
```

### Ajustar velocidad

En el script, modifica los tiempos de espera:

```typescript
// Entre productos (default: 4000ms)
await new Promise(resolve => setTimeout(resolve, 4000));

// Entre tiendas (default: 2000ms)
await new Promise(resolve => setTimeout(resolve, 2000));
```

---

## 📈 Estadísticas y Reportes

### Reporte en Consola

```
📊 RESUMEN:
   ✅ Actualizados: 45
   ⚠️  Sin cambios: 12
   ❌ Errores: 3
```

### Reporte JSON

```json
[
  {
    "id": "producto-123",
    "nombre": "Laptop HP 15",
    "antes": 0,
    "despues": 5,
    "nuevas": [
      "https://disyvar.com.co/img1.jpg",
      "https://disyvar.com.co/img2.jpg",
      ...
    ]
  }
]
```

---

## ⚠️ Consideraciones Importantes

### Tiempo de Ejecución

- **Sin fotos (50 productos)**: ~10-15 minutos
- **Pocas fotos (100 productos)**: ~20-30 minutos
- **Todos (200+ productos)**: 1-2 horas

### Uso de Recursos

- Requiere conexión a internet estable
- Usa ~200-500 MB de RAM
- Genera tráfico web significativo

### Errores Comunes

1. **Timeout**: La tienda no responde
   - Solución: El script continúa con la siguiente

2. **Producto no encontrado**: No existe en esa tienda
   - Solución: Busca en otras tiendas automáticamente

3. **Sin imágenes**: El producto no tiene galería
   - Solución: Se marca como "sin cambios"

---

## 🎨 Mejores Prácticas

### 1. Ejecutar en horarios de bajo tráfico
```bash
# Mejor: Madrugada o fines de semana
actualizar-todas-fotos.bat
```

### 2. Verificar antes y después
```bash
ver-productos-sin-fotos.bat
actualizar-fotos-sin-imagenes.bat
ver-productos-sin-fotos.bat
```

### 3. Actualizar por lotes
```bash
# Primero los sin fotos
actualizar-fotos-sin-imagenes.bat

# Luego los de pocas fotos
actualizar-fotos-pocas-imagenes.bat
```

### 4. Revisar el reporte
```bash
# Ver el archivo generado
notepad scripts/reporte-fotos.json
```

---

## 🔍 Troubleshooting

### Problema: "No se encontraron productos"

**Causa**: No hay productos sin fotos
**Solución**: Ejecuta `ver-productos-sin-fotos.bat` primero

### Problema: "Error de conexión"

**Causa**: Problemas de red o tienda caída
**Solución**: Verifica tu conexión y reintenta

### Problema: "Timeout en todas las tiendas"

**Causa**: Firewall o proxy bloqueando
**Solución**: Verifica configuración de red

### Problema: "Imágenes no se guardan"

**Causa**: Error en base de datos
**Solución**: Verifica que Prisma esté configurado

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs en consola
2. Verifica el archivo `scripts/reporte-fotos.json`
3. Ejecuta `ver-productos-sin-fotos.bat` para diagnóstico

---

## 🎯 Próximos Pasos

Después de actualizar las fotos:

1. ✅ Verifica en el dashboard que las fotos se muestren
2. ✅ Prueba el catálogo público
3. ✅ Verifica que el bot envíe las fotos correctamente
4. ✅ Haz backup de la base de datos

---

## 📝 Notas Finales

- El sistema respeta los tiempos de espera para no sobrecargar las tiendas
- Las URLs de imágenes se normalizan automáticamente
- Se eliminan duplicados automáticamente
- El proceso es seguro y no modifica productos que ya tienen buenas fotos

---

**¡Listo para actualizar tus fotos! 🚀**

Ejecuta: `ver-productos-sin-fotos.bat` para empezar
