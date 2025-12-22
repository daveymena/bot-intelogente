import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function agregarMotos() {
    try {
        console.log('🏍️ Agregando motos al catálogo...\n')

        const userId = 'cmhc22zw20000kmhgvx5ubazy' // Tu usuario

        // Moto Bajaj Pulsar NS 160 FI1 - Modelo 2020
        const moto = await prisma.product.create({
            data: {
                userId,
                name: 'Moto Bajaj Pulsar NS 160 FI1 (2020)',
                description: `🏍️ **BAJAJ PULSAR NS 160 FI1 - MODELO 2020**

¡Moto en excelentes condiciones, lista para rodar! 🔥

📋 **ESPECIFICACIONES:**
🚦 Modelo: 2020
⚙️ Motor: 160cc Inyección Electrónica (FI1)
🧾 Papeles: Al día + Traspaso disponible
🛠️ Mantenimiento: Reciente, todo al día
💥 Estado: Impecable y muy cuidada
✅ SOAT y Tecnomecánica vigentes

💰 **PRECIOS:**
� Preciio inicial: $6.500.000 COP
🎯 Con rebaja: $6.300.000 COP
🔥 Precio final negociable: $6.000.000 COP

📍 **UBICACIÓN:**
Centro Comercial El Diamante 2, San Nicolás, Cali

📞 **CONTACTO DIRECTO:**
WhatsApp: +57 304 274 8687

🎨 Perfecta para ciudad y carretera
⛽ Excelente consumo de combustible
🔧 Mantenimiento reciente realizado

¡No te pierdas esta oportunidad! 😉`,
                price: 6500000,
                category: 'PHYSICAL',
                stock: 1,
                status: 'AVAILABLE',
                tags: JSON.stringify([
                    'moto',
                    'bajaj',
                    'pulsar',
                    'ns160',
                    'fi1',
                    '160cc',
                    'inyeccion',
                    '2020',
                    'deportiva',
                    'negociable',
                    'papeles al dia',
                    'traspaso',
                    'cali',
                    'san nicolas',
                    'precio: $6,500,000',
                    'rebaja: $6,300,000',
                    'final: $6,000,000',
                    '+57 304 274 8687',
                    'https://wa.me/573042748687'
                ]),
                images: JSON.stringify([
                    'https://example.com/moto-pulsar-1.jpg', // Reemplazar con imágenes reales
                    'https://example.com/moto-pulsar-2.jpg',
                    'https://example.com/moto-pulsar-3.jpg'
                ])
            }
        })

        console.log(`✅ Moto agregada: ${moto.name}`)
        console.log(`   ID: ${moto.id}`)
        console.log(`   Precio: $${moto.price.toLocaleString()} COP`)
        console.log(`   Categoría: ${moto.category}`)

        console.log('\n🎉 ¡Motos agregadas exitosamente!')
        console.log('\n📝 NOTA: Actualiza las URLs de las imágenes con fotos reales de la moto')
        console.log('📞 El bot ahora puede responder preguntas sobre la moto')

    } catch (error) {
        console.error('❌ Error agregando motos:', error)
    } finally {
        await prisma.$disconnect()
    }
}

agregarMotos()
