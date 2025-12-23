/**
 * Verificar links de pago en productos
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verificar() {
  console.log('📦 Verificando links de pago en productos...\n')
  
  const products = await prisma.product.findMany({
    where: { status: 'AVAILABLE' },
    select: { 
      id: true, 
      name: true, 
      paymentLinkPayPal: true,
      paymentLinkMercadoPago: true
    },
    take: 10
  })
  
  console.log('Primeros 10 productos:\n')
  products.forEach((p, i) => {
    console.log(`${i+1}. ${p.name}`)
    console.log(`   PayPal: ${p.paymentLinkPayPal || '❌ NO TIENE'}`)
    console.log(`   MercadoPago: ${p.paymentLinkMercadoPago ? p.paymentLinkMercadoPago.substring(0, 60) + '...' : '❌ NO TIENE'}`)
    console.log('')
  })
  
  // Contar productos sin links
  const sinPayPal = await prisma.product.count({
    where: { status: 'AVAILABLE', paymentLinkPayPal: null }
  })
  const sinMercadoPago = await prisma.product.count({
    where: { status: 'AVAILABLE', paymentLinkMercadoPago: null }
  })
  const total = await prisma.product.count({
    where: { status: 'AVAILABLE' }
  })
  
  console.log('📊 Resumen:')
  console.log(`   Total productos: ${total}`)
  console.log(`   Sin PayPal: ${sinPayPal}`)
  console.log(`   Sin MercadoPago: ${sinMercadoPago}`)
  
  await prisma.$disconnect()
}

verificar()
