/**
 * 🧹 LIMPIAR SESIONES HUÉRFANAS - VERSIÓN SIMPLE
 * Usa consultas SQL directas para evitar problemas con Prisma
 */

import Database from 'better-sqlite3'
import path from 'path'

async function limpiarSesionesSimple() {
    try {
        console.log('🧹 Limpiando sesiones huérfanas de WhatsApp...\n')

        // Conectar a la base de datos SQLite
        const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
        const db = new Database(dbPath)

        // 1. Obtener todas las conexiones
        const conexiones = db.prepare(`
            SELECT id, userId, phoneNumber, status 
            FROM whatsapp_connections
        `).all()

        console.log(`📊 Total de conexiones encontradas: ${conexiones.length}`)

        // 2. Verificar cuáles tienen usuarios válidos
        const sesionesHuerfanas = []
        
        for (const conexion of conexiones as any[]) {
            const usuario = db.prepare(`
                SELECT id FROM users WHERE id = ?
            `).get(conexion.userId)

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
            db.close()
            return
        }

        console.log(`\n⚠️ Se encontraron ${sesionesHuerfanas.length} sesiones huérfanas`)
        console.log('🗑️ Eliminando...\n')

        // 3. Eliminar sesiones huérfanas
        const deleteStmt = db.prepare(`DELETE FROM whatsapp_connections WHERE id = ?`)
        
        for (const sesion of sesionesHuerfanas) {
            deleteStmt.run(sesion.id)
            console.log(`✅ Eliminada sesión: ${sesion.userId}`)
        }

        console.log(`\n✅ ${sesionesHuerfanas.length} sesiones huérfanas eliminadas`)

        // 4. Mostrar sesiones válidas restantes
        const sesionesValidas = db.prepare(`
            SELECT wc.*, u.email 
            FROM whatsapp_connections wc
            JOIN users u ON wc.userId = u.id
        `).all()

        console.log(`\n📊 Sesiones válidas restantes: ${sesionesValidas.length}`)
        
        for (const sesion of sesionesValidas as any[]) {
            console.log(`   ✅ ${sesion.email} - ${sesion.status}`)
        }

        db.close()

    } catch (error) {
        console.error('❌ Error limpiando sesiones:', error)
    }
}

limpiarSesionesSimple()
