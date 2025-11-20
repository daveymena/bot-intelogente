# 🤖 Chatbot de Ayuda - Solo para Administradores

## ✅ Configuración Aplicada

El chatbot de ayuda (PageAssistant) ahora **solo aparece en el dashboard** para administradores.

### 📍 Dónde Aparece

**✅ SÍ aparece en:**
- `/dashboard` - Dashboard principal
- `/dashboard/productos` - Gestión de productos
- `/dashboard/conversaciones` - Conversaciones
- `/dashboard/configuracion` - Configuración
- Cualquier ruta que empiece con `/dashboard`

**❌ NO aparece en:**
- `/tienda` - Tienda pública
- `/tienda/producto/[id]` - Página de producto
- `/tienda/carrito` - Carrito de compras
- `/tienda/checkout` - Proceso de pago
- `/catalogo` - Catálogo público
- `/membresias` - Planes de membresía
- Cualquier ruta pública

## 🎯 Razón

El chatbot de ayuda está diseñado para **asistir a los administradores** con:
- Configuración del sistema
- Conexión de WhatsApp
- Gestión de productos
- Configuración de pagos
- Solución de problemas técnicos

Los **clientes en la tienda** no necesitan este chatbot porque:
- Tienen el bot de WhatsApp para consultas
- Tienen botones de "Consultar por WhatsApp"
- La tienda debe ser limpia y sin distracciones

## 🔧 Implementación

```typescript
// src/components/PageAssistant.tsx

// Solo mostrar en rutas de dashboard (administrador)
// NO mostrar en tienda pública, catálogo, checkout, etc.
const isAdminRoute = pathname?.startsWith('/dashboard')

// No renderizar nada si no es ruta de admin
if (!isAdminRoute) {
  return null
}
```

## 💡 Funcionalidades del Chatbot

El chatbot ayuda a los administradores con:

### 📱 WhatsApp
- Cómo conectar WhatsApp
- Escanear código QR
- Solucionar problemas de conexión

### 📦 Productos
- Agregar productos individuales
- Importar productos masivamente
- Gestionar inventario

### 💳 Pagos
- Configurar MercadoPago
- Configurar PayPal
- Configurar Nequi/Daviplata
- Configurar transferencias bancarias

### 🤖 Bot IA
- Cómo funciona el bot
- Personalizar respuestas
- Configurar razonamiento profundo

### 💬 Conversaciones
- Ver conversaciones activas
- Responder manualmente
- Ver estadísticas

### 🔧 Problemas
- WhatsApp desconectado
- Bot no responde
- Productos no aparecen
- Links de pago no funcionan

## 🎨 Diseño

- **Botón flotante verde** en la esquina inferior derecha
- **Ventana de chat** estilo WhatsApp
- **Respuestas instantáneas** con IA (Groq) o fallback predefinido
- **Contexto de conversación** (últimos 5 mensajes)

## 🚀 Uso

1. El administrador entra al dashboard
2. Ve el botón verde flotante en la esquina
3. Hace clic para abrir el chat
4. Escribe su pregunta
5. Recibe respuesta instantánea con guía paso a paso

---

**Última actualización:** 20 de Noviembre 2025
