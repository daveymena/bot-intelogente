# 🔄 Flujo de Importación/Exportación

## 📥 FLUJO DE IMPORTACIÓN

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO                                   │
│                                                              │
│  1. Prepara archivo (JSON o CSV)                            │
│  2. Arrastra al dashboard o selecciona                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND                                    │
│                                                              │
│  • Detecta tipo de archivo (.json o .csv)                   │
│  • Muestra indicador de carga                               │
│  • Envía FormData al API                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   API BACKEND                                │
│                                                              │
│  • Recibe archivo                                           │
│  • Detecta formato (JSON/CSV)                               │
│  • Parsea contenido                                         │
│  • Valida cada producto con Zod                             │
│  • Transforma datos si es necesario                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  VALIDACIÓN                                  │
│                                                              │
│  ✅ Campos requeridos presentes                             │
│  ✅ Tipos de datos correctos                                │
│  ✅ Valores de enum válidos                                 │
│  ✅ Transformaciones aplicadas                              │
│  ❌ Errores registrados por fila                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                BASE DE DATOS                                 │
│                                                              │
│  • Inserta productos válidos                                │
│  • Registra éxitos y fallos                                 │
│  • Retorna resultado                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  RESPUESTA                                   │
│                                                              │
│  ✅ Éxito: "X productos importados"                         │
│  ❌ Error: "Errores en filas: [1, 5, 8]"                    │
│  📊 Estadísticas: imported, failed, total                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO                                   │
│                                                              │
│  • Ve mensaje de confirmación                               │
│  • Página se recarga automáticamente                        │
│  • Ve productos importados en la lista                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📤 FLUJO DE EXPORTACIÓN

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO                                   │
│                                                              │
│  1. Click en "Exportar como JSON" o "Exportar como CSV"    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND                                    │
│                                                              │
│  • Muestra indicador de carga                               │
│  • Hace petición GET al API                                 │
│  • Especifica formato deseado                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   API BACKEND                                │
│                                                              │
│  • Recibe petición con formato                              │
│  • Consulta productos del usuario                           │
│  • Ordena por fecha de creación                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                BASE DE DATOS                                 │
│                                                              │
│  • Busca productos del usuario                              │
│  • Retorna todos los productos                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  FORMATEO                                    │
│                                                              │
│  JSON:                                                       │
│  • Parsea arrays (images, tags)                             │
│  • Formatea con indentación                                 │
│  • Content-Type: application/json                           │
│                                                              │
│  CSV:                                                        │
│  • Genera encabezados                                       │
│  • Escapa comillas                                          │
│  • Formatea filas                                           │
│  • Content-Type: text/csv                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  DESCARGA                                    │
│                                                              │
│  • Crea Blob con contenido                                  │
│  • Genera URL temporal                                      │
│  • Crea elemento <a> invisible                              │
│  • Trigger descarga automática                              │
│  • Limpia recursos                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO                                   │
│                                                              │
│  • Archivo descargado: productos-2025-10-31.json/csv       │
│  • Ve mensaje de confirmación                               │
│  • Puede editar el archivo                                  │
│  • Puede re-importarlo después                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJO COMPLETO: EDICIÓN MASIVA

```
┌─────────────────────────────────────────────────────────────┐
│  PASO 1: EXPORTAR                                           │
│  ────────────────────────────────────────────────────────   │
│  Usuario exporta productos actuales como CSV                │
│  Archivo: productos-2025-10-31.csv                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  PASO 2: EDITAR                                             │
│  ────────────────────────────────────────────────────────   │
│  Usuario abre CSV en Excel                                  │
│  Edita precios, descripciones, stock, etc.                  │
│  Guarda cambios                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  PASO 3: IMPORTAR                                           │
│  ────────────────────────────────────────────────────────   │
│  Usuario arrastra CSV modificado al dashboard               │
│  Sistema valida e importa cambios                           │
│  Productos actualizados en base de datos                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  RESULTADO: ✅ PRODUCTOS ACTUALIZADOS                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 CASOS DE USO VISUALIZADOS

### Caso 1: Importar Catálogo Nuevo
```
Proveedor → Excel → CSV → Dashboard → ✅ Catálogo Importado
```

### Caso 2: Actualizar Precios
```
Dashboard → Exportar CSV → Excel → Editar Precios → 
Importar CSV → ✅ Precios Actualizados
```

### Caso 3: Respaldo de Seguridad
```
Dashboard → Exportar JSON → Guardar → 
(En caso de problema) → Importar JSON → ✅ Datos Restaurados
```

### Caso 4: Migración de Sistema
```
Sistema Antiguo → Exportar → Convertir Formato → 
Importar → ✅ Migración Completa
```

---

## 📊 ESTADÍSTICAS DEL PROCESO

### Importación:
```
Total de Productos: 100
├─ Válidos: 95 ✅
├─ Con Errores: 5 ❌
└─ Importados: 95 ✅

Tiempo Promedio: 2-5 segundos
```

### Exportación:
```
Total de Productos: 100
├─ Formato JSON: ~50KB
├─ Formato CSV: ~30KB
└─ Tiempo: < 1 segundo

Descarga: Automática
```

---

## 🔒 VALIDACIONES EN CADA PASO

### Frontend:
- ✅ Tipo de archivo (.json o .csv)
- ✅ Tamaño del archivo
- ✅ Formato básico

### Backend:
- ✅ Estructura del archivo
- ✅ Campos requeridos
- ✅ Tipos de datos
- ✅ Valores de enum
- ✅ Transformaciones

### Base de Datos:
- ✅ Constraints de schema
- ✅ Relaciones
- ✅ Unicidad

---

## ✨ CARACTERÍSTICAS ESPECIALES

### Drag & Drop:
```
Usuario arrastra archivo → Zona se ilumina → 
Suelta archivo → Importación automática
```

### Detección Automática:
```
Archivo .json → Procesador JSON
Archivo .csv → Procesador CSV
```

### Manejo de Errores:
```
Error en fila 5 → Registra error → 
Continúa con fila 6 → Importa válidos → 
Muestra resumen con errores
```

### Transformaciones:
```
"$10,000" → 10000
"FISICO" → "PHYSICAL"
"disponible" → "AVAILABLE"
```

---

**Sistema Completo y Optimizado para Máxima Eficiencia** 🚀
