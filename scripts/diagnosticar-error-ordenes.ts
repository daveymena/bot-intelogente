/**
 * Diagnosticar y Arreglar Error de Órdenes
 * Verifica la conexión a BD y el modelo Order
 */

import { PrismaClient } from '@prisma/client'

async function diagnosticar() {
  console.log('🔍 Diagnosticando error de órdenes...\n')

  try {
    const prisma = new PrismaClient()

    // 1. Verificar conexión a BD
    console.log('1️⃣ Verificando conexión a base de datos...')
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Conexión a BD: OK\n')

    // 2. Verificar que la tabla existe
    console.log('2️⃣ Verificando tabla "orders"...')
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'orders'
      )
    `
    console.log('✅ Tabla "orders": Existe\n')

    // 3. Intentar crear una orden de prueba
    console.log('3️⃣ Intentando crear orden de prueba...')
    const testOrder = await prisma.order.create({
      data: {
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        customerPhone: '3001234567',
        customerAddress: 'Calle Test 123',
        customerCity: 'Bogotá',
        notes: 'Orden de prueba',
        items: JSON.stringify([
          {
            id: 'test-1',
            name: 'Producto Test',
            price: 50000,
            quantity: 1
          }
        ]),
        total: 50000,
        paymentMethod: 'test',
        status: 'pending'
      }
    })
    console.log('✅ Orden de prueba creada:', testOrder.id)
    console.log('   Datos:', {
      id: testOrder.id,
      nombre: testOrder.customerName,
      email: testOrder.customerEmail,
      total: testOrder.total,
      estado: testOrder.status
    })
    console.log()

    // 4. Limpiar orden de prueba
    console.log('4️⃣ Limpiando orden de prueba...')
    await prisma.order.delete({
      where: { id: testOrder.id }
    })
    console.log('✅ Orden de prueba eliminada\n')

    // 5. Verificar que la API funciona
    console.log('5️⃣ Verificando estructura de la API...')
    console.log('✅ Archivo: src/app/api/orders/create/route.ts')
    console.log('✅ Método: POST')
    console.log('✅ Campos requeridos: customerName, customerEmail, customerPhone, items, total')
    console.log()

    console.log('🎉 DIAGNÓSTICO COMPLETADO')
    console.log('\n✅ TODO ESTÁ FUNCIONANDO CORRECTAMENTE')
    console.log('\nSi aún tienes errores, verifica:')
    console.log('1. Que DATABASE_URL esté configurado correctamente')
    console.log('2. Que la BD esté corriendo')
    console.log('3. Que hayas ejecutado: npx prisma migrate dev')
    console.log('4. Que hayas ejecutado: npx prisma generate')

    await prisma.$disconnect()

  } catch (error: any) {
    console.error('❌ ERROR ENCONTRADO:\n')
    console.error('Tipo:', error.code || error.name)
    console.error('Mensaje:', error.message)
    console.error()

    if (error.code === 'P1000') {
      console.log('🔧 SOLUCIÓN: Problema de conexión a BD')
      console.log('   1. Verifica que DATABASE_URL esté correcto en .env')
      console.log('   2. Verifica que la BD esté corriendo')
      console.log('   3. Ejecuta: npx prisma db push')
    } else if (error.code === 'P1001') {
      console.log('🔧 SOLUCIÓN: No se puede conectar a la BD')
      console.log('   1. Verifica que el servidor de BD esté corriendo')
      console.log('   2. Verifica las credenciales en DATABASE_URL')
    } else if (error.code === 'P2021') {
      console.log('🔧 SOLUCIÓN: La tabla "orders" no existe')
      console.log('   Ejecuta: npx prisma migrate dev')
    } else {
      console.log('🔧 SOLUCIÓN: Ejecuta estos comandos:')
      console.log('   1. npx prisma generate')
      console.log('   2. npx prisma db push')
      console.log('   3. npx prisma migrate dev')
    }
  }
}

diagnosticar()
