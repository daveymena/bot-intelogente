# 🔄 GUÍA DE SINCRONIZACIÓN TIENDA Y BOT

## 📋 Problemas Identificados

### 1. Productos Duplicados
- La tienda y el bot tienen productos repetidos
- Esto causa confusión y desorganización
- Necesitan estar sincronizados

### 2. Imágenes de Megapacks Faltantes
- Los megapacks individuales no tienen sus imágenes específicas
- Todos usan la misma imagen genérica
- Cada megapack debe tener su propia imagen

---

## ✅ SOLUCIÓN IMPLEMENTADA

### Script 1: Sincronización Completa
**Archivo:** `scripts/sincronizar-tienda-bot.ts`

**Qué hace:**
1. ✅ Busca productos duplicados
2. ✅ Elimina duplicados (mantiene el más reciente)
3. ✅ Actualiza imágenes de megapacks
4. ✅ Verifica sincronización
5. ✅ Genera reporte completo

### Script 2: Actualizar Imágenes de Megapacks
**Archivo:** `scripts/actualizar-imagenes-megapacks.ts`

**Qué hace:**
1. ✅ Busca todos los megapacks
2. ✅ Muestra cuáles tienen/no tienen imágenes
3. ✅ Actualiza con las URLs correctas
4. ✅ Da instrucciones para personalizar

---

## 🚀 CÓMO USAR

### Opción 1: Sincronización Rápida (Recomendado)

```bash
sincronizar-tienda.bat
```

Este comando:
- Elimina duplicados automáticamente
- Actualiza imágenes de megapacks
- Sincroniza todo el catálogo

### Opción 2: Solo Actualizar Imágenes

```bash
actualizar-imagenes-megapacks.bat
```

Este comando:
- Solo actualiza las imágenes de megapacks
- No elimina duplicados
- Útil si ya sincronizaste antes

---

## 📸 CÓMO AGREGAR IMÁGENES PERSONALIZADAS

### Paso 1: Subir Imágenes

Sube las imágenes de cada megapack a un servicio gratuito:

**Opciones recomendadas:**
- **PostImage:** https://postimages.org/ (Recomendado)
- **ImgBB:** https://imgbb.com/
- **Imgur:** https://imgur.com/

**Instrucciones:**
1. Ve a PostImage
2. Sube la imagen del Megapack 1
3. Copia la URL directa (Direct Link)
4. Repite para cada megapack

### Paso 2: Editar el Script

Abre el archivo: `scripts/actualizar-imagenes-megapacks.ts`

Busca esta sección:

```typescript
const MEGAPACK_IMAGES: Record<string, string> = {
  // Ejemplo:
  // '1': 'https://tu-url-de-imagen.com/megapack-1.jpg',
  // '2': 'https://tu-url-de-imagen.com/megapack-2.jpg',
  
  'default': 'https://i.postimg.cc/Kz8Lh5Qy/megapack-default.jpg'
}
```

Reemplaza con tus URLs:

```typescript
const MEGAPACK_IMAGES: Record<string, string> = {
  '1': 'https://i.postimg.cc/ABC123/megapack-1.jpg',
  '2': 'https://i.postimg.cc/DEF456/megapack-2.jpg',
  '3': 'https://i.postimg.cc/GHI789/megapack-3.jpg',
  '4': 'https://i.postimg.cc/JKL012/megapack-4.jpg',
  '5': 'https://i.postimg.cc/MNO345/megapack-5.jpg',
  // ... continúa para todos los megapacks
  
  'default': 'https://i.postimg.cc/Kz8Lh5Qy/megapack-default.jpg'
}
```

### Paso 3: Ejecutar Actualización

```bash
actualizar-imagenes-megapacks.bat
```

---

## 🔍 VERIFICAR RESULTADOS

### 1. Verificar en la Tienda

```
http://localhost:3000/tienda
```

**Qué verificar:**
- ✅ No hay productos duplicados
- ✅ Cada megapack tiene su imagen
- ✅ Todos los productos se ven correctamente

### 2. Verificar en el Catálogo

```
http://localhost:3000/catalogo
```

**Qué verificar:**
- ✅ Mismos productos que en la tienda
- ✅ Imágenes correctas
- ✅ Precios actualizados

### 3. Verificar en el Bot

**Prueba con WhatsApp:**
```
"Muéstrame los megapacks"
"Info del Megapack 1"
"Tienes foto del Megapack 2?"
```

**Qué verificar:**
- ✅ Bot encuentra los productos
- ✅ Envía las imágenes correctas
- ✅ Información sincronizada

---

## 📊 REPORTE DE SINCRONIZACIÓN

Después de ejecutar `sincronizar-tienda.bat`, verás un reporte como este:

```
🔄 SINCRONIZACIÓN TIENDA <-> BOT
============================================================

📦 1. Buscando productos duplicados...
   ⚠️  Encontrados 3 productos duplicados

   📌 "laptop hp core i5" (2 copias)
      1. ID: abc123 | Precio: 1500000 | Creado: 01/11/2025
      2. ID: def456 | Precio: 1500000 | Creado: 05/11/2025

   🗑️  Eliminando duplicados (manteniendo el más reciente)...
      ❌ Eliminado: abc123
      ✅ Mantenido: def456 (más reciente)

   ✅ 3 productos duplicados eliminados


📸 2. Actualizando imágenes de megapacks individuales...
   Encontrados 10 megapacks

   ✅ Megapack 1: Imagen actualizada
   ✅ Megapack 2: Imagen actualizada
   ...

   ✅ 10 imágenes de megapacks actualizadas


🔍 3. Verificando sincronización...

   📊 Total de productos: 45

   📋 Por categoría:
      • PHYSICAL: 25
      • DIGITAL: 20

   ✅ Todos los productos tienen imágenes


============================================================
✅ SINCRONIZACIÓN COMPLETADA
============================================================

📊 Resumen:
   • Duplicados eliminados: 3
   • Imágenes actualizadas: 10
   • Total productos: 45
   • Productos sin imágenes: 0

💡 Próximos pasos:
   1. Verifica la tienda: http://localhost:3000/tienda
   2. Verifica el catálogo: http://localhost:3000/catalogo
   3. Prueba el bot de WhatsApp
```

---

## 🛠️ SOLUCIÓN DE PROBLEMAS

### Problema: "No se encontraron duplicados"

**Causa:** Ya están sincronizados o no hay duplicados

**Solución:** 
- Verifica manualmente en la tienda
- Si ves duplicados, puede ser un problema de caché
- Reinicia el servidor: `npm run dev`

### Problema: "No se encontraron megapacks"

**Causa:** Los productos no tienen "megapack" en el nombre

**Solución:**
1. Verifica los nombres en la base de datos
2. Asegúrate de que incluyan "megapack" o "mega pack"
3. Renombra si es necesario

### Problema: "Imagen no se actualiza"

**Causa:** URL incorrecta o caché del navegador

**Solución:**
1. Verifica que la URL sea directa (termina en .jpg, .png, etc.)
2. Limpia caché del navegador (Ctrl + Shift + R)
3. Verifica que la imagen sea pública

### Problema: "Error al conectar a la base de datos"

**Causa:** Base de datos no está corriendo

**Solución:**
```bash
# Verificar conexión
npx prisma db push

# Si falla, reiniciar
npm run dev
```

---

## 📝 COMANDOS ÚTILES

### Ver todos los productos
```bash
npx tsx scripts/ver-productos.ts
```

### Verificar duplicados (sin eliminar)
```bash
npx tsx scripts/verificar-duplicados.ts
```

### Limpiar duplicados manualmente
```bash
npx tsx scripts/limpiar-duplicados.ts
```

### Ver productos sin imágenes
```bash
npx tsx scripts/verificar-imagenes.ts
```

---

## 🎯 MEJORES PRÁCTICAS

### 1. Sincronizar Regularmente
- Ejecuta `sincronizar-tienda.bat` cada semana
- Especialmente después de agregar productos nuevos

### 2. Usar Nombres Consistentes
- Megapack 1, Megapack 2, etc.
- No usar "Pack 1" o "Mega Pack 1" mezclado

### 3. Imágenes de Calidad
- Tamaño recomendado: 800x800px mínimo
- Formato: JPG o PNG
- Peso: Menos de 500KB

### 4. Verificar Después de Cambios
- Siempre verifica la tienda después de sincronizar
- Prueba el bot para confirmar
- Revisa el catálogo público

---

## 📞 SOPORTE

Si tienes problemas:
- 📱 WhatsApp: +57 304 274 8687
- 📧 Email: deinermen25@gmail.com

---

## ✅ CHECKLIST DE SINCRONIZACIÓN

Antes de considerar completada la sincronización:

- [ ] Ejecuté `sincronizar-tienda.bat`
- [ ] No hay productos duplicados en la tienda
- [ ] Cada megapack tiene su imagen específica
- [ ] Verifiqué la tienda en el navegador
- [ ] Verifiqué el catálogo público
- [ ] Probé el bot de WhatsApp
- [ ] Las imágenes se ven correctamente
- [ ] Los precios están actualizados
- [ ] Todo funciona correctamente

---

**Fecha:** 6 de noviembre de 2025
**Versión:** 1.0
**Estado:** ✅ Listo para usar
