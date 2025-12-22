# ✅ Checklist de Funcionalidades del Dashboard

## 🔐 Autenticación
- [ ] Login funciona correctamente
- [ ] Registro de nuevos usuarios
- [ ] Recuperación de contraseña
- [ ] Verificación de email
- [ ] Logout

## 📦 Gestión de Productos
- [ ] Ver lista de productos
- [ ] Crear nuevo producto
- [ ] Editar producto existente
- [ ] Eliminar producto
- [ ] Cambiar estado (Disponible/Agotado)
- [ ] Subir imágenes de productos
- [ ] Agregar tags/etiquetas
- [ ] Filtrar por categoría
- [ ] Buscar productos

## 💬 Conversaciones
- [ ] Ver lista de conversaciones
- [ ] Ver detalles de conversación
- [ ] Ver mensajes
- [ ] Filtrar conversaciones
- [ ] Buscar en conversaciones
- [ ] Marcar como leído/no leído

## 📱 WhatsApp
- [ ] Conectar WhatsApp (escanear QR)
- [ ] Ver estado de conexión
- [ ] Desconectar WhatsApp
- [ ] Reconectar automáticamente
- [ ] Ver número conectado
- [ ] Enviar mensajes de prueba

## 🤖 Prompts de IA
- [ ] Ver lista de prompts
- [ ] Crear nuevo prompt
- [ ] Editar prompt existente
- [ ] Eliminar prompt
- [ ] Activar/desactivar prompt
- [ ] Cambiar tipo de prompt

## ⚙️ Configuración
- [ ] Actualizar información del negocio
- [ ] Configurar nombre del negocio
- [ ] Configurar teléfono
- [ ] Configurar delay de respuesta
- [ ] Activar/desactivar respuestas automáticas
- [ ] Configurar temperatura de IA
- [ ] Configurar max tokens

## 📊 Estadísticas
- [ ] Ver total de conversaciones
- [ ] Ver total de mensajes
- [ ] Ver productos más consultados
- [ ] Ver gráficas de actividad

## 💳 Suscripción
- [ ] Ver plan actual
- [ ] Ver fecha de vencimiento
- [ ] Actualizar plan
- [ ] Ver historial de pagos
- [ ] Cancelar suscripción

## 🛍️ Catálogo Público
- [ ] Ver catálogo en `/catalogo`
- [ ] Buscar productos en catálogo
- [ ] Filtrar por categoría
- [ ] Botón de WhatsApp funciona
- [ ] Imágenes se cargan correctamente

## 📤 Importar/Exportar
- [ ] Exportar productos a JSON
- [ ] Exportar productos a CSV
- [ ] Importar productos desde JSON
- [ ] Importar productos desde CSV

---

## 🔧 Funcionalidades Críticas a Verificar

### 1. Crear Producto
**Pasos:**
1. Dashboard → Productos → Nuevo Producto
2. Llenar formulario
3. Guardar
4. **Verificar:** Aparece en la lista

### 2. Editar Producto
**Pasos:**
1. Click en "Editar" en un producto
2. Cambiar nombre o precio
3. Guardar
4. **Verificar:** Cambios se reflejan

### 3. Conectar WhatsApp
**Pasos:**
1. Dashboard → WhatsApp → Conectar
2. Escanear QR con WhatsApp
3. **Verificar:** Estado cambia a "Conectado"

### 4. Ver Catálogo Público
**Pasos:**
1. Ir a `/catalogo`
2. **Verificar:** Se ven los productos
3. **Verificar:** Búsqueda funciona
4. **Verificar:** Botón de WhatsApp abre chat

### 5. Configuración del Bot
**Pasos:**
1. Dashboard → Configuración
2. Cambiar nombre del negocio
3. Guardar
4. **Verificar:** Cambios se guardan

---

## 🚨 Problemas Conocidos a Verificar

### Problema 1: Productos no se guardan
**Síntoma:** Al crear producto, no aparece en la lista
**Solución:** Verificar que el API `/api/products` funcione

### Problema 2: WhatsApp no conecta
**Síntoma:** QR no aparece o no conecta
**Solución:** Verificar logs del servidor

### Problema 3: Imágenes no cargan
**Síntoma:** Imágenes rotas en productos
**Solución:** Verificar URLs de imágenes

### Problema 4: Configuración no se guarda
**Síntoma:** Cambios no persisten
**Solución:** Verificar API `/api/settings`

---

## 📝 Notas de Prueba

### Datos de Prueba para Producto:
```json
{
  "nombre": "Producto de Prueba",
  "descripcion": "Descripción de prueba",
  "precio": 10000,
  "currency": "COP",
  "category": "PHYSICAL",
  "status": "AVAILABLE"
}
```

### URLs a Probar:
- Dashboard: `/dashboard`
- Productos: `/dashboard` (sección productos)
- WhatsApp: `/dashboard` (sección whatsapp)
- Configuración: `/dashboard` (sección configuración)
- Catálogo: `/catalogo`
- API Health: `/api/health`

---

## ✅ Checklist de Importación de Productos

- [ ] Script de importación creado
- [ ] Productos del JSON importados
- [ ] Imágenes configuradas
- [ ] Precios correctos
- [ ] Categorías asignadas
- [ ] Tags agregados
- [ ] Estado AVAILABLE
- [ ] Visible en dashboard
- [ ] Visible en catálogo público

---

**Última actualización:** 31 de Octubre, 2025
