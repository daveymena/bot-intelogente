# 🚀 EMPEZAR AQUÍ: Re-Scrapear Productos

## ✨ ¿Qué acabamos de crear?

Sistema completo para **actualizar automáticamente** todos tus productos con fotos reales de sus tiendas originales.

---

## 🎯 3 Comandos Principales

### 1️⃣ Actualizar Solo Productos Sin Fotos (RECOMENDADO)

```bash
re-scrapear-fotos-ahora.bat
```

⏱️ **Tiempo:** 15-30 minutos  
📦 **Procesa:** Hasta 50 productos sin fotos  
✅ **Ideal para:** Primera vez o mantenimiento rápido

---

### 2️⃣ Re-importar MegaComputer Completo

```bash
re-importar-megacomputer-ahora.bat
```

⏱️ **Tiempo:** 30-60 minutos  
📦 **Procesa:** Catálogo completo de MegaComputer  
✅ **Ideal para:** Actualizar todo MegaComputer

---

### 3️⃣ Actualización Completa (Todo)

```bash
actualizar-todo-con-fotos.bat
```

⏱️ **Tiempo:** 1-2 horas  
📦 **Procesa:** Todo (MegaComputer + SmartJoys + Disyvar)  
✅ **Ideal para:** Actualización mensual completa

---

## 🔥 Empezar AHORA (3 pasos)

### Paso 1: Ver Estado Actual

```bash
ver-productos-sin-fotos.bat
```

Esto te mostrará cuántos productos necesitan fotos.

---

### Paso 2: Actualizar Fotos

```bash
re-scrapear-fotos-ahora.bat
```

Espera 15-30 minutos mientras el sistema trabaja.

---

### Paso 3: Verificar Resultados

Abre el dashboard:
```
http://localhost:3000/dashboard
```

Revisa que los productos tengan fotos.

---

## 📊 ¿Qué hace el sistema?

```
┌─────────────────────────────────────────┐
│  1. Busca productos sin fotos en BD     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  2. Detecta origen (MegaComputer,       │
│     SmartJoys, Disyvar, Megapacks)      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  3. Re-scrapea la tienda original       │
│     para obtener fotos reales           │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  4. Actualiza automáticamente la BD     │
│     con las nuevas imágenes             │
└─────────────────────────────────────────┘
```

---

## 🏪 Tiendas Soportadas

| Tienda | Detección | Estado |
|--------|-----------|--------|
| **MegaComputer** | Tags: `megacomputer` | ✅ Funcional |
| **SmartJoys** | Tags: `smartjoys` | ✅ Funcional |
| **Disyvar** | Tags: `disyvar` | ✅ Funcional |
| **Megapacks** | Nombre contiene "megapack" | ✅ Funcional |
| **Dropshipping** | Tags: `dropshipping` | ✅ Funcional |

---

## 📈 Ejemplo de Salida

```
🚀 RE-SCRAPEANDO PRODUCTOS Y ACTUALIZANDO FOTOS

📦 Productos a actualizar: 45

[1/45] Laptop HP 15-dy2021la
   🏪 Origen detectado: MEGACOMPUTER
   🔍 Buscando en MegaComputer...
   ✅ Actualizado: 5 imágenes

[2/45] Audífonos Bluetooth TWS
   🏪 Origen detectado: SMARTJOYS
   🔍 Buscando en SmartJoys...
   ✅ Actualizado: 3 imágenes

...

📊 RESUMEN FINAL
✅ Actualizados: 42
⚠️  Sin cambios: 3
❌ Errores: 0
```

---

## 🎯 Casos de Uso

### Caso 1: Primera Importación
**Problema:** Importaste productos pero sin fotos  
**Solución:** `re-scrapear-fotos-ahora.bat`

### Caso 2: Actualizar MegaComputer
**Problema:** Productos de MegaComputer desactualizados  
**Solución:** `re-importar-megacomputer-ahora.bat`

### Caso 3: Actualización Completa
**Problema:** Quieres actualizar todo el catálogo  
**Solución:** `actualizar-todo-con-fotos.bat`

### Caso 4: Megapacks Sin Fotos
**Problema:** Megapacks no tienen imágenes  
**Solución:** `re-scrapear-fotos-ahora.bat` (usa imágenes genéricas)

---

## ⚙️ Configuración Rápida

### Cambiar Velocidad

Edita `scripts/re-scrapear-y-actualizar-fotos.ts`:

```typescript
const DELAY_ENTRE_PRODUCTOS = 3000; // 3 segundos
```

Aumentar si hay errores de timeout.

### Cambiar Límite

```typescript
const MAX_PRODUCTOS_POR_LOTE = 50; // Procesar 50 a la vez
```

Reducir si tu conexión es lenta.

---

## 🐛 Problemas Comunes

### "No se encontraron productos sin fotos"
✅ ¡Perfecto! Todos tienen fotos.

### "Error: timeout"
✅ Aumentar `TIMEOUT_NAVEGACION` a 60000

### "Puppeteer no funciona"
✅ Ejecutar: `npm install puppeteer`

### "Origen desconocido"
✅ El script buscará en todas las tiendas automáticamente

---

## 📚 Documentación Completa

- **`GUIA_RE_SCRAPEAR_PRODUCTOS.md`** - Guía detallada
- **`ESTADO_SCRAPERS_Y_DROPSHIPPING.md`** - Estado general
- **`README_SCRAPER_FOTOS.md`** - Sistema de fotos

---

## 🎉 ¡Listo para Empezar!

### Comando Recomendado:

```bash
re-scrapear-fotos-ahora.bat
```

### Verificar Después:

```bash
ver-productos-sin-fotos.bat
```

### Ver en Dashboard:

```
http://localhost:3000/dashboard
```

---

## 📝 Checklist

- [ ] Ejecutar `ver-productos-sin-fotos.bat`
- [ ] Ejecutar `re-scrapear-fotos-ahora.bat`
- [ ] Esperar 15-30 minutos
- [ ] Verificar en dashboard
- [ ] Probar bot con productos actualizados

---

## 💡 Tip Pro

**Ejecuta esto cada semana:**

```bash
re-scrapear-fotos-ahora.bat
```

Mantendrá tu catálogo siempre actualizado con fotos reales.

---

## 🚀 Siguiente Nivel

Una vez que todos tus productos tengan fotos:

1. **Mejorar descripciones con IA**
   ```bash
   npx tsx scripts/mejorar-descripciones-ia.ts
   ```

2. **Actualizar precios competitivos**
   - Dashboard → Productos → Editar

3. **Probar bot de WhatsApp**
   - Enviar mensaje de prueba
   - Verificar que envíe fotos correctamente

---

**¡Éxito con tu catálogo actualizado! 🎉**

---

**Creado:** 25 de noviembre de 2025  
**Última actualización:** 25 de noviembre de 2025
