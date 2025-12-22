import { db } from '../src/lib/db'

/**
 * Configurar TODOS los links de pago REALES
 * Basado en la información proporcionada
 */

async function configurarLinksRealesCompletos() {
    try {
        console.log('💳 Configurando links de pago REALES completos...\n')

        // LINKS REALES CONFIRMADOS
        const LINKS = {
            piano: {
                hotmart: 'https://pay.hotmart.com/I95497720H?checkoutMode=2&bid=1760738599205',
                info: 'https://landein-page-pian2.vercel.app/'
            },
            megapack_completo: {
                paypal: 'https://www.paypal.com/invoice/p/#INV2-U2K8-6UU6-HMTD-NETG',
                mercadopago: 'https://mpago.li/32cJgK3'
            },
            megapack_individual: {
                payco: 'https://payco.link/3798e2c6-3888-4cdf-bfd5-5d1761f5a4cf',
                nequi: '3136174267'
            }
        }

        console.log('📋 Links configurados:')
        console.log('   🎹 Piano: Hotmart')
        console.log('   📦 Megapack Completo: PayPal + MercadoPago')
        console.log('   📦 Megapack Individual: Payco + Nequi\n')

        // 1. CURSO DE PIANO
        console.log('🎹 Configurando Curso de Piano...')
        const piano = await db.product.findFirst({
            where: {
                name: {
                    contains: 'Piano'
                }
            }
        })

        if (piano) {
            const tags = piano.tags ? JSON.parse(piano.tags) : []
            const cleanTags = tags.filter((tag: string) =>
                !tag.startsWith('http') &&
                !tag.startsWith('hotmart:')
            )

            const newTags = [
                ...cleanTags,
                `hotmart:${LINKS.piano.hotmart}`,
                LINKS.piano.info
            ]

            await db.product.update({
                where: { id: piano.id },
                data: { tags: JSON.stringify(newTags) }
            })

            console.log(`   ✅ ${piano.name}`)
            console.log(`   💳 Hotmart: ${LINKS.piano.hotmart}`)
            console.log(`   ℹ️  Info: ${LINKS.piano.info}\n`)
        }

        // 2. MEGAPACKS INDIVIDUALES ($20.000)
        console.log('📦 Configurando Megapacks Individuales ($20.000)...')
        const megapacks = await db.product.findMany({
            where: {
                AND: [
                    { name: { contains: 'Mega Pack' } },
                    { price: 20000 }
                ]
            }
        })

        for (const megapack of megapacks) {
            const tags = megapack.tags ? JSON.parse(megapack.tags) : []
            const cleanTags = tags.filter((tag: string) =>
                !tag.startsWith('nequi:') &&
                !tag.startsWith('payco:') &&
                !tag.startsWith('mercadopago:') &&
                !tag.startsWith('paypal:')
            )

            const newTags = [
                ...cleanTags,
                `nequi:${LINKS.megapack_individual.nequi}`,
                `payco:${LINKS.megapack_individual.payco}`,
                `mercadopago:${LINKS.megapack_completo.mercadopago}`,
                `paypal:${LINKS.megapack_completo.paypal}`
            ]

            await db.product.update({
                where: { id: megapack.id },
                data: { tags: JSON.stringify(newTags) }
            })
        }

        console.log(`   ✅ ${megapacks.length} megapacks actualizados`)
        console.log(`   💳 Nequi: ${LINKS.megapack_individual.nequi}`)
        console.log(`   💳 Payco: ${LINKS.megapack_individual.payco}`)
        console.log(`   💳 MercadoPago: ${LINKS.megapack_completo.mercadopago}`)
        console.log(`   💳 PayPal: ${LINKS.megapack_completo.paypal}\n`)

        // 3. VERIFICAR PRODUCTOS FÍSICOS
        console.log('💻 Verificando productos físicos...')
        const productosFisicos = await db.product.findMany({
            where: {
                AND: [
                    { name: { not: { contains: 'Mega Pack' } } },
                    { name: { not: { contains: 'Piano' } } }
                ]
            }
        })

        let conContacto = 0
        for (const producto of productosFisicos) {
            const tags = producto.tags ? JSON.parse(producto.tags) : []
            const tieneContacto = tags.some((tag: string) => tag.startsWith('contacto:'))

            if (!tieneContacto) {
                tags.push('contacto:+57 304 274 8687')
                await db.product.update({
                    where: { id: producto.id },
                    data: { tags: JSON.stringify(tags) }
                })
            }
            conContacto++
        }

        console.log(`   ✅ ${conContacto} productos con contacto directo`)
        console.log(`   📞 WhatsApp: +57 304 274 8687\n`)

        console.log('✅ CONFIGURACIÓN COMPLETADA\n')
        console.log('📊 RESUMEN:')
        console.log('   🎹 Curso de Piano: Hotmart')
        console.log(`   📦 ${megapacks.length} Megapacks: Nequi + Payco + MercadoPago + PayPal`)
        console.log(`   💻 ${conContacto} Productos físicos: Contacto directo`)
        console.log('\n🎉 Todos los productos tienen links de pago REALES')

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await db.$disconnect()
    }
}

configurarLinksRealesCompletos()
