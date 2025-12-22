# ✅ Exportar Productos - ARREGLADO

## 🐛 Problema Identificado

La funcionalidad de exportar productos a Excel (.csv) o JSON no estaba funcionando porque:
1. El `userId` no se obtenía correctamente
2. No había validación antes de intentar exportar
3. Faltaban logs para debugging

## ✅ Solución Implementada

### 1. Obtención Mejorada del UserId

Se implementó un sistema de 3 capas para obtener el userId:

```typescript
// 1. Intentar desde cookies (más confiable)
const cookieUserId = document.cookie
  .split('; ')
  .find(row => row.startsWith('user-id='))
  ?.split('=')[1]

// 2. Fallback a localStorage
const storedUserId = localStorage.getItem('userId')

// 3. Fallback a API de sesión
const response = await fetch('/api/auth/session')
```

### 2. Validación Antes de Exportar

```typescript
if (!userId) {
  toast.error('No se pudo obtener el ID de usuario. Por favor, recarga la página.')
  return
}
```

### 3. Logs de Debugging

Se agregaron logs en consola para facilitar el debugging:
- ✅ UserId obtenido
- 🚀 Iniciando exportación
- 📡 URL de la petición
- 📥 Status de la respuesta
- ✅ Exportación completada

### 4. UI Mejorada

- ⏳ Indicador de carga mientras se obtiene el userId
- 🔒 Botones deshabilitados hasta que el userId esté disponible
- 📝 Mensajes de error más descriptivos
- ✅ Feedback visual del proceso

## 📁 Archivo Modificado

- ✅ `src/components/ImportExportManager.tsx`

## 🎯 Funcionalidades

### Exportar
1. **CSV (Excel)**
   - Formato compatible con Excel
   - Ideal para edición masiva
   - Columnas: name, description, price, currency, category, status, images, tags, autoResponse, stock

2. **JSON**
   - Formato estructurado
   - Ideal para respaldos
   - Incluye todos los campos del producto

### Importar
1. **CSV**
   - Sube archivo CSV con productos
   - Validación automática de datos
   - Reporte de errores por fila

2. **JSON**
   - Sube archivo JSON con productos
   - Validación con Zod schema
   - Importación masiva

## 🧪 Cómo Probar

### 1. Exportar Productos

```bash
1. Ve al Dashboard
2. Scroll hasta "Importar/Exportar Productos"
3. Click en tab "Exportar Productos"
4. Selecciona formato (CSV o JSON)
5. Click en "Exportar Productos"
6. El archivo se descargará automáticamente
```

**Nombre del archivo:**
```
products-export-2025-11-18.csv
products-export-2025-11-18.json
```

### 2. Verificar en Consola

Abre DevTools (F12) y verifica los logs:

```
✅ UserId obtenido de cookie: abc123
🚀 Iniciando exportación: { userId: 'abc123', format: 'csv' }
📡 Fetching: /api/import-export?userId=abc123&format=csv
📥 Response status: 200
✅ Blob recibido: 1234 bytes
✅ Exportación completada
```

### 3. Importar Productos

```bash
1. Descarga la plantilla CSV
2. Edita el archivo con tus productos
3. Click en "Importar CSV"
4. Selecciona tu archivo
5. Verifica el resultado (importados/fallidos)
```

## 🔧 Troubleshooting

### ❌ Error: "No se pudo obtener el ID de usuario"

**Solución:**
1. Recarga la página (F5)
2. Verifica que estés autenticado
3. Revisa la consola para ver qué método falló
4. Si persiste, cierra sesión y vuelve a entrar

### ❌ Error: "Error al exportar productos"

**Solución:**
1. Abre la consola (F12)
2. Busca el log con el error específico
3. Verifica que tengas productos en tu catálogo
4. Verifica que la API esté funcionando: `/api/import-export?userId=XXX&format=csv`

### ❌ El archivo descargado está vacío

**Solución:**
1. Verifica que tengas productos creados
2. Revisa la consola para ver el tamaño del blob
3. Prueba con el otro formato (CSV ↔ JSON)

## 📊 Formato de Archivos

### CSV (Excel)
```csv
name,description,price,currency,category,status,images,tags,autoResponse,stock
"Laptop Gaming","Laptop de alto rendimiento",3200000,COP,PHYSICAL,AVAILABLE,"https://...",laptop;gaming,"Laptop ideal para gaming",10
```

### JSON
```json
[
  {
    "id": 1,
    "name": "Laptop Gaming",
    "description": "Laptop de alto rendimiento",
    "price": 3200000,
    "currency": "COP",
    "category": "PHYSICAL",
    "status": "AVAILABLE",
    "images": ["https://..."],
    "tags": ["laptop", "gaming"],
    "autoResponse": "Laptop ideal para gaming",
    "stock": 10
  }
]
```

## ✅ Checklist de Verificación

- [x] UserId se obtiene correctamente
- [x] Validación antes de exportar
- [x] Logs de debugging agregados
- [x] UI con indicadores de carga
- [x] Botones deshabilitados sin userId
- [x] Mensajes de error descriptivos
- [x] Exportación CSV funciona
- [x] Exportación JSON funciona
- [x] Importación CSV funciona
- [x] Importación JSON funciona
- [x] Descarga de plantilla funciona
- [x] Sin errores de TypeScript

## 🚀 Próximos Pasos

1. Hacer commit de los cambios
2. Push a Git
3. Deploy a Easypanel
4. Probar en producción

```bash
git add src/components/ImportExportManager.tsx
git commit -m "fix: arreglar exportación de productos a CSV/JSON"
git push origin main
```

---

**Estado**: ✅ ARREGLADO
**Archivo**: `src/components/ImportExportManager.tsx`
**Fecha**: 18 de noviembre de 2025
