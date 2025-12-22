# 🛍️ Catálogo Público - Tienda Online

## ¿Qué es?

Una tienda online pública donde tus clientes pueden ver todos tus productos sin necesidad de login. Es como un catálogo digital que puedes compartir por WhatsApp, redes sociales o cualquier medio.

## URLs Disponibles

- **`/catalogo`** - Catálogo principal
- **`/tienda`** - Alias que redirige a /catalogo

Ambas URLs son públicas y no requieren autenticación.

## Características

✅ **Acceso Público**: Cualquiera puede ver sin login
✅ **Búsqueda**: Los clientes pueden buscar productos
✅ **Filtros**: Por categoría (Físico, Digital, Servicio)
✅ **Responsive**: Se ve bien en móvil y desktop
✅ **WhatsApp Directo**: Botón para contactar por cada producto
✅ **Imágenes**: Muestra las fotos de tus productos
✅ **Precios**: Formateados automáticamente

## Configuración

### 1. Número de WhatsApp

Edita tu `.env`:

```env
# Número para contacto desde el catálogo (sin + ni espacios)
NEXT_PUBLIC_WHATSAPP_NUMBER=573001234567
```

### 2. Información del Negocio

```env
BUSINESS_NAME="Tu Negocio"
BUSINESS_ADDRESS="Tu dirección"
BUSINESS_PHONE=+57 300 123 4567
```

### 3. Agregar Productos

Los productos se agregan desde el dashboard en `/dashboard` → Productos

Solo los productos con estado "AVAILABLE" aparecen en el catálogo público.

## Cómo Compartir

### Por WhatsApp:
```
¡Mira nuestro catálogo completo! 🛍️
https://tudominio.com/catalogo
```

### En Redes Sociales:
```
🛒 Catálogo Online Disponible
Explora todos nuestros productos
👉 https://tudominio.com/tienda
```

### En tu Bio:
```
🔗 Catálogo: tudominio.com/catalogo
```

## Flujo del Cliente

1. **Cliente recibe el link** del catálogo
2. **Explora productos** sin necesidad de registrarse
3. **Busca y filtra** lo que necesita
4. **Click en "Consultar"** → Se abre WhatsApp
5. **Mensaje pre-escrito** con el producto de interés
6. **Tú respondes** y cierras la venta

## Ventajas

- 📱 **Fácil de compartir**: Un solo link para todo tu catálogo
- 🚀 **Rápido**: Los clientes ven productos al instante
- 💬 **Conversión directa**: Botón de WhatsApp en cada producto
- 🔒 **Seguro**: El dashboard sigue protegido con login
- 📊 **Profesional**: Imagen moderna de tu negocio

## Personalización

### Cambiar Colores

Edita `src/app/catalogo/page.tsx`:

```tsx
// Cambiar color principal (azul por defecto)
className="bg-blue-600" // Cambia a green-600, purple-600, etc.
```

### Agregar Logo

Agrega tu logo en el header:

```tsx
<h1 className="text-3xl font-bold">
  <img src="/logo.png" alt="Logo" className="h-10 inline mr-2" />
  Tu Negocio
</h1>
```

### Cambiar Textos

Todos los textos están en español y puedes modificarlos directamente en el archivo.

## Ejemplo de Uso

**Escenario**: Vendes productos de tecnología

1. Subes 50 productos al dashboard
2. Compartes: `tudominio.com/catalogo`
3. Cliente busca "audífonos"
4. Ve 5 resultados con fotos y precios
5. Click en "Consultar" → WhatsApp
6. Mensaje: "Hola! Me interesa el producto: Audífonos Bluetooth XYZ"
7. Tú respondes y vendes

## Seguridad

- ✅ Solo muestra productos disponibles
- ✅ No expone información sensible
- ✅ No permite modificar nada
- ✅ El dashboard sigue protegido
- ✅ Solo lectura de productos públicos

## SEO (Opcional)

Para mejorar posicionamiento, agrega metadata en `src/app/catalogo/page.tsx`:

```tsx
export const metadata = {
  title: 'Catálogo - Tu Negocio',
  description: 'Explora nuestro catálogo completo de productos',
  keywords: 'productos, tienda, catálogo'
}
```

## Próximos Pasos

1. Configura tu número de WhatsApp en `.env`
2. Agrega productos desde el dashboard
3. Prueba el catálogo en `/catalogo`
4. Comparte el link con tus clientes
5. ¡Empieza a vender!

## Soporte

Si necesitas personalizar más el catálogo:
- Cambiar diseño
- Agregar carrito de compras
- Integrar pagos online
- Agregar más filtros

Solo pídelo y lo implementamos.
