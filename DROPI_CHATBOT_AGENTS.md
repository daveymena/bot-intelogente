# 🤖 Dropi - Integración Chatbot Agents

## ⚠️ Limitación Importante

El token JWT que tienes es de tipo **"Chatbot Agents"** (ID: 2730, Tipo: 10), que está diseñado para **recibir webhooks** de Dropi, no para hacer peticiones a la API REST.

### Diferencias entre tipos de integración:

| Tipo | Función | Dirección |
|------|---------|-----------|
| **API REST** | Consultar productos, crear órdenes | Tu app → Dropi |
| **Chatbot Agents** | Recibir notificaciones de eventos | Dropi → Tu app |
| **Webhook** | Recibir eventos de órdenes | Dropi → Tu app |

## 🔄 Cómo funciona Chatbot Agents

Con tu token actual, Dropi puede:
1. ✅ Enviarte notificaciones cuando hay una nueva orden
2. ✅ Notificarte cuando cambia el estado de un pedido
3. ✅ Enviarte actualizaciones de inventario
4. ❌ NO puedes consultar el catálogo de productos
5. ❌ NO puedes crear órdenes desde tu app

## 🛠️ Soluciones Alternativas

### Opción 1: Webhook Receiver (Recomendado para tu caso)

Configura un endpoint en tu app para recibir eventos de Dropi:

```typescript
// src/app/api/dropi/webhook/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('📦 Evento de Dropi recibido:', body)
    
    // Procesar según el tipo de evento
    switch (body.event_type) {
      case 'order.created':
        // Nueva orden recibida
        await handleNewOrder(body.data)
        break
        
      case 'order.updated':
        // Estado de orden actualizado
        await handleOrderUpdate(body.data)
        break
        
      case 'product.updated':
        // Producto actualizado
        await handleProductUpdate(body.data)
        break
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error procesando webhook:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
```

**Configuración en Dropi:**
1. Ve a tu integración "smar-sales" en Dropi
2. Configura la URL del webhook: `https://tu-dominio.com/api/dropi/webhook`
3. Dropi enviará eventos a esa URL

### Opción 2: Solicitar API Key de Productos

Contacta a soporte de Dropi y solicita:
- **API Key para consulta de productos**
- **Tipo de integración: API REST**

Esto te permitirá:
- Consultar catálogo de productos
- Crear órdenes programáticamente
- Consultar estados de pedidos

### Opción 3: Usar Scraping (Ya implementado)

Tu proyecto ya tiene scripts de scraping de Dropi:
- `scripts/scrape-dropi.ts`
- `scripts/import-dropi.ts`

Estos scripts pueden:
- ✅ Obtener productos de tiendas Dropi
- ✅ Importar a tu base de datos
- ✅ Actualizar precios e inventario

**Ejecutar scraping:**
```bash
npx tsx scripts/scrape-dropi.ts
npx tsx scripts/import-dropi.ts
```

### Opción 4: Integración Híbrida (Mejor solución)

Combina las opciones anteriores:

1. **Scraping periódico** → Mantener catálogo actualizado
2. **Webhook receiver** → Recibir notificaciones de órdenes
3. **Tu bot** → Gestionar conversaciones y ventas

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ WhatsApp
       ↓
┌─────────────┐
│   Tu Bot    │ ← Usa productos de tu DB
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Tu Base    │ ← Actualizada por scraping
│  de Datos   │
└──────┬──────┘
       ↑
       │ Webhook
┌─────────────┐
│    Dropi    │ → Notifica nuevas órdenes
└─────────────┘
```

## 🚀 Implementación Recomendada

### Paso 1: Configurar Webhook Receiver

```bash
# Crear endpoint para recibir eventos
# Ya está en: src/app/api/dropi/webhook/route.ts
```

### Paso 2: Configurar Scraping Automático

```typescript
// Ejecutar cada 6 horas
import { exec } from 'child_process'

setInterval(() => {
  console.log('🔄 Actualizando productos de Dropi...')
  exec('npx tsx scripts/scrape-dropi.ts', (error, stdout) => {
    if (error) {
      console.error('Error en scraping:', error)
    } else {
      console.log('✅ Productos actualizados')
    }
  })
}, 6 * 60 * 60 * 1000) // 6 horas
```

### Paso 3: Configurar en Dropi

1. Ve a https://app.dropi.co/integrations
2. Selecciona tu integración "smar-sales"
3. Configura:
   - **Webhook URL**: `https://tu-dominio.com/api/dropi/webhook`
   - **Eventos**: Selecciona los que necesites
   - **Token**: Ya lo tienes configurado

### Paso 4: Probar

```bash
# Probar scraping
npx tsx scripts/scrape-dropi.ts

# Ver productos importados
npx tsx scripts/ver-productos.ts
```

## 📊 Flujo Completo de Venta

```
1. Cliente pregunta por productos
   ↓
2. Bot consulta tu base de datos local
   (Actualizada por scraping de Dropi)
   ↓
3. Cliente selecciona producto
   ↓
4. Bot crea orden en tu sistema
   ↓
5. Tú procesas el pedido manualmente en Dropi
   (O configuras automatización con API REST si la obtienes)
   ↓
6. Dropi envía webhook cuando cambia estado
   ↓
7. Tu sistema notifica al cliente
```

## 🔐 Seguridad del Webhook

Valida que las peticiones vengan de Dropi:

```typescript
export async function POST(request: Request) {
  // Verificar token
  const authHeader = request.headers.get('authorization')
  const expectedToken = process.env.DROPI_AGENT_TOKEN
  
  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Procesar evento...
}
```

## 📞 Contactar Soporte Dropi

Si necesitas acceso completo a la API:

1. **Email**: soporte@dropi.co
2. **Solicita**: API Key para consulta de productos
3. **Menciona**: Tienes integración Chatbot Agents (ID: 2730)
4. **Necesitas**: Acceso a endpoints de productos y órdenes

## 📚 Documentación Dropi

- Panel: https://app.dropi.co
- Integraciones: https://app.dropi.co/integrations
- Soporte: https://app.dropi.co/support

---

## ✅ Próximos Pasos

1. **Ahora**: Usa el scraping existente para obtener productos
2. **Configura**: Webhook receiver para notificaciones
3. **Solicita**: API Key completa a Dropi (opcional)
4. **Automatiza**: Scraping periódico cada 6 horas

El sistema funcionará perfectamente con scraping + webhooks mientras obtienes acceso completo a la API.
