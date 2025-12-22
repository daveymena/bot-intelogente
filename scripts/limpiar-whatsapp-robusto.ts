/**
 * Script para limpieza robusta de WhatsApp
 * Ejecutar en Easypanel cuando el QR no se limpia correctamente
 */

import { db } from '../src/lib/db'
import fs from 'fs'
import path from 'path'

async function limpiarWhatsAppRobusto() {
  console.log('═'.repeat(70))
  console.log('🧹 LIMPIEZA ROBUSTA DE WHATSAPP')
  console.log('═'.repeat(70))
  console.log('')

  const results = {
    filesDeleted: 0,
    directoriesDeleted: 0,
    dbRecordsDeleted: 0,
    errors: [] as string[]
  }

  // PASO 1: Limpiar archivos de sesión
  console.log('📋 PASO 1: Limpiando archivos de sesión...')
  try {
    const authSessionsDir = path.join(process.cwd(), 'auth_sessions')
    
    if (fs.existsSync(authSessionsDir)) {
      const userDirs = fs.readdirSync(authSessionsDir)
      
      for (const userDir of userDirs) {
        const userPath = path.join(authSessionsDir, userDir)
        const stat = fs.statSync(userPath)
        
        if (stat.isDirectory()) {
          try {
            // Eliminar todos los archivos dentro
            const files = fs.readdirSync(userPath)
            
            for (const file of files) {
              const filePath = path.join(userPath, file)
              const fileStat = fs.statSync(filePath)
              
              if (fileStat.isDirectory()) {
                fs.rmSync(filePath, { recursive: true, force: true })
                results.directoriesDeleted++
              } else {
                fs.unlinkSync(filePath)
                results.filesDeleted++
              }
            }
            
            // Eliminar el directorio del usuario
            fs.rmdirSync(userPath)
            results.directoriesDeleted++
            
            console.log(`   ✅ Limpiado: ${userDir} (${files.length} archivos)`)
          } catch (error) {
            const errorMsg = `Error limpiando ${userDir}: ${error instanceof Error ? error.message : 'Unknown'}`
            console.error(`   ❌ ${errorMsg}`)
            results.errors.push(errorMsg)
          }
        }
      }
      
      console.log(`   ✅ Total: ${results.filesDeleted} archivos, ${results.directoriesDeleted} directorios eliminados`)
    } else {
      console.log(`   ℹ️  Directorio auth_sessions no existe`)
    }
  } catch (error) {
    const errorMsg = `Error en limpieza de archivos: ${error instanceof Error ? error.message : 'Unknown'}`
    console.error(`   ❌ ${errorMsg}`)
    results.errors.push(errorMsg)
  }
  console.log('')

  // PASO 2: Limpiar base de datos
  console.log('📋 PASO 2: Limpiando base de datos...')
  try {
    // Eliminar TODAS las conexiones de WhatsApp
    const deleted = await db.whatsAppConnection.deleteMany({})
    results.dbRecordsDeleted = deleted.count
    
    console.log(`   ✅ ${deleted.count} conexión(es) eliminada(s) de DB`)
  } catch (error) {
    const errorMsg = `Error limpiando DB: ${error instanceof Error ? error.message : 'Unknown'}`
    console.error(`   ❌ ${errorMsg}`)
    results.errors.push(errorMsg)
  }
  console.log('')

  // RESUMEN
  console.log('═'.repeat(70))
  console.log('📊 RESUMEN DE LIMPIEZA')
  console.log('═'.repeat(70))
  console.log(`✅ Archivos eliminados: ${results.filesDeleted}`)
  console.log(`✅ Directorios eliminados: ${results.directoriesDeleted}`)
  console.log(`✅ Registros de DB eliminados: ${results.dbRecordsDeleted}`)
  
  if (results.errors.length > 0) {
    console.log(`⚠️  Errores: ${results.errors.length}`)
    results.errors.forEach(err => console.log(`   - ${err}`))
  } else {
    console.log(`✅ Sin errores`)
  }
  console.log('═'.repeat(70))
  console.log('')

  if (results.errors.length === 0) {
    console.log('✅ LIMPIEZA COMPLETA EXITOSA')
    console.log('   Ahora puedes conectar WhatsApp desde el dashboard')
  } else {
    console.log('⚠️  LIMPIEZA PARCIAL')
    console.log('   Algunos archivos pueden no haberse eliminado')
    console.log('   Revisa los errores arriba')
  }
  console.log('')

  await db.$disconnect()
}

limpiarWhatsAppRobusto().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})
