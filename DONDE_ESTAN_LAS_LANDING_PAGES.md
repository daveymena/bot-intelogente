# 📍 ¿Dónde Están las Landing Pages?

## 🎯 Ubicación y Acceso

### **1. Desde el Dashboard (Recomendado)**

Las landing pages están integradas directamente en la **Gestión de Productos**:

```
Dashboard → Productos
```

#### **En cada producto verás:**

📦 **Sección "Landing Page"** (con fondo azul/morado)
- ✅ Botón **"Copiar URL"** - Copia la URL para tus anuncios
- ✅ Botón **"Ver"** - Abre la landing page en nueva pestaña
- ℹ️ Texto: "Para anuncios de Facebook, Google Ads, Instagram"

---

### **2. URL Directa**

Cada producto tiene su propia landing page en:

```
https://tu-dominio.com/landing/[ID-DEL-PRODUCTO]
```

**Ejemplo:**
```
http://localhost:3000/landing/clm123abc456def
```

---

## 🚀 Cómo Usar las Landing Pages

### **Paso 1: Ir a Productos**
1. Abre el dashboard: `http://localhost:3000/dashboard`
2. Ve a la sección **"Productos"**
3. Verás todos tus productos en tarjetas

### **Paso 2: Copiar URL**
1. En cada producto, busca la sección **"Landing Page"** (fondo azul/morado)
2. Click en **"Copiar URL"**
3. ✅ Verás un mensaje: "URL copiada: [Nombre del producto]"
4. La URL está lista para pegar en tus anuncios

### **Paso 3: Ver Preview**
1. Click en **"Ver"** para abrir la landing page
2. Se abre en nueva pestaña
3. Verifica que todo se vea bien
4. Prueba en móvil también

---

## 📱 Dónde Usar las URLs

### **Facebook Ads**
1. Crea tu anuncio en Facebook Ads Manager
2. En "Destino del sitio web" pega la URL
3. ¡Listo! Mayor conversión garantizada

### **Instagram Ads**
1. Crea tu anuncio en Instagram
2. Pega la URL de la landing page
3. Optimizado para móvil automáticamente

### **Google Ads**
1. Crea tu campaña en Google Ads
2. En "URL final" pega la landing page
3. Puedes agregar parámetros UTM si quieres

### **TikTok Ads**
1. Crea tu anuncio en TikTok Ads
2. Pega la URL de la landing page
3. Diseño moderno perfecto para TikTok

### **WhatsApp Business**
1. Copia la URL
2. Envíala a tus clientes por WhatsApp
3. Pueden ver el producto y comprar directamente

### **Redes Sociales**
1. Comparte la URL en Instagram, Facebook, Twitter
2. En tu bio de Instagram
3. En posts y stories

---

## 🎨 Personalización Automática

Cada landing page se personaliza automáticamente con:

✅ **Tu logo** (configurado en Dashboard → Configuración → Tienda)  
✅ **Tus colores** (primario, secundario, acento)  
✅ **Tu nombre de tienda**  
✅ **Tu WhatsApp** de contacto  
✅ **Información del producto** (nombre, precio, imágenes, descripción)  

---

## 🤖 Generar Contenido con IA

### **Desde el Dashboard (Próximamente)**
Habrá un botón "Generar con IA" que creará automáticamente:
- Headline impactante
- Beneficios persuasivos
- CTA optimizado
- Mensaje de urgencia

### **Por Ahora (API)**
Puedes generar contenido abriendo la consola del navegador (F12) y ejecutando:

```javascript
fetch('/api/landing/generate-content', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'generate-full',
    productName: 'Nombre de tu producto',
    description: 'Descripción del producto',
    price: 100000,
    category: 'DIGITAL' // o 'PHYSICAL' o 'SERVICE'
  })
})
.then(r => r.json())
.then(data => console.log('Contenido generado:', data.content))
```

---

## 📊 Estructura Visual

### **En el Dashboard:**

```
┌─────────────────────────────────────┐
│  📦 Producto: Curso de Piano        │
│  💻 Digital                          │
│  $150,000 COP                        │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ ✨ Landing Page                │ │
│  │                                │ │
│  │ [Copiar URL] [Ver]             │ │
│  │                                │ │
│  │ Para anuncios de Facebook,     │ │
│  │ Google Ads, Instagram          │ │
│  └────────────────────────────────┘ │
│                                      │
│  [Editar] [Eliminar]                │
└─────────────────────────────────────┘
```

---

## 🎯 Ventajas de Usar Landing Pages

| Característica | Página Normal | Landing Page |
|---|---|---|
| **Distracciones** | Menú, sidebar, footer | Ninguna |
| **Enfoque** | Catálogo completo | Un solo producto |
| **CTA** | Múltiples opciones | Un solo objetivo |
| **Conversión** | 2-5% | 10-30% |
| **Optimización** | General | Específica para ads |
| **Carga** | Más lenta | Más rápida |

---

## 🔥 Elementos de la Landing Page

Cada landing page incluye:

1. **Hero Section**
   - Imagen grande del producto
   - Badge de oferta animado
   - Precio con descuento
   - Calificación 5 estrellas

2. **Contador de Tiempo**
   - Temporizador en tiempo real
   - Crea urgencia
   - Aumenta conversiones

3. **Badges de Confianza**
   - Compra segura
   - Envío rápido / Acceso inmediato
   - Garantía 100%

4. **Galería de Imágenes**
   - Thumbnails clickeables
   - Zoom en imagen principal

5. **Beneficios**
   - Lista con checkmarks
   - Diseño en cards
   - Fácil de escanear

6. **CTAs Prominentes**
   - Botón "Comprar Ahora"
   - Botón WhatsApp
   - Botón flotante de WhatsApp

7. **Garantía**
   - Satisfacción 100%
   - Devolución de dinero

8. **Footer Minimalista**
   - Solo lo esencial
   - Sin distracciones

---

## 📱 Responsive Design

Las landing pages se adaptan automáticamente a:
- ✅ Desktop (1920px+)
- ✅ Laptop (1024px+)
- ✅ Tablet (768px+)
- ✅ Móvil (320px+)

---

## 🎨 Personalización Avanzada (Próximamente)

En futuras actualizaciones podrás:
- Editar el headline
- Cambiar los beneficios
- Personalizar el CTA
- Agregar testimonios
- Crear variantes A/B
- Ver analytics

---

## 🆘 Solución de Problemas

### **No veo la sección "Landing Page"**
- Asegúrate de estar en Dashboard → Productos
- Refresca la página (F5)
- Verifica que el servidor esté corriendo

### **La URL no funciona**
- Verifica que el servidor esté corriendo: `npm run dev`
- Asegúrate de usar el ID correcto del producto
- Prueba en modo incógnito

### **No se ve mi logo/colores**
- Ve a Dashboard → Configuración → Tienda
- Configura tu logo y colores
- Guarda los cambios
- Refresca la landing page

### **Quiero cambiar el contenido**
- Por ahora, edita el producto en Dashboard → Productos
- Próximamente: Editor visual con IA

---

## 📞 Soporte

¿Necesitas ayuda?
- Revisa la documentación completa en `LANDING_PAGES_EDITABLES_IA_COMPLETO.md`
- Consulta ejemplos en `TODO_LISTO_LANDING_PAGES_IA.md`

---

## ✅ Resumen Rápido

1. **Ubicación:** Dashboard → Productos
2. **Acción:** Click en "Copiar URL" o "Ver"
3. **Uso:** Pega la URL en tus anuncios
4. **Resultado:** Conversiones 3-5x mayores

**¡Así de simple!** 🚀
