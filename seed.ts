import { db } from './src/lib/db'

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...')

    // Create admin user (Davey Mena)
    const { AuthService } = await import('./src/lib/auth')
    const plainPassword = 'admin123'
    const adminPassword = await AuthService.hashPassword(plainPassword)
    console.log('Plain password:', plainPassword)
    console.log('Password hash created:', adminPassword.substring(0, 20) + '...')

    const user = await db.user.upsert({
      where: { email: 'daveymena16@gmail.com' },
      update: {},
      create: {
        email: 'daveymena16@gmail.com',
        password: adminPassword,
        name: 'Davey Mena',
        phone: '+57 300 000 0000',
        businessName: 'Mi Negocio',
        whatsappNumber: '+57 300 000 0000',
        role: 'ADMIN',
        membershipType: 'PROFESSIONAL',
        membershipEnds: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      }
    })

    console.log('User created with ID:', user.id)
    console.log('User password field:', user.password.substring(0, 20) + '...')

    // Test password verification
    const isValid = await AuthService.verifyPassword(plainPassword, user.password)
    console.log('Password verification test:', isValid ? 'PASS' : 'FAIL')

    // If password verification fails, update the password
    if (!isValid) {
      console.log('Password verification failed, updating password...')
      const newHash = await AuthService.hashPassword(plainPassword)
      await db.user.update({
        where: { id: user.id },
        data: { password: newHash }
      })
      console.log('Password updated successfully')
    }

    console.log('✅ Admin user created:', user.name)

    // Create bot settings
    const settings = await db.botSettings.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        businessName: 'Tecnovariedades D&S',
        businessPhone: '+57 300 123 4567',
        responseDelay: 2,
        autoResponseEnabled: true,
        smartWaitingEnabled: true,
        maxTokens: 500,
        temperature: 0.7
      }
    })

    console.log('✅ Bot settings created')

    // Create sample products
    const products = [
      {
        name: 'Pulsar NS160 FI 2020',
        description: 'Moto en excelentes condiciones, mantenimiento al día, papeles en regla',
        price: 12500000,
        currency: 'COP',
        category: 'PHYSICAL' as const,
        status: 'AVAILABLE' as const,
        images: JSON.stringify(['https://via.placeholder.com/400x300/25D366/FFFFFF?text=Pulsar+NS160']),
        tags: JSON.stringify(['moto', 'pulsar', 'vehiculo', 'transporte']),
        autoResponse: '¡Excelente elección! La Pulsar NS160 FI 2020 es una moto increíble. ¿Te gustaría ver las fotos y conocer más detalles?',
        stock: 3,
        userId: user.id
      },
      {
        name: 'Curso de Piano Completo',
        description: 'Más de 76 clases en HD, acceso de por vida, certificado digital incluido',
        price: 60000,
        currency: 'COP',
        category: 'DIGITAL' as const,
        status: 'AVAILABLE' as const,
        images: JSON.stringify(['https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Piano+Course']),
        tags: JSON.stringify(['piano', 'musica', 'curso', 'educacion']),
        autoResponse: '¡Perfecto! Nuestro curso de piano es completo y para todos los niveles. ¿Te gustaría ver una muestra de las clases?',
        userId: user.id
      },
      {
        name: 'Laptop Gaming ASUS ROG',
        description: 'Intel i7, RTX 3060, 16GB RAM, 512GB SSD - Ideal para gaming',
        price: 3200000,
        currency: 'COP',
        category: 'PHYSICAL' as const,
        status: 'AVAILABLE' as const,
        images: JSON.stringify(['https://via.placeholder.com/400x300/EF4444/FFFFFF?text=ASUS+ROG']),
        tags: JSON.stringify(['laptop', 'gaming', 'computador', 'tecnologia']),
        autoResponse: '¡Excelente para gaming! Esta laptop tiene componentes de alto rendimiento. ¿Quieres conocer las especificaciones completas?',
        stock: 5,
        userId: user.id
      },
      {
        name: 'Paquete de Proyectos Web',
        description: '50 proyectos web completos con código fuente, documentación y soporte',
        price: 150000,
        currency: 'COP',
        category: 'DIGITAL' as const,
        status: 'AVAILABLE' as const,
        images: JSON.stringify(['https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Web+Projects']),
        tags: JSON.stringify(['web', 'proyectos', 'desarrollo', 'codigo']),
        autoResponse: '¡Increíble valor! Con este paquete tendrás acceso a 50 proyectos listos para usar. ¿Te gustaría ver algunos ejemplos?',
        userId: user.id
      },
      {
        name: 'Servicio de Mantenimiento de Motos',
        description: 'Mantenimiento completo para cualquier tipo de moto, incluye revisión general',
        price: 180000,
        currency: 'COP',
        category: 'SERVICE' as const,
        status: 'AVAILABLE' as const,
        images: JSON.stringify(['https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Service']),
        tags: JSON.stringify(['mantenimiento', 'servicio', 'moto', 'mecanica']),
        autoResponse: '¡Tu moto merece lo mejor! Ofrecemos mantenimiento profesional. ¿Qué tipo de moto tienes y qué servicio necesitas?',
        userId: user.id
      }
    ]

    for (const product of products) {
      await db.product.create({ data: product })
    }

    console.log(`✅ ${products.length} products created`)

    // Create sample AI prompts
    const prompts = [
      {
        name: 'Bienvenida Personalizada',
        prompt: `¡Hola! 😊 Bienvenido a Tecnovariedades D&S. Soy tu asistente virtual y estoy aquí para ayudarte. 

¿En qué puedo asistirte hoy?
- 🏍️ Motos y vehículos
- 💻 Laptops y tecnología  
- 🎹 Cursos y educación
- 📦 Otros productos

Escribe lo que buscas y te ayudaré a encontrarlo.`,
        type: 'WELCOME' as const,
        isActive: true,
        userId: user.id
      },
      {
        name: 'Información de Producto',
        prompt: `Basado en tu consulta, aquí tienes la información del producto:

📦 {product_name}
💰 Precio: {price}
📝 Descripción: {description}
✅ Estado: {status}

¿Te gustaría:
1. Ver más fotos del producto?
2. Conocer los métodos de pago?
3. Agendar una visita?
4. Hacer otra consulta?

Escribe el número de tu opción o pregunta lo que necesites.`,
        type: 'PRODUCT_INFO' as const,
        isActive: true,
        userId: user.id
      },
      {
        name: 'Información de Precios',
        prompt: `💰 Información de Precios

{product_name}: {price}

💳 Métodos de pago disponibles:
- Efectivo
- Transferencia bancaria
- PSE
- Tarjeta de crédito (cuotas disponibles)

🎁 ¿Interesado en este producto? Puedo ayudarte a:
- Calcular cuotas
- Verificar disponibilidad
- Agendar una cita
- Reservar el producto

¿Qué te gustaría hacer?`,
        type: 'PRICING' as const,
        isActive: true,
        userId: user.id
      },
      {
        name: 'Soporte al Cliente',
        prompt: `🤝 Soporte al Cliente

Entiendo tu consulta. Estoy aquí para ayudarte a resolverlo.

¿Necesitas ayuda con:
1. Información de productos
2. Estado de tu pedido
3. Métodos de pago
4. Garantía y devoluciones
5. Otra consulta

Escribe el número o describe tu problema y te ayudaré inmediatamente.`,
        type: 'SUPPORT' as const,
        isActive: true,
        userId: user.id
      },
      {
        name: 'Cierre de Conversación',
        prompt: `¡Gracias por contactarnos! 🎉

Ha sido un placer atenderte. 

📞 Si necesitas más ayuda:
- WhatsApp: {business_phone}
- Email: {business_email}
- Horario: Lunes a Sábado 8am-6pm

✨ No olvides seguirnos en nuestras redes sociales para más ofertas y novedades.

¡Que tengas un excelente día! 😊`,
        type: 'CLOSING' as const,
        isActive: true,
        userId: user.id
      }
    ]

    for (const prompt of prompts) {
      await db.aIPrompt.create({ data: prompt })
    }

    console.log(`✅ ${prompts.length} AI prompts created`)

    // Create sample conversations
    const conversations = [
      {
        customerPhone: '+57 301 234 5678',
        customerName: 'Carlos Rodríguez',
        status: 'ACTIVE' as const,
        userId: user.id
      },
      {
        customerPhone: '+57 315 890 1234',
        customerName: 'María González',
        status: 'CLOSED' as const,
        userId: user.id
      },
      {
        customerPhone: '+57 320 456 7890',
        customerName: 'Juan Pérez',
        status: 'ACTIVE' as const,
        userId: user.id
      }
    ]

    for (const conv of conversations) {
      await db.conversation.create({ data: conv })
    }

    console.log(`✅ ${conversations.length} conversations created`)

    console.log('🎉 Database seeded successfully!')
    console.log('\n📊 Summary:')
    console.log(`- User: ${user.name}`)
    console.log(`- Products: ${products.length}`)
    console.log(`- AI Prompts: ${prompts.length}`)
    console.log(`- Conversations: ${conversations.length}`)
    console.log('\n🚀 You can now test the system at http://localhost:3000')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    await db.$disconnect()
  }
}

seedDatabase()