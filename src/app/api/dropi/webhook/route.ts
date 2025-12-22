import { NextResponse } from 'next/server'

// POST /api/dropi/webhook - Recibir eventos de Dropi
export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.DROPI_AGENT_TOKEN
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      console.log('❌ Token inválido en webhook de Dropi')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    console.log('📦 Evento de Dropi recibido:')
    console.log('Tipo:', body.event_type || body.type)
    console.log('Datos:', JSON.stringify(body, null, 2))

    // Procesar según el tipo de evento
    const eventType = body.event_type || body.type
    
    switch (eventType) {
      case 'order.created':
      case 'order_created':
        await handleNewOrder(body.data || body)
        break
        
      case 'order.updated':
      case 'order_updated':
        await handleOrderUpdate(body.data || body)
        break
        
      case 'order.shipped':
      case 'order_shipped':
        await handleOrderShipped(body.data || body)
        break
        
      case 'product.updated':
      case 'product_updated':
        await handleProductUpdate(body.data || body)
        break
        
      case 'inventory.updated':
      case 'inventory_updated':
        await handleInventoryUpdate(body.data || body)
        break
        
      default:
        console.log('ℹ️  Tipo de evento no manejado:', eventType)
    }

    return NextResponse.json({
      success: true,
      message: 'Evento procesado',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('❌ Error procesando webhook de Dropi:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error procesando webhook',
      },
      { status: 500 }
    )
  }
}

// Manejar nueva orden
async function handleNewOrder(data: any) {
  console.log('🆕 Nueva orden recibida de Dropi:')
  console.log('   Orden ID:', data.id || data.order_id)
  console.log('   Cliente:', data.customer?.name || data.customer_name)
  console.log('   Total:', data.total || data.amount)
  
  // Aquí puedes:
  // 1. Guardar la orden en tu base de datos
  // 2. Notificar al cliente por WhatsApp
  // 3. Enviar email de confirmación
  // 4. Actualizar inventario
  
  // TODO: Implementar lógica de negocio
}

// Manejar actualización de orden
async function handleOrderUpdate(data: any) {
  console.log('🔄 Orden actualizada:')
  console.log('   Orden ID:', data.id || data.order_id)
  console.log('   Nuevo estado:', data.status)
  
  // Aquí puedes:
  // 1. Actualizar estado en tu base de datos
  // 2. Notificar al cliente del cambio
  
  // TODO: Implementar lógica de negocio
}

// Manejar orden enviada
async function handleOrderShipped(data: any) {
  console.log('📦 Orden enviada:')
  console.log('   Orden ID:', data.id || data.order_id)
  console.log('   Tracking:', data.tracking_number)
  console.log('   Carrier:', data.carrier)
  
  // Aquí puedes:
  // 1. Notificar al cliente con número de rastreo
  // 2. Enviar link de seguimiento
  
  // TODO: Implementar lógica de negocio
}

// Manejar actualización de producto
async function handleProductUpdate(data: any) {
  console.log('📝 Producto actualizado:')
  console.log('   Producto ID:', data.id || data.product_id)
  console.log('   Nombre:', data.name)
  console.log('   Precio:', data.price)
  
  // Aquí puedes:
  // 1. Actualizar producto en tu base de datos
  // 2. Actualizar precio
  // 3. Actualizar imágenes
  
  // TODO: Implementar lógica de negocio
}

// Manejar actualización de inventario
async function handleInventoryUpdate(data: any) {
  console.log('📊 Inventario actualizado:')
  console.log('   Producto ID:', data.product_id)
  console.log('   Stock:', data.stock || data.quantity)
  
  // Aquí puedes:
  // 1. Actualizar stock en tu base de datos
  // 2. Notificar si producto está agotado
  // 3. Reactivar producto si vuelve a tener stock
  
  // TODO: Implementar lógica de negocio
}

// GET /api/dropi/webhook - Verificar que el webhook está activo
export async function GET() {
  return NextResponse.json({
    status: 'active',
    message: 'Dropi webhook endpoint está funcionando',
    timestamp: new Date().toISOString(),
  })
}
