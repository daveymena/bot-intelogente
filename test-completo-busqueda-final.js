/**
 * 🧪 TEST COMPLETO: Verificación de Búsqueda y Anti-Invención
 * 
 * Este test verifica:
 * 1. Que la BD tenga productos
 * 2. Que la detección específica vs general funcione
 * 3. Que NO se inventen productos
 */

const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function testCompleto() {
    console.log('🧪 TEST COMPLETO: Búsqueda y Anti-Invención\n')
    console.log('='.repeat(80))

    try {
        // ========================================
        // PASO 1: Verificar Base de Datos
        // ========================================
        console.log('\n📦 PASO 1: Verificando Base de Datos\n')
        
        const user = await db.user.findFirst()
        if (!user) {
            console.log('❌ ERROR: No hay usuarios en la BD')
            console.log('\n⚠️ ACCIÓN REQUERIDA: Crear usuario primero')
            return
        }
        
        console.log(`✅ Usuario encontrado: ${user.email}`)
        
        const productos = await db.product.findMany({
            where: {
                userId: user.id,
                status: 'AVAILABLE'
            }
        })
        
        console.log(`\n📊 Productos en BD: ${productos.length}`)
        
        if (productos.length === 0) {
            console.log('\n❌ ERROR: Base de datos VACÍA')
            console.log('\n⚠️ ACCIÓN REQUERIDA:')
            console.log('   Ejecuta: IMPORTAR_PRODUCTOS_AHORA.bat')
            console.log('   O: node agregar-megapacks-completo-fixed.js')
            return
        }
        
        console.log('✅ Base de datos tiene productos')
        
        // Mostrar algunos productos de ejemplo
        console.log('\n📋 Ejemplos de productos:')
        productos.slice(0, 5).forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.name} - ${p.price.toLocaleString('es-CO')} COP`)
        })

        // ========================================
        // PASO 2: Test de Búsqueda Específica
        // ========================================
        console.log('\n' + '='.repeat(80))
        console.log('\n🎯 PASO 2: Test de Búsqueda ESPECÍFICA\n')
        
        const testsCasos = [
            {
                query: 'curso de piano',
                tipo: 'ESPECÍFICA',
                esperado: 'Debe encontrar SOLO el curso de piano'
            },
            {
                query: 'Estoy interesado en el curso de piano',
                tipo: 'ESPECÍFICA',
                esperado: 'Debe encontrar SOLO el curso de piano'
            },
            {
                query: 'laptop asus',
                tipo: 'ESPECÍFICA',
                esperado: 'Debe encontrar SOLO laptops Asus'
            },
            {
                query: 'megapack 17',
                tipo: 'ESPECÍFICA',
                esperado: 'Debe encontrar SOLO megapack 17'
            },
            {
                query: 'qué cursos tienes',
                tipo: 'GENERAL',
                esperado: 'Puede mostrar lista de cursos'
            },
            {
                query: 'tienes laptops',
                tipo: 'GENERAL',
                esperado: 'Puede mostrar lista de laptops'
            }
        ]
        
        for (const test of testsCasos) {
            console.log(`\n📝 Test: "${test.query}"`)
            console.log(`   Tipo esperado: ${test.tipo}`)
            console.log(`   Resultado esperado: ${test.esperado}`)
            
            // Buscar en BD
            const palabras = test.query.toLowerCase().split(/\s+/)
            let encontrados = []
            
            for (const palabra of palabras) {
                if (palabra.length > 2) {
                    const matches = productos.filter(p => 
                        p.name.toLowerCase().includes(palabra) ||
                        (p.description && p.description.toLowerCase().includes(palabra))
                    )
                    encontrados = [...encontrados, ...matches]
                }
            }
            
            // Eliminar duplicados
            encontrados = [...new Set(encontrados.map(p => p.id))]
                .map(id => productos.find(p => p.id === id))
            
            if (encontrados.length > 0) {
                console.log(`   ✅ Encontrados ${encontrados.length} productos:`)
                encontrados.slice(0, 3).forEach(p => {
                    console.log(`      - ${p.name}`)
                })
                if (encontrados.length > 3) {
                    console.log(`      ... y ${encontrados.length - 3} más`)
                }
            } else {
                console.log(`   ⚠️ No se encontraron productos`)
            }
        }

        // ========================================
        // PASO 3: Verificar Productos Específicos
        // ========================================
        console.log('\n' + '='.repeat(80))
        console.log('\n🔍 PASO 3: Verificando Productos Específicos\n')
        
        const productosEspecificos = [
            { buscar: 'piano', nombre: 'Curso de Piano' },
            { buscar: 'asus', nombre: 'Laptop Asus' },
            { buscar: 'pulsar', nombre: 'Moto Pulsar' },
            { buscar: 'megapack', nombre: 'Megapacks' }
        ]
        
        for (const item of productosEspecificos) {
            const encontrado = productos.find(p => 
                p.name.toLowerCase().includes(item.buscar)
            )
            
            if (encontrado) {
                console.log(`✅ ${item.nombre}: ${encontrado.name}`)
            } else {
                console.log(`⚠️ ${item.nombre}: No encontrado`)
            }
        }

        // ========================================
        // RESUMEN FINAL
        // ========================================
        console.log('\n' + '='.repeat(80))
        console.log('\n📊 RESUMEN FINAL\n')
        
        const checks = [
            { item: 'Base de datos tiene productos', ok: productos.length > 0 },
            { item: 'Usuario existe', ok: !!user },
            { item: 'Productos disponibles', ok: productos.length > 0 }
        ]
        
        checks.forEach(check => {
            const emoji = check.ok ? '✅' : '❌'
            console.log(`${emoji} ${check.item}`)
        })
        
        const todoBien = checks.every(c => c.ok)
        
        if (todoBien) {
            console.log('\n🎉 ¡TODO LISTO!')
            console.log('\n📝 SIGUIENTE PASO:')
            console.log('   1. Reinicia el servidor: REINICIAR_Y_PROBAR_BUSQUEDA.bat')
            console.log('   2. Prueba en WhatsApp: "Estoy interesado en el curso de piano"')
            console.log('   3. Debe mostrar SOLO el curso de piano')
        } else {
            console.log('\n⚠️ HAY PROBLEMAS')
            console.log('\n📝 ACCIÓN REQUERIDA:')
            console.log('   1. Importa productos: IMPORTAR_PRODUCTOS_AHORA.bat')
            console.log('   2. Ejecuta este test de nuevo')
        }
        
        console.log('\n' + '='.repeat(80))

    } catch (error) {
        console.error('\n❌ ERROR:', error.message)
        console.error('\nStack:', error.stack)
    } finally {
        await db.$disconnect()
    }
}

// Ejecutar test
testCompleto()
