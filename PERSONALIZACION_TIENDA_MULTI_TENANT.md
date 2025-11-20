# 🏪 Personalización de Tienda Multi-Tenant

## ✅ Sistema Implementado

Ahora cada cliente puede personalizar completamente su propia tienda desde el dashboard.

## 🎯 Características

### 📝 Información Básica
- **Nombre de la Tienda**: Personalizable
- **Eslogan**: Frase descriptiva
- **Descripción**: Texto completo sobre la tienda

### 🎨 Colores Personalizables
- **Color Principal**: Para botones y elementos destacados
- **Color Secundario**: Para elementos secundarios
- **Color de Acento**: Para llamados a la acción
- **Vista previa en tiempo real** de los colores

### 🖼️ Imágenes
- **Logo**: Logo principal de la tienda
- **Logo Cuadrado**: Para redes sociales y favicon
- **Banner**: Imagen hero de la tienda

### 📞 Información de Contacto
- Email
- Teléfono
- WhatsApp
- Dirección física
- Ciudad
- País

### 🌐 Redes Sociales
- Facebook
- Instagram
- Twitter / X
- TikTok

## 🔧 Implementación Técnica

### 1. **Base de Datos**
Modelo `StoreSettings` en Prisma con todos los campos necesarios:
```prisma
model StoreSettings {
  id          String   @id @default(cuid())
  userId      String   @unique
  storeSlug   String   @unique
  storeName   String
  primaryColor String
  // ... más campos
}
```

### 2. **APIs Creadas**

#### `/api/store-settings` (Privada - Requiere autenticación)
- **GET**: Obtiene la configuración del usuario autenticado
- **POST**: Guarda la configuración del usuario autenticado

#### `/api/store-settings/public` (Pública)
- **GET**: Obtiene configuración por `userId` o `storeSlug`
- Usada por la tienda pública para cargar la personalización

### 3. **Página de Configuración**

**Ubicación**: `/dashboard/mi-tienda`

**Características**:
- ✅ Formulario completo con todos los campos
- ✅ Selectores de color con vista previa
- ✅ Validación de URLs para imágenes
- ✅ Botón "Vista Previa" que abre la tienda en nueva pestaña
- ✅ Guardado con feedback visual

## 📱 Cómo Usar

### Para el Administrador:

1. **Ir a Dashboard → Mi Tienda**
2. **Configurar información básica**:
   - Nombre de la tienda
   - Eslogan
   - Descripción

3. **Personalizar colores**:
   - Seleccionar colores con el picker
   - Ver vista previa inmediata

4. **Agregar imágenes**:
   - Subir logo a un servicio (Imgur, Cloudinary, etc.)
   - Pegar la URL en el campo correspondiente

5. **Completar contacto y redes sociales**

6. **Guardar configuración**

7. **Ver vista previa** haciendo clic en el botón

### Para la Tienda Pública:

La tienda automáticamente cargará la configuración del usuario y aplicará:
- ✅ Colores personalizados
- ✅ Logo personalizado
- ✅ Nombre de la tienda
- ✅ Información de contacto
- ✅ Enlaces a redes sociales

## 🎨 Próximos Pasos para Aplicar Personalización

Ahora necesitamos modificar la tienda pública (`/tienda`) para que:

1. **Cargue la configuración** del usuario
2. **Aplique los colores** dinámicamente
3. **Muestre el logo** personalizado
4. **Use el nombre** de la tienda
5. **Muestre información de contacto** en el footer

### Ejemplo de Implementación:

```typescript
// En src/app/tienda/page.tsx

const [storeSettings, setStoreSettings] = useState(null)

useEffect(() => {
  // Cargar configuración de la tienda
  fetch('/api/store-settings/public?userId=USER_ID')
    .then(res => res.json())
    .then(data => setStoreSettings(data.settings))
}, [])

// Aplicar colores dinámicamente
<style jsx global>{`
  :root {
    --primary-color: ${storeSettings?.primaryColor || '#10b981'};
    --secondary-color: ${storeSettings?.secondaryColor || '#3b82f6'};
    --accent-color: ${storeSettings?.accentColor || '#f59e0b'};
  }
`}</style>
```

## 🔐 Seguridad

- ✅ Solo el usuario autenticado puede modificar su configuración
- ✅ La configuración pública solo expone datos seguros (no tokens ni claves)
- ✅ Validación de URLs para prevenir XSS
- ✅ Slugs únicos para evitar colisiones

## 🚀 Beneficios

1. **Multi-Tenant Real**: Cada cliente tiene su propia tienda personalizada
2. **White Label**: Los clientes pueden hacer la tienda completamente suya
3. **Fácil de Usar**: Interfaz intuitiva sin necesidad de código
4. **Vista Previa**: Ver cambios antes de publicar
5. **Profesional**: Tiendas con identidad de marca propia

## 📊 Modelo de Negocio

Esto permite ofrecer diferentes planes:

- **Plan Básico**: Personalización limitada (solo colores)
- **Plan Pro**: Personalización completa + dominio personalizado
- **Plan Enterprise**: Todo lo anterior + soporte prioritario

---

**Última actualización:** 20 de Noviembre 2025
