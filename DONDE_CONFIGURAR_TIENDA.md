# 🏪 Dónde Configurar la Tienda

## 📍 Ubicación en el Dashboard

La configuración de la tienda se encuentra en:

**Dashboard → Mi Tienda** (icono de tienda 🏪 en el menú lateral)

## 🎯 Cómo Acceder

### Opción 1: Desde el Menú Lateral
1. Abre el dashboard (`/dashboard`)
2. En el menú lateral izquierdo (verde), busca el icono de tienda 🏪
3. Haz clic en **"Mi Tienda"**
4. Se abrirá la configuración de tu tienda

### Opción 2: URL Directa
- Ve directamente a: `/dashboard` y haz clic en "Mi Tienda" en el menú

## 📋 Qué Puedes Configurar

La página tiene **3 pestañas**:

### 1️⃣ Información Básica
- **Nombre de la Tienda** (requerido)
- **Slogan** (opcional)
- **Descripción** (opcional)

### 2️⃣ Branding
- **Color Primario** (con selector de color)
- **Color Secundario** (con selector de color)
- Vista previa de colores en tiempo real

### 3️⃣ Contacto
- **Email**
- **Teléfono**
- **WhatsApp**
- **Dirección**

## 💾 Cómo Guardar

1. Completa los campos que desees personalizar
2. Haz clic en el botón **"Guardar Cambios"** (arriba a la derecha)
3. Verás un mensaje de confirmación
4. Los cambios se aplicarán inmediatamente en tu tienda

## 👀 Ver Cambios

Para ver cómo se ve tu tienda con los cambios:

1. Abre una nueva pestaña
2. Ve a `/tienda`
3. Verás tu tienda con:
   - Tu nombre personalizado
   - Tus colores personalizados
   - Tu información de contacto en el footer

## 🎨 Ejemplo de Uso

### Paso a Paso:

1. **Ir a Dashboard → Mi Tienda**

2. **Pestaña "Información Básica":**
   - Nombre: "TecnoShop Colombia"
   - Slogan: "La mejor tecnología al mejor precio"
   - Descripción: "Venta de computadores, celulares y accesorios"

3. **Pestaña "Branding":**
   - Color Primario: Verde (#10b981)
   - Color Secundario: Azul (#3b82f6)

4. **Pestaña "Contacto":**
   - Email: contacto@tecnoshop.com
   - Teléfono: +57 300 123 4567
   - WhatsApp: +57 300 123 4567
   - Dirección: Calle 123 #45-67, Bogotá

5. **Guardar Cambios**

6. **Abrir `/tienda` en nueva pestaña**

7. **Ver resultado:**
   - Header verde-azul
   - Nombre "TecnoShop Colombia"
   - Botones verdes
   - Footer con toda tu información

## 🔧 Componentes Técnicos

### Frontend:
- **Componente**: `src/components/dashboard/store-settings-tab.tsx`
- **Hook**: `src/hooks/use-store-settings.ts`
- **Renderizado en**: `src/components/dashboard/main-dashboard.tsx`

### Backend:
- **API Privada**: `/api/store-settings` (GET/POST)
- **API Pública**: `/api/store-settings/public` (GET)

### Base de Datos:
- **Modelo**: `StoreSettings` en Prisma
- **Tabla**: `store_settings`

## ❓ Preguntas Frecuentes

**P: ¿Los cambios son inmediatos?**
R: Sí, al guardar se aplican inmediatamente en la tienda.

**P: ¿Puedo ver una vista previa antes de guardar?**
R: Actualmente no, pero puedes guardar y luego abrir `/tienda` en otra pestaña.

**P: ¿Puedo subir mi propio logo?**
R: Por ahora no hay carga de archivos, pero puedes usar una URL de imagen (Imgur, Cloudinary, etc.)

**P: ¿Los colores afectan toda la tienda?**
R: Sí, afectan header, botones, footer y todos los elementos principales.

**P: ¿Puedo volver a los colores por defecto?**
R: Sí, simplemente cambia los colores a:
- Primario: #10b981 (verde)
- Secundario: #3b82f6 (azul)

## 🚀 Próximas Mejoras

- [ ] Carga de imágenes (logo, banner)
- [ ] Vista previa en tiempo real
- [ ] Más opciones de personalización
- [ ] Temas predefinidos
- [ ] Editor visual

---

**Última actualización:** 20 de Noviembre 2025
