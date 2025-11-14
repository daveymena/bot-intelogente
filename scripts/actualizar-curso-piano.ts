/**
 * 📝 Actualizar información del Curso de Piano
 * Corrige: 76 clases (no 80), sin certificación, desde Drive
 */

import { db } from '../src/lib/db'

async function actualizarCursoPiano() {
    console.log('📝 ACTUALIZANDO INFORMACIÓN DEL CURSO DE PIANO\n')
    console.log('='.repeat(70))

    try {
        // Buscar el curso de piano
        const curso = await db.product.findFirst({
            where: {
                name: {
                    contains: 'Piano'
                }
            }
        })

        if (!curso) {
            console.log('❌ No se encontró el curso de piano')
            console.log('💡 Asegúrate de tener productos importados')
            return
        }

        console.log(`\n✅ Curso encontrado: ${curso.name}`)
        console.log(`📋 Descripción actual:\n${curso.description}\n`)

        // Nueva descripción correcta
        const nuevaDescripcion = `Curso 100% en línea con 76 clases en video descargables para aprender piano desde cero hasta nivel profesional. Acceso de por vida desde Google Drive.`

        // Actualizar
        const cursoActualizado = await db.product.update({
            where: { id: curso.id },
            data: {
                description: nuevaDescripcion
            }
        })

        console.log('─'.repeat(70))
        console.log('\n✅ CURSO ACTUALIZADO EXITOSAMENTE\n')
        console.log(`📋 Nueva descripción:\n${cursoActualizado.description}\n`)
        console.log('─'.repeat(70))

        console.log('\n📊 INFORMACIÓN CORRECTA:')
        console.log('   ✅ 76 clases (no 80)')
        console.log('   ✅ Sin certificación')
        console.log('   ✅ Sin contacto directo con profesor')
        console.log('   ✅ Acceso desde Google Drive')
        console.log('   ✅ Acceso de por vida')

        console.log('\n💡 El bot ahora dará la información correcta')

    } catch (error) {
        console.error('\n❌ Error:', error)
    }

    console.log('\n' + '='.repeat(70))
}

// Ejecutar
actualizarCursoPiano()
    .then(() => {
        console.log('\n✅ Script finalizado')
        process.exit(0)
    })
    .catch((error) => {
        console.error('\n❌ Error:', error)
        process.exit(1)
    })
