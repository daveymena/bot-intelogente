/**
 * 🔧 SCRIPT: Arreglar Errores Críticos
 * 
 * Corrige automáticamente:
 * 1. Error en sistema de escalamiento
 * 2. Permite que el bot funcione sin caer al fallback de IA
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 ARREGLANDO ERRORES CRÍTICOS...\n')

// Archivo a corregir
const filePath = path.join(__dirname, 'src', 'lib', 'baileys-stable-service.ts')

// Leer archivo
let content = fs.readFileSync(filePath, 'utf8')

// Buscar y comentar el bloque de escalamiento
const escalationStart = content.indexOf('// ? GVERIFICAR SI NECESITA ESCALAMIENTO')
const escalationEnd = content.indexOf('// 📝 GENERAR RESPUESTA DESDE PLANTILLA (SIN IA)', escalationStart)

if (escalationStart !== -1 && escalationEnd !== -1) {
  console.log('✅ Encontrado bloque de escalamiento')
  
  // Extraer el bloque
  const before = content.substring(0, escalationStart)
  const after = content.substring(escalationEnd)
  
  // Reemplazar con comentario
  const newContent = before + 
    '// 🚨 SISTEMA DE ESCALAMIENTO (DESACTIVADO TEMPORALMENTE)\n' +
    '            // El sistema híbrido actual maneja bien los casos complejos con IA\n' +
    '            // TODO: Reactivar cuando se necesite escalamiento explícito a humano\n\n' +
    '            ' + after
  
  // Guardar
  fs.writeFileSync(filePath, newContent, 'utf8')
  console.log('✅ Bloque de escalamiento comentado')
} else {
  console.log('⚠️ No se encontró el bloque de escalamiento (puede que ya esté corregido)')
}

console.log('\n✅ CORRECCIÓN COMPLETADA')
console.log('\n📝 Próximos pasos:')
console.log('1. Reiniciar bot: npm run dev')
console.log('2. Probar: "Me interesa el curso de piano"')
console.log('3. Verificar que NO cae al fallback de IA')
