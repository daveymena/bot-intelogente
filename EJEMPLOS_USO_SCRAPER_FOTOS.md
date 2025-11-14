# 📸 Ejemplos Prácticos - Scraper de Fotos

## 🎯 Casos de Uso Reales

---

## Ejemplo 1: Primera Vez - Productos Importados Sin Fotos

### Situación
Acabas de importar 100 productos desde un CSV y ninguno tiene fotos.

### Solución
```bash
# 1. Verificar cuántos productos sin fotos tienes
ver-productos-sin-fotos.bat

# Salida esperada:
# ❌ Sin fotos: 100 (100%)
# ⚠️  Con 1 foto: 0 (0%)
# ✅ Con 2-3 fotos: 0 (0%)

# 2. Actualizar todos los productos sin fotos
actualizar-fotos-sin-imagenes.bat

# 3. Verificar resultados
ver-productos-sin-fotos.bat

# Salida esperada:
# ❌ Sin fotos: 15 (15%)  <- No se encontraron en tiendas
# ⚠️  Con 1 foto: 10 (10%)
# ✅ Con 2-3 fotos: 45 (45%)
# 🌟 Con 4+ fotos: 30 (30%)
```

### Tiempo Estimado
- 100 productos: ~40-50 minutos

---

## Ejemplo 2: Mantenimiento Semanal

### Situación
Tienes productos con pocas fotos y quieres mejorar el catálogo.

### Solución
```bash
# Ejecutar cada semana
actualizar-fotos-pocas-imagenes.bat
```

### Automatización (Opcional)
Crea un archivo `mantenimiento-semanal.bat`:
```batch
@echo off
echo ========================================
echo  MANTENIMIENTO SEMANAL - FOTOS
echo ========================================
echo.
echo Fecha: %date% %time%
echo.

REM Verificar estado
echo [1/3] Verificando estado actual...
npx tsx scripts/verificar-productos-sin-fotos.ts > logs/fotos-antes.txt

REM Actualizar fotos
echo [2/3] Actualizando fotos...
npx tsx scripts/scraper-fotos-todas-tiendas.ts pocas-fotos

REM Verificar resultados
echo [3/3] Verificando resultados...
npx tsx scripts/verificar-productos-sin-fotos.ts > logs/fotos-despues.txt

echo.
echo ========================================
echo  COMPLETADO
echo ========================================
pause
```

---

## Ejemplo 3: Producto Específico con URL Conocida

### Situación
Tienes un producto sin fotos pero conoces exactamente la URL en la tienda.

### Solución
```bash
# 1. Obtener el ID del producto desde el dashboard o base de datos
# Ejemplo: clx123abc456

# 2. Extraer fotos de la URL y actualizar
npx tsx scripts/extraer-fotos-url-directa.ts https://disyvar.com.co/producto/laptop-hp-15 clx123abc456
```

### Salida Esperada
```
🖼️  Extractor de Fotos por URL Directa

🔍 Extrayendo fotos de: https://disyvar.com.co/producto/laptop-hp-15

✅ Encontradas 6 imágenes:

   1. https://disyvar.com.co/images/laptop-hp-1.jpg
   2. https://disyvar.com.co/images/laptop-hp-2.jpg
   3. https://disyvar.com.co/images/laptop-hp-3.jpg
   4. https://disyvar.com.co/images/laptop-hp-4.jpg
   5. https://disyvar.com.co/images/laptop-hp-5.jpg
   6. https://disyvar.com.co/images/laptop-hp-6.jpg

✅ Producto actualizado: Laptop HP 15-dy2021la
   Antes: 0 imágenes
   Ahora: 6 imágenes

✨ Proceso completado!
```

---

## Ejemplo 4: Actualización Completa del Catálogo

### Situación
Fin de mes, quieres actualizar TODAS las fotos del catálogo.

### Solución
```bash
# Ejecutar en horario de bajo tráfico (madrugada/fin de semana)
actualizar-todas-fotos.bat
```

### Recomendación
Ejecutar en 3 fases:

**Fase 1: Sin fotos (Viernes noche)**
```bash
actualizar-fotos-sin-imagenes.bat
```

**Fase 2: Pocas fotos (Sábado mañana)**
```bash
actualizar-fotos-pocas-imagenes.bat
```

**Fase 3: Verificación (Sábado tarde)**
```bash
ver-productos-sin-fotos.bat
```

---

## Ejemplo 5: Productos de Disyvar

### Situación
Importaste productos de Disyvar y necesitas sus fotos originales.

### Solución
El sistema detecta automáticamente que son de Disyvar:

```bash
# Los productos deben tener tag 'disyvar' o mencionar 'disyvar' en descripción
actualizar-fotos-sin-imagenes.bat
```

### Verificar Tags
```sql
-- En Prisma Studio o directamente en DB
SELECT name, tags FROM Product WHERE tags LIKE '%disyvar%';
```

---

## Ejemplo 6: Múltiples Tiendas

### Situación
Tienes productos de diferentes tiendas y quieres actualizar todos.

### Solución
```bash
# El sistema busca automáticamente en todas las tiendas
actualizar-fotos-sin-imagenes.bat
```

### Orden de Búsqueda
1. Detecta tienda origen (por tags/descripción)
2. Busca primero en tienda origen
3. Si no encuentra, busca en otras tiendas
4. Se detiene al encontrar 5+ imágenes

---

## Ejemplo 7: Solo Extraer Fotos (Sin Actualizar DB)

### Situación
Quieres ver qué fotos hay disponibles antes de actualizar.

### Solución
```bash
# Solo extraer, no actualizar
npx tsx scripts/extraer-fotos-url-directa.ts https://smartjoys.co/products/audifonos-bluetooth
```

### Salida
```
✅ Encontradas 4 imágenes:

   1. https://smartjoys.co/img1.jpg
   2. https://smartjoys.co/img2.jpg
   3. https://smartjoys.co/img3.jpg
   4. https://smartjoys.co/img4.jpg

💡 Para actualizar un producto, proporciona su ID:
   npx tsx scripts/extraer-fotos-url-directa.ts https://smartjoys.co/products/audifonos-bluetooth <PRODUCT_ID>
```

---

## Ejemplo 8: Productos con Fotos Rotas

### Situación
Algunos productos tienen URLs de fotos que ya no funcionan.

### Solución
```bash
# Actualizar todos para reemplazar fotos rotas
actualizar-todas-fotos.bat
```

El sistema:
1. Mantiene las fotos actuales que funcionan
2. Agrega nuevas fotos encontradas
3. No elimina fotos existentes

---

## Ejemplo 9: Integración con Importación

### Situación
Quieres importar productos y actualizar fotos automáticamente.

### Solución
Crea un script `importar-con-fotos.bat`:

```batch
@echo off
echo ========================================
echo  IMPORTAR PRODUCTOS CON FOTOS
echo ========================================

REM 1. Importar productos
echo [1/3] Importando productos...
npx tsx scripts/import-productos-completos.ts

REM 2. Esperar un momento
timeout /t 5

REM 3. Actualizar fotos
echo [2/3] Actualizando fotos...
npx tsx scripts/scraper-fotos-todas-tiendas.ts sin-fotos

REM 4. Verificar
echo [3/3] Verificando...
npx tsx scripts/verificar-productos-sin-fotos.ts

echo.
echo ========================================
echo  COMPLETADO
echo ========================================
pause
```

---

## Ejemplo 10: Monitoreo y Alertas

### Situación
Quieres recibir un reporte diario de productos sin fotos.

### Solución
Crea `reporte-diario-fotos.bat`:

```batch
@echo off
echo ========================================
echo  REPORTE DIARIO - FOTOS
echo ========================================
echo Fecha: %date% %time%
echo.

REM Crear carpeta de logs si no existe
if not exist "logs" mkdir logs

REM Generar reporte
npx tsx scripts/verificar-productos-sin-fotos.ts > logs/reporte-fotos-%date:~-4,4%%date:~-7,2%%date:~-10,2%.txt

echo.
echo Reporte guardado en: logs/reporte-fotos-%date:~-4,4%%date:~-7,2%%date:~-10,2%.txt
echo.
pause
```

Programa en Tareas Programadas de Windows para ejecutar diariamente.

---

## Ejemplo 11: Actualización por Categoría

### Situación
Solo quieres actualizar fotos de laptops.

### Solución
Modifica temporalmente el script o crea uno nuevo:

```typescript
// scripts/actualizar-fotos-laptops.ts
const productos = await prisma.product.findMany({
  where: {
    category: 'PHYSICAL',
    tags: {
      contains: 'laptop'
    },
    OR: [
      { images: { equals: '[]' } },
      { images: { equals: '' } },
      { images: null },
    ]
  }
});
```

---

## Ejemplo 12: Verificación Post-Actualización

### Situación
Actualizaste fotos y quieres verificar que todo funcionó.

### Solución
```bash
# 1. Ver estadísticas
ver-productos-sin-fotos.bat

# 2. Ver reporte detallado
notepad scripts/reporte-fotos.json

# 3. Verificar en dashboard
# Abre http://localhost:3000/dashboard/products

# 4. Probar en catálogo público
# Abre http://localhost:3000/catalogo
```

---

## 🎓 Tips y Mejores Prácticas

### ✅ DO (Hacer)
- Ejecutar en horarios de bajo tráfico
- Verificar antes y después
- Revisar el reporte JSON
- Hacer backup de DB antes de actualización masiva
- Usar modo "sin-fotos" primero

### ❌ DON'T (No Hacer)
- Ejecutar múltiples veces simultáneamente
- Interrumpir el proceso a la mitad
- Modificar DB mientras se ejecuta
- Ejecutar en horario pico de la tienda

---

## 📊 Métricas de Éxito

### Objetivo Mínimo
- 80% de productos con al menos 1 foto
- 50% de productos con 2+ fotos

### Objetivo Ideal
- 95% de productos con al menos 1 foto
- 70% de productos con 3+ fotos
- 40% de productos con 5+ fotos

---

## 🚀 Workflow Recomendado

### Semanal
```bash
# Lunes: Verificar
ver-productos-sin-fotos.bat

# Martes: Actualizar pocas fotos
actualizar-fotos-pocas-imagenes.bat

# Viernes: Verificar resultados
ver-productos-sin-fotos.bat
```

### Mensual
```bash
# Primer sábado del mes: Actualización completa
actualizar-todas-fotos.bat
```

---

**¡Listo para mejorar tu catálogo! 📸**
