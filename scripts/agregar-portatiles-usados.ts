/**
 * 💻 AGREGAR SECCIÓN: PORTÁTILES USADOS CORPORATIVOS
 * 
 * Especificaciones:
 * - Precio: Desde $600.000 COP
 * - Procesador: Intel Core i5
 * - Disco Duro: 250GB - 500GB
 * - RAM: 8GB
 * - Sistema: Windows 10
 * - Garantía: 3 meses
 * - Marcas: Dell, HP, Lenovo
 * - Envío: Contraentrega disponible
 * - Local: Centro Comercial El Diamante 2, San Nicolás, Cali
 */

import { db } from '../src/lib/db'

async function agregarPortatilesUsados() {
    console.log('💻 Agregando sección de Portátiles Usados Corporativos...\n')

    const userId = 'cmhdldjwp0000kmn8m5208jmi'

    try {
        // Crear producto general de portátiles usados
        const portatilUsado = await db.product.create({
            data: {
                userId,
                name: 'Portátil Usado Corporativo Intel Core i5',
                description: `💼 PORTÁTILES CORPORATIVOS USADOS - EXCELENTE ESTADO

✅ Especificaciones:
• Procesador: Intel Core i5 (varias generaciones)
• Memoria RAM: 8GB
• Disco Duro: 250GB - 500GB
• Sistema Operativo: Windows 10 Original
• Marcas disponibles: Dell, HP, Lenovo

🎯 Características:
• Equipos corporativos de alta calidad
• Perfectos para trabajo, estudio y uso diario
• Probados y verificados
• Excelente relación calidad-precio

🛡️ Garantía: 3 meses

📦 Envío: Contraentrega disponible en Cali

📍 Visítanos: Centro Comercial El Diamante 2, Local 2-29, San Nicolás, Cali

💰 Precio: Desde $600.000 COP (varía según modelo y estado)`,
                price: 600000,
                category: 'PHYSICAL',
                status: 'AVAILABLE',
                stock: 10,
                images: JSON.stringify([]),
                tags: JSON.stringify([
                    'laptop usada',
                    'portatil usado',
                    'corporativo',
                    'dell',
                    'hp',
                    'lenovo',
                    'core i5',
                    'windows 10',
                    'garantia',
                    'contraentrega',
                    'contacto:+57 304 274 8687'
                ])
            }
        })

        console.log(`✅ Producto creado: ${portatilUsado.name}`)
        console.log(`   ID: ${portatilUsado.id}`)
        console.log(`   Precio: $${portatilUsado.price.toLocaleString('es-CO')} COP`)
        console.log(`   Categoría: ${portatilUsado.category}`)

        // Crear prompt específico para portátiles usados
        const promptExistente = await db.prompt.findFirst({
            where: {
                userId,
                name: 'Portátiles Usados'
            }
        })

        if (promptExistente) {
            console.log('\n⚠️ Ya existe un prompt para portátiles usados')
        } else {
            const prompt = await db.prompt.create({
                data: {
                    userId,
                    name: 'Portátiles Usados',
                    content: `Cuando un cliente pregunte por PORTÁTILES USADOS o LAPTOPS USADAS:

📋 INFORMACIÓN CLAVE:
• Precio: Desde $600.000 COP (varía según modelo)
• Procesador: Intel Core i5
• RAM: 8GB
• Disco: 250GB - 500GB
• Sistema: Windows 10 Original
• Marcas: Dell, HP, Lenovo
• Garantía: 3 meses
• Envío: Contraentrega disponible

🎯 RESPUESTA SUGERIDA:
"¡Tenemos excelentes portátiles corporativos usados! 💼

Desde $600.000 COP:
✅ Intel Core i5
✅ 8GB RAM
✅ 250-500GB Disco
✅ Windows 10 Original
✅ Marcas: Dell, HP, Lenovo
✅ Garantía 3 meses

Son equipos corporativos de alta calidad, perfectos para trabajo y estudio.

📍 Puedes visitarnos en:
Centro Comercial El Diamante 2
Local 2-29, San Nicolás, Cali

📱 WhatsApp: +57 304 274 8687
📧 deinermen25@gmail.com

Tenemos varios modelos disponibles. ¿Te gustaría conocer más detalles o agendar una visita?"

⚠️ IMPORTANTE:
- Los precios varían según modelo y estado
- Invitar a visitar el local para ver opciones
- Mencionar que son equipos probados y verificados
- Destacar la garantía de 3 meses
- Ofrecer contraentrega en Cali`,
                    isActive: true
                }
            })

            console.log(`\n✅ Prompt creado: ${prompt.name}`)
        }

        console.log('\n🎉 ¡Sección de Portátiles Usados agregada exitosamente!')
        console.log('\n📝 El bot ahora puede responder preguntas sobre:')
        console.log('   • "Tienes portátiles usados?"')
        console.log('   • "Laptops usadas disponibles?"')
        console.log('   • "Computadores de segunda?"')
        console.log('   • "Portátiles corporativos usados?"')

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await db.$disconnect()
    }
}

agregarPortatilesUsados()
