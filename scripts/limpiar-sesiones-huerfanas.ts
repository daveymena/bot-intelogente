/**
 * 🧹 LIMPIAR SESIONES HUÉRFANAS
 * Elimina conexiones de WhatsApp que no tienen un usuario válido
 */

import { db as prisma } from '../src/lib/db'

async function limpiarSesionesHuerfanas() {
    try {
        console.log('🧹 Limpiando sesiones huérfanas de WhatsApp...\n')

        // 1. Obtener todas las conexiones
        const conexiones = await prisma.whatsAppConnection.findMany({
            select: {
                id: true,
                userId: true,
                phoneNumber: true,
                status: true
            }
        })

        console.log(`📊 Total de conexiones encontradas: ${conexiones.length}`)

        // 2. Verificar cuáles tienen usuarios válidos
        const sesionesHuerfanas = []
        
        for (const conexion of conexiones) {
            const usuario = await prisma.user.findUnique({
                where: { id: conexion.userId }
            })

            if (!usuario) {
                sesionesHuerfanas.push(conexion)
                console.log(`❌ Sesión huérfana encontrada:`)
                console.log(`   - ID: ${conexion.id}`)
                console.log(`   - UserId: ${conexion.userId}`)
                console.log(`   - Teléfono: ${conexion.phoneNumber}`)
                console.log(`   - Estado: ${conexion.status}`)
                console.log()
            }
        }

        if (sesionesHuerfanas.length === 0) {
            console.log('✅ No se encontraron sesiones huérfanas')
            return
        }

        console.log(`\n⚠️ Se encontraron ${sesionesHuerfanas.length} sesiones huérfanas`)
        console.log('🗑️ Eliminando...\n')

        // 3. Eliminar sesiones huérfanas
        for (const sesion of sesionesHuerfanas) {
            await prisma.whatsAppConnection.delete({
                where: { id: sesion.id }
            })
            console.log(`✅ Eliminada sesión: ${sesion.userId}`)
        }

        console.log(`\n✅ ${sesionesHuerfanas.length} sesiones huérfanas eliminadas`)

        // 4. Mostrar sesiones válidas restantes
        const sesionesValidas = await prisma.whatsAppConnection.findMany({
            include: {
                user: {
                    select: {
                        email: true
                    }
                }
            }
        })

        console.log(`\n📊 Sesiones válidas restantes: ${sesionesValidas.length}`)
        
        for (const sesion of sesionesValidas) {
            console.log(`   ✅ ${sesion.user.email} - ${sesion.status}`)
        }

    } catch (error) {
        console.error('❌ Error limpiando sesiones:', error)
    }
}

limpiarSesionesHuerfanas()
