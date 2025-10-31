/**
 * 🧪 TEST: Verificar que el bot mantiene contexto de producto
 * 
 * Simula una conversación donde:
 * 1. Cliente pregunta por "curso de piano"
 * 2. Cliente dice "ver más información" (sin mencionar piano)
 * 3. Bot debe recordar que hablaban del piano
 */

import { ProductIntelligenceService } from '../src/lib/product-intelligence-service'
import { ConversationContextService } from '../src/lib/conversation-context-service'
import { db } from '../src/lib/db'

async function testContextoProducto() {
    console.log('🧪 TEST: Contexto de Producto\n')

    const userId = 'cmhdldjwp0000kmn8m5208jmi'
    const customerPhone = '181656229036263@lid'
    const conversationKey = `${userId}:${customerPhone}`

    try {
        // PASO 1: Cliente pregunta por piano
        console.log('📝 PASO 1: Cliente pregunta "Tienes disponible el curso de piano?"')
        const mensaje1 = "Tienes disponible el curso de piano?"
        
        const producto1 = await ProductIntelligenceService.findProduct(mensaje1, userId)
        
        if (producto1) {
            console.log(`✅ Producto encontrado: ${producto1.name}`)
            ConversationContextService.setProductContext(conversationKey, producto1.id, producto1.name)
            console.log(`💾 Guardado en memoria\n`)
        } else {
            console.log(`❌ No se encontró producto\n`)
        }

        // PASO 2: Cliente dice "ver más información" (sin mencionar piano)
        console.log('📝 PASO 2: Cliente dice "Si deseo ver más información"')
        const mensaje2 = "Si deseo ver más información"
        
        const producto2 = await ProductIntelligenceService.findProduct(mensaje2, userId)
        
        if (producto2) {
            console.log(`❌ ERROR: Encontró producto nuevo: ${producto2.name}`)
            console.log(`   Debería usar el contexto de memoria en vez de buscar nuevo producto\n`)
        } else {
            console.log(`✅ No encontró producto nuevo (correcto)`)
            
            // Verificar memoria
            const context = ConversationContextService.getProductContext(conversationKey)
            if (context) {
                console.log(`✅ Memoria activa: ${context.lastProductName}`)
                
                // Obtener producto de memoria
                const productoMemoria = await db.product.findUnique({
                    where: { id: context.lastProductId }
                })
                
                if (productoMemoria) {
                    console.log(`✅ Producto recuperado de memoria: ${productoMemoria.name}`)
                    console.log(`\n🎉 TEST EXITOSO: El bot mantiene el contexto correctamente`)
                }
            } else {
                console.log(`❌ ERROR: No hay contexto en memoria`)
            }
        }

        // PASO 3: Verificar que palabras clave se extraen correctamente
        console.log('\n📝 PASO 3: Verificar extracción de palabras clave')
        
        const testCases = [
            { mensaje: "Tienes disponible el curso de piano?", esperado: ['curso', 'piano'] },
            { mensaje: "Si deseo ver más información", esperado: [] },
            { mensaje: "Quiero comprar la MacBook", esperado: ['comprar', 'macbook'] },
            { mensaje: "Ver fotos", esperado: [] },
            { mensaje: "Cuánto cuesta la moto Pulsar?", esperado: ['moto', 'pulsar'] }
        ]

        for (const test of testCases) {
            // Acceder al método privado usando reflexión
            const keywords = (ProductIntelligenceService as any).extractKeywords(test.mensaje)
            const match = JSON.stringify(keywords.sort()) === JSON.stringify(test.esperado.sort())
            
            console.log(`${match ? '✅' : '❌'} "${test.mensaje}"`)
            console.log(`   Esperado: [${test.esperado.join(', ')}]`)
            console.log(`   Obtenido: [${keywords.join(', ')}]`)
        }

        console.log('\n✅ Test completado')

    } catch (error) {
        console.error('❌ Error en test:', error)
    } finally {
        await db.$disconnect()
    }
}

testContextoProducto()
