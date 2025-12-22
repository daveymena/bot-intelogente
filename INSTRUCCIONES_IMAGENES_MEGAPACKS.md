# 📸 INSTRUCCIONES PARA AGREGAR IMÁGENES DE MEGAPACKS

## ⚠️ Problema Actual

Las URLs de imágenes actuales no son accesibles desde tu red:
- ❌ `postimg.cc` - URLs rotas (404/timeout)
- ❌ `imgur.com` - Rate limit (429)
- ❌ `via.placeholder.com` - No accesible (DNS)

## ✅ Solución: Subir Tus Propias Imágenes

### Opción 1: ImgBB (Recomendado - Sin límites)

1. **Ir a ImgBB**: https://imgbb.com/
2. **Subir imagen**: Click en "Start uploading"
3. **Copiar URL directa**: Después de subir, click derecho en la imagen → "Copiar dirección de imagen"
4. **Pegar en el script**

### Opción 2: Cloudinary (Profesional)

1. **Crear cuenta gratis**: https://cloudinary.com/
2. **Subir imágenes** a tu biblioteca
3. **Copiar URL pública** de cada imagen
4. **Pegar en el script**

### Opción 3: Google Drive (Ya lo tienes)

1. **Subir imagen a Google Drive**
2. **Compartir** → "Cualquiera con el enlace"
3. **Copiar enlace**
4. El bot automáticamente lo convertirá a URL directa

## 🔧 Cómo Actualizar las URLs

### Paso 1: Editar el Script

Abre: `scripts/fix-megapack-images.ts`

### Paso 2: Agregar URLs Reales

Reemplaza las URLs en el objeto `MEGAPACK_IMAGES`:

```typescript
const MEGAPACK_IMAGES: Record<string, string> = {
  '1': 'https://i.ibb.co/TU-IMAGEN-1/megapack-1.jpg',
  '2': 'https://i.ibb.co/TU-IMAGEN-2/megapack-2.jpg',
  '3': 'https://i.ibb.co/TU-IMAGEN-3/megapack-3.jpg',
  // ... etc
}
```

### Paso 3: Ejecutar el Script

```bash
npx tsx scripts/fix-megapack-images.ts
```

## 🎨 Crear Imágenes de Megapacks

Si no tienes imágenes, puedes crearlas rápidamente:

### Opción A: Canva (Fácil)

1. Ir a https://www.canva.com/
2. Crear diseño 800x600px
3. Agregar:
   - Fondo azul (#4A90E2)
   - Texto "Mega Pack 01"
   - Ícono de paquete/caja
4. Descargar como JPG
5. Subir a ImgBB

### Opción B: Photopea (Gratis, como Photoshop)

1. Ir a https://www.photopea.com/
2. Nuevo proyecto 800x600px
3. Diseñar imagen
4. Exportar como JPG
5. Subir a ImgBB

## 📋 Template de Imagen Sugerido

```
┌─────────────────────────────┐
│                             │
│      📦 MEGA PACK 01        │
│                             │
│   Cursos Diseño Gráfico     │
│                             │
│        $20.000 COP          │
│                             │
│   Tecnovariedades D&S       │
│                             │
└─────────────────────────────┘
```

**Colores sugeridos:**
- Fondo: #4A90E2 (Azul)
- Texto: #FFFFFF (Blanco)
- Tamaño: 800x600px

## 🚀 Solución Rápida (Mientras Subes Imágenes)

### Opción: Usar Imágenes Locales

1. **Crear carpeta**: `public/images/megapacks/`

2. **Guardar imágenes** ahí con nombres:
   - `megapack-01.jpg`
   - `megapack-02.jpg`
   - etc.

3. **Actualizar script** para usar rutas locales:

```typescript
const MEGAPACK_IMAGES: Record<string, string> = {
  '1': '/images/megapacks/megapack-01.jpg',
  '2': '/images/megapacks/megapack-02.jpg',
  // ... etc
}
```

4. **Ejecutar**:
```bash
npx tsx scripts/fix-megapack-images.ts
```

## ✅ Verificar que Funciona

Después de actualizar, ejecuta:

```bash
npx tsx test-envio-fotos.js
```

Deberías ver:
```
✅ URL válida (image/jpeg)
```

## 📝 Ejemplo Completo

### 1. Subir a ImgBB

```
Imagen: megapack-01.jpg
URL obtenida: https://i.ibb.co/abc123/megapack-01.jpg
```

### 2. Actualizar Script

```typescript
const MEGAPACK_IMAGES: Record<string, string> = {
  '1': 'https://i.ibb.co/abc123/megapack-01.jpg',
  '2': 'https://i.ibb.co/def456/megapack-02.jpg',
  '3': 'https://i.ibb.co/ghi789/megapack-03.jpg',
  // ... continuar con todos
}
```

### 3. Ejecutar

```bash
npx tsx scripts/fix-megapack-images.ts
```

### 4. Verificar

```bash
npx tsx test-envio-fotos.js
```

## 🎯 Resultado Esperado

Cuando un cliente pregunte por un megapack:

```
Cliente: "Info del megapack 1"

Bot: 📚 Mega Pack 01: Cursos Diseño Gráfico
     💰 $20.000 COP
     
     ✅ +100 cursos de diseño
     ✅ Acceso de por vida
     
     ¿Te interesa?

[Envía automáticamente la imagen del megapack]
```

## 💡 Consejos

1. **Usa ImgBB**: Es gratis, sin límites y muy confiable
2. **Tamaño óptimo**: 800x600px (no muy pesadas)
3. **Formato**: JPG o PNG
4. **Peso**: Menos de 500KB por imagen
5. **Nombres claros**: megapack-01.jpg, megapack-02.jpg, etc.

## 🆘 Si Tienes Problemas

1. **Verifica conexión a internet**
2. **Prueba otra URL** de la imagen
3. **Usa Google Drive** (el bot lo convierte automáticamente)
4. **Contacta soporte** si persiste el problema

## 📞 Soporte

Si necesitas ayuda:
- WhatsApp: +57 304 274 8687
- Email: deinermen25@gmail.com

---

**Nota**: Una vez que subas las imágenes reales, el bot funcionará perfectamente y enviará fotos automáticamente cuando los clientes las pidan. 🎉
