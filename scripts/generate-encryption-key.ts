/**
 * 🔑 Generador de Clave de Encriptación
 * 
 * Genera una clave segura de 256 bits para encriptar datos sensibles
 * 
 * Uso:
 *   npx tsx scripts/generate-encryption-key.ts
 */

import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}

function updateEnvFile(key: string) {
  const envPath = path.join(process.cwd(), '.env')
  
  try {
    let envContent = ''
    
    // Leer .env existente si existe
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8')
      
      // Verificar si ya existe ENCRYPTION_KEY
      if (envContent.includes('ENCRYPTION_KEY=')) {
        console.log('⚠️  ENCRYPTION_KEY ya existe en .env')
        console.log('   Si la cambias, NO podrás desencriptar datos existentes')
        console.log('   ¿Deseas continuar? (Ctrl+C para cancelar)')
        
        // En producción, no sobrescribir automáticamente
        if (process.env.NODE_ENV === 'production') {
          console.log('❌ No se puede sobrescribir en producción')
          return
        }
        
        // Reemplazar la clave existente
        envContent = envContent.replace(
          /ENCRYPTION_KEY=.*/,
          `ENCRYPTION_KEY=${key}`
        )
      } else {
        // Agregar al final
        envContent += `\n# Clave de encriptación para datos sensibles (NO COMPARTIR)\nENCRYPTION_KEY=${key}\n`
      }
    } else {
      // Crear nuevo .env
      envContent = `# Clave de encriptación para datos sensibles (NO COMPARTIR)\nENCRYPTION_KEY=${key}\n`
    }
    
    // Guardar
    fs.writeFileSync(envPath, envContent, 'utf-8')
    console.log('✅ ENCRYPTION_KEY guardada en .env')
    
  } catch (error) {
    console.error('❌ Error actualizando .env:', error)
  }
}

function main() {
  console.log('🔐 Generador de Clave de Encriptación\n')
  
  const key = generateEncryptionKey()
  
  console.log('Clave generada:')
  console.log('─'.repeat(70))
  console.log(key)
  console.log('─'.repeat(70))
  console.log('')
  
  console.log('⚠️  IMPORTANTE:')
  console.log('   1. Guarda esta clave en un lugar seguro')
  console.log('   2. NO la compartas en Git')
  console.log('   3. Si la pierdes, NO podrás desencriptar datos existentes')
  console.log('   4. Usa la misma clave en todos los entornos (dev, prod)')
  console.log('')
  
  // Actualizar .env automáticamente
  updateEnvFile(key)
  
  console.log('\n📝 Próximos pasos:')
  console.log('   1. Verifica que .env tenga ENCRYPTION_KEY')
  console.log('   2. Agrega ENCRYPTION_KEY a .env.example (sin el valor real)')
  console.log('   3. Configura la misma clave en producción (Easypanel)')
  console.log('   4. Reinicia el servidor para aplicar cambios')
  console.log('')
  console.log('💡 Para usar en producción:')
  console.log('   - Easypanel: Agregar variable de entorno ENCRYPTION_KEY')
  console.log('   - Vercel: Settings > Environment Variables')
  console.log('   - Railway: Variables > ENCRYPTION_KEY')
  console.log('')
}

main()
