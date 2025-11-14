/**
 * 🗄️ Script Interactivo: Manipular Base de Datos
 * Menú simple para operaciones comunes
 */

import { db } from '../src/lib/db'

async function menu() {
  console.log('\n🗄️  MANIPULAR BASE DE DATOS\n')
  console.log('=' .repeat(70))
  console.log('\n¿Qué deseas hacer?\n')
  console.log('1. Ver todos los usuarios')
  console.log('2. Ver todos los productos')
  console.log('3. Ver todas las conversaciones')
  console.log('4. Ver estadísticas generales')
  console.log('5. Agregar producto de prueba')
  console.log('6. Eliminar producto por ID')
  console.log('7. Actualizar precio de producto')
  console.log('8. Buscar productos por nombre')
  console.log('9. Ver mensajes de una conversación')
  console.log('10. Limpiar conversaciones antiguas')
  console.log('\n' + '=' .repeat(70))
  
  // Por ahora ejecutamos todas las opciones de lectura
  await verUsuarios()
  await verProductos()
  await verConversaciones()
  await verEstadisticas()
}

async function verUsuarios() {
  console.log('\n\n👥 USUARIOS\n')
  console.log('-'.repeat(70))
  
  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      membershipType: true,
      isActive: true,
      createdAt: true
    }
  })

  users.forEach((user, index) => {
    console.log(`\n${index + 1}. ${user.email}`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Nombre: ${user.name || 'Sin nombre'}`)
    console.log(`   Rol: ${user.role}`)
    console.log(`   Membresía: ${user.membershipType}`)
    console.log(`   Activo: ${user.isActive ? 'Sí' : 'No'}`)
    console.log(`   Creado: ${user.createdAt.toLocaleDateString()}`)
  })

  console.log(`\n📊 Total: ${users.length} usuarios`)
}

async function verProductos() {
  console.log('\n\n📦 PRODUCTOS\n')
  console.log('-'.repeat(70))
  
  const products = await db.product.findMany({
    include: {
      user: {
        select: { email: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  })

  products.forEach((product, index) => {
    console.log(`\n${index + 1}. ${product.name}`)
    console.log(`   ID: ${product.id}`)
    console.log(`   Precio: $${product.price.toLocaleString('es-CO')} ${product.currency}`)
    console.log(`   Categoría: ${product.category}`)
    console.log(`   Estado: ${product.status}`)
    console.log(`   Usuario: ${product.user.email}`)
    if (product.description) {
      console.log(`   Descripción: ${product.description.substring(0, 60)}...`)
    }
  })

  const total = await db.product.count()
  console.log(`\n📊 Total: ${total} productos (mostrando últimos 20)`)
}

async function verConversaciones() {
  console.log('\n\n💬 CONVERSACIONES\n')
  console.log('-'.repeat(70))
  
  const conversations = await db.conversation.findMany({
    include: {
      _count: {
        select: { messages: true }
      },
      user: {
        select: { email: true }
      }
    },
    orderBy: { lastMessageAt: 'desc' },
    take: 10
  })

  conversations.forEach((conv, index) => {
    console.log(`\n${index + 1}. ${conv.customerPhone}`)
    console.log(`   ID: ${conv.id}`)
    console.log(`   Cliente: ${conv.customerName || 'Sin nombre'}`)
    console.log(`   Estado: ${conv.status}`)
    console.log(`   Mensajes: ${conv._count.messages}`)
    console.log(`   Usuario: ${conv.user.email}`)
    console.log(`   Última actividad: ${conv.lastMessageAt.toLocaleString()}`)
  })

  const total = await db.conversation.count()
  console.log(`\n📊 Total: ${total} conversaciones (mostrando últimas 10)`)
}

async function verEstadisticas() {
  console.log('\n\n📊 ESTADÍSTICAS GENERALES\n')
  console.log('-'.repeat(70))

  // Usuarios
  const totalUsers = await db.user.count()
  const activeUsers = await db.user.count({ where: { isActive: true } })

  // Productos
  const totalProducts = await db.product.count()
  const productsByCategory = await db.product.groupBy({
    by: ['category'],
    _count: true
  })
  const productsByStatus = await db.product.groupBy({
    by: ['status'],
    _count: true
  })

  // Conversaciones
  const totalConversations = await db.conversation.count()
  const activeConversations = await db.conversation.count({
    where: { status: 'ACTIVE' }
  })
  const totalMessages = await db.message.count()

  console.log('\n👥 USUARIOS:')
  console.log(`   Total: ${totalUsers}`)
  console.log(`   Activos: ${activeUsers}`)

  console.log('\n📦 PRODUCTOS:')
  console.log(`   Total: ${totalProducts}`)
  console.log('\n   Por categoría:')
  productsByCategory.forEach(cat => {
    console.log(`   - ${cat.category}: ${cat._count}`)
  })
  console.log('\n   Por estado:')
  productsByStatus.forEach(status => {
    console.log(`   - ${status.status}: ${status._count}`)
  })

  console.log('\n💬 CONVERSACIONES:')
  console.log(`   Total: ${totalConversations}`)
  console.log(`   Activas: ${activeConversations}`)
  console.log(`   Total mensajes: ${totalMessages}`)
  console.log(`   Promedio: ${totalConversations > 0 ? (totalMessages / totalConversations).toFixed(1) : 0} mensajes/conversación`)
}

// Ejecutar
menu()
  .then(() => {
    console.log('\n\n✅ Consulta completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
