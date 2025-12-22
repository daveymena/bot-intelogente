# 📊 Guía Completa - Base de Datos

## ✅ Base de Datos Configurada

Tu sistema ya tiene una base de datos completa con SQLite y Prisma.

---

## 🗄️ Tablas Principales

### 1. **Users** (Usuarios)
Almacena información de los usuarios del sistema.

**Campos importantes:**
- `email` - Email del usuario
- `name` - Nombre
- `businessName` - Nombre del negocio
- `whatsappNumber` - Número de WhatsApp
- `role` - ADMIN o USER
- `membershipType` - FREE, TRIAL, BASIC, PROFESSIONAL, ENTERPRISE

### 2. **Products** (Productos) ⭐
Almacena los productos que el bot puede vender.

**Campos importantes:**
- `name` - Nombre del producto
- `description` - Descripción detallada
- `price` - Precio
- `currency` - Moneda (USD, COP, etc.)
- `category` - PHYSICAL, DIGITAL, SERVICE
- `status` - AVAILABLE, OUT_OF_STOCK, DISCONTINUED
- `stock` - Cantidad disponible
- `tags` - Palabras clave para búsqueda (JSON)
- `autoResponse` - Respuesta predefinida del bot

**Ejemplo de producto:**
```json
{
  "name": "Laptop HP 15.6\"",
  "description": "Laptop HP con Intel i5, 8GB RAM, 256GB SSD",
  "price": 599.99,
  "currency": "USD",
  "category": "PHYSICAL",
  "status": "AVAILABLE",
  "stock": 15,
  "tags": ["laptop", "hp", "computadora"],
  "autoResponse": "La Laptop HP es perfecta para trabajo..."
}
```

### 3. **Conversations** (Conversaciones)
Almacena las conversaciones con clientes.

**Campos importantes:**
- `customerPhone` - Teléfono del cliente
- `customerName` - Nombre del cliente
- `status` - ACTIVE, CLOSED, ARCHIVED
- `lastMessageAt` - Última actividad
- `productId` - Producto relacionado (opcional)

### 4. **Messages** (Mensajes)
Almacena todos los mensajes de las conversaciones.

**Campos importantes:**
- `content` - Contenido del mensaje
- `type` - TEXT, IMAGE, AUDIO, VIDEO, DOCUMENT
- `direction` - INCOMING (cliente) o OUTGOING (bot)
- `aiGenerated` - Si fue generado por IA
- `confidence` - Confianza de la IA (0-1)

### 5. **AIPrompt** (Prompts de IA)
Almacena instrucciones personalizadas para la IA.

**Campos importantes:**
- `name` - Nombre del prompt
- `prompt` - Contenido/instrucción
- `type` - WELCOME, PRODUCT_INFO, PRICING, SUPPORT, CLOSING, CUSTOM
- `isActive` - Si está activo

**Ejemplo de prompt:**
```json
{
  "name": "Política de Envíos",
  "prompt": "Hacemos envíos gratis en compras mayores a $50. Envíos nacionales en 2-3 días.",
  "type": "CUSTOM",
  "isActive": true
}
```

### 6. **BotSettings** (Configuración del Bot)
Configuración general del bot.

**Campos importantes:**
- `businessName` - Nombre del negocio
- `businessPhone` - Teléfono del negocio
- `autoResponseEnabled` - Respuestas automáticas activadas
- `responseDelay` - Delay antes de responder (segundos)
- `maxTokens` - Longitud máxima de respuestas
- `temperature` - Creatividad de la IA (0-2)

### 7. **WhatsAppConnection** (Conexión WhatsApp)
Estado de la conexión de WhatsApp.

**Campos importantes:**
- `phoneNumber` - Número conectado
- `status` - DISCONNECTED, CONNECTING, CONNECTED, ERROR, QR_PENDING
- `isConnected` - Si está conectado
- `lastConnectedAt` - Última conexión
- `lastMessageAt` - Último mensaje

---

## 🚀 Agregar Productos

### Opción 1: Script Automático (RECOMENDADO)

Ejecuta el script para agregar 8 productos de ejemplo:

```bash
agregar-productos.bat
```

Esto agregará:
- Laptop HP 15.6" - $599.99
- Laptop Dell Inspiron - $749.99
- Mouse Inalámbrico Logitech - $29.99
- Teclado Mecánico RGB - $89.99
- Monitor 24" Full HD - $149.99
- Audífonos Bluetooth Sony - $199.99
- Webcam HD 1080p - $49.99
- Disco Duro Externo 1TB - $59.99

### Opción 2: Desde el Dashboard

1. Ve a http://localhost:3000/dashboard
2. Haz clic en "Productos" en el menú
3. Haz clic en "Agregar Producto"
4. Completa el formulario:
   - Nombre del producto
   - Descripción detallada
   - Precio
   - Categoría
   - Stock
5. Haz clic en "Guardar"

### Opción 3: Con Prisma Studio

```bash
npx prisma studio
```

1. Se abrirá una interfaz web
2. Ve a la tabla "Product"
3. Haz clic en "Add record"
4. Completa los campos
5. Guarda

---

## 🔍 Ver la Base de Datos

### Opción 1: Prisma Studio (Visual)

```bash
npx prisma studio
```

Abre una interfaz web donde puedes:
- Ver todas las tablas
- Editar registros
- Agregar nuevos registros
- Eliminar registros

### Opción 2: Línea de Comandos

```bash
# Ver productos
npx prisma db seed

# O usar SQLite directamente
sqlite3 prisma/dev.db "SELECT * FROM products;"
```

---

## 📝 Cómo el Bot Usa los Productos

### 1. Consulta Automática

Cuando un cliente pregunta por productos, el bot:
1. Busca en la tabla `Product`
2. Filtra por `status = AVAILABLE`
3. Ordena por relevancia
4. Genera una respuesta con los productos

### 2. Búsqueda por Tags

Si el cliente pregunta: "Tienes laptops?"

El bot:
1. Busca productos con tag "laptop"
2. Retorna los que coincidan
3. Muestra nombre, precio y descripción

### 3. Información Detallada

Si el cliente pregunta: "Cuánto cuesta la Laptop HP?"

El bot:
1. Busca el producto por nombre
2. Retorna precio y descripción completa
3. Ofrece hacer el pedido

---

## 🎨 Personalizar Productos

### Campos Importantes para el Bot

**1. Description (Descripción)**
- Debe ser detallada
- Incluir características principales
- Mencionar beneficios
- El bot usa esto para responder preguntas

**2. Tags (Etiquetas)**
- Palabras clave para búsqueda
- Formato: JSON array
- Ejemplo: `["laptop", "hp", "computadora", "portatil"]`
- El bot busca por estos tags

**3. AutoResponse (Respuesta Automática)**
- Respuesta predefinida del bot
- Opcional pero recomendado
- Debe incluir precio y call-to-action
- Ejemplo: "La Laptop HP cuesta $599. ¿Te gustaría hacer el pedido?"

---

## 📊 Ejemplo Completo de Producto

```typescript
{
  name: "Laptop HP 15.6\"",
  description: "Laptop HP con procesador Intel Core i5, 8GB RAM, 256GB SSD. Perfecta para trabajo y estudio. Incluye Windows 11 y garantía de 1 año.",
  price: 599.99,
  currency: "USD",
  category: "PHYSICAL",
  status: "AVAILABLE",
  stock: 15,
  tags: ["laptop", "hp", "computadora", "portatil", "notebook"],
  autoResponse: "La Laptop HP 15.6\" es una excelente opción para trabajo y estudio. Tiene procesador Intel i5, 8GB RAM y 256GB SSD. Precio: $599.99 con envío gratis. ¿Te gustaría hacer el pedido?"
}
```

---

## 🔄 Actualizar Productos

### Desde el Dashboard

1. Ve a "Productos"
2. Haz clic en el producto a editar
3. Modifica los campos
4. Guarda

### Con Prisma Studio

```bash
npx prisma studio
```

1. Abre la tabla "Product"
2. Haz clic en el registro
3. Edita los campos
4. Guarda

---

## 🗑️ Eliminar Productos

### Marcar como No Disponible (Recomendado)

En lugar de eliminar, cambia el `status`:
- `AVAILABLE` → `OUT_OF_STOCK` (sin stock)
- `AVAILABLE` → `DISCONTINUED` (descontinuado)

El bot no mostrará productos con estos estados.

### Eliminar Permanentemente

Desde Prisma Studio o el dashboard.

---

## 📈 Estadísticas

### Ver Productos Más Consultados

El bot guarda en `Conversation` el `productId` cuando un cliente pregunta por un producto específico.

Puedes consultar:
```sql
SELECT p.name, COUNT(c.id) as consultas
FROM products p
LEFT JOIN conversations c ON c.productId = p.id
GROUP BY p.id
ORDER BY consultas DESC;
```

---

## 🎯 Mejores Prácticas

### 1. Descripciones Detalladas

✅ **Buena descripción:**
```
Laptop HP con procesador Intel Core i5 de 11va generación, 
8GB RAM DDR4, 256GB SSD NVMe. Pantalla Full HD de 15.6". 
Perfecta para trabajo, estudio y entretenimiento. 
Incluye Windows 11 y garantía de 1 año.
```

❌ **Mala descripción:**
```
Laptop HP
```

### 2. Tags Relevantes

✅ **Buenos tags:**
```json
["laptop", "hp", "computadora", "portatil", "notebook", "intel", "i5"]
```

❌ **Malos tags:**
```json
["producto"]
```

### 3. Precios Actualizados

- Revisa precios regularmente
- Actualiza según el mercado
- Marca descuentos claramente

### 4. Stock Real

- Mantén el stock actualizado
- Marca como OUT_OF_STOCK cuando no haya
- Reactiva cuando vuelva a haber

---

## 🚀 Próximos Pasos

1. **Ejecuta:** `agregar-productos.bat` para agregar productos de ejemplo
2. **Prueba:** Envía "Qué productos tienes?" a tu WhatsApp
3. **Verifica:** El bot debe listar los productos
4. **Personaliza:** Edita los productos según tu negocio
5. **Agrega más:** Crea tus propios productos

---

**¡Tu base de datos está lista para almacenar productos y que el bot los venda automáticamente!** 🎉
