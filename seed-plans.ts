import { db } from './src/lib/db'

async function seedSubscriptionPlans() {
  try {
    console.log('🌱 Seeding subscription plans...')

    const plans = [
      {
        name: 'Semanal',
        description: 'Perfecto para probar el servicio por una semana',
        price: 9.99,
        currency: 'USD',
        interval: 'WEEK' as const,
        intervalCount: 1,
        features: JSON.stringify([
          '100 mensajes al día',
          'Hasta 50 productos',
          '1 conexión WhatsApp',
          'Soporte por email',
          'Métricas básicas'
        ]),
        isActive: true
      },
      {
        name: 'Mensual',
        description: 'Ideal para pequeños negocios',
        price: 29.99,
        currency: 'USD',
        interval: 'MONTH' as const,
        intervalCount: 1,
        features: JSON.stringify([
          '500 mensajes al día',
          'Hasta 200 productos',
          '2 conexiones WhatsApp',
          'Soporte prioritario',
          'Métricas avanzadas',
          'Exportación CSV'
        ]),
        isActive: true
      },
      {
        name: 'Semestral',
        description: 'Ahorro del 20% comparado con el plan mensual',
        price: 143.95,
        currency: 'USD',
        interval: 'MONTH' as const,
        intervalCount: 6,
        features: JSON.stringify([
          'Mensajes ilimitados',
          'Hasta 1000 productos',
          '5 conexiones WhatsApp',
          'Soporte prioritario 24/7',
          'Todas las métricas',
          'API access',
          'Integraciones avanzadas'
        ]),
        isActive: true
      },
      {
        name: 'Anual',
        description: 'El mejor valor - Ahorro del 40%',
        price: 359.88,
        currency: 'USD',
        interval: 'YEAR' as const,
        intervalCount: 1,
        features: JSON.stringify([
          'Mensajes ilimitados',
          'Productos ilimitados',
          'Conexiones WhatsApp ilimitadas',
          'Soporte dedicado 24/7',
          'Todas las características',
          'API completa',
          'Integraciones personalizadas',
          'White label disponible',
          'Entrenamiento personalizado'
        ]),
        isActive: true
      }
    ]

    for (const plan of plans) {
      const existingPlan = await db.subscriptionPlan.findFirst({
        where: { name: plan.name }
      })
      
      if (!existingPlan) {
        await db.subscriptionPlan.create({ data: plan })
      }
    }

    console.log(`✅ ${plans.length} subscription plans created`)

  } catch (error) {
    console.error('❌ Error seeding subscription plans:', error)
  } finally {
    await db.$disconnect()
  }
}

seedSubscriptionPlans()