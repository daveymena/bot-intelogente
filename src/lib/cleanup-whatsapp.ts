import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Limpiando conexiones duplicadas...')
  
  // 1. Ver qué conexiones hay
  const connections = await prisma.whatsAppConnection.findMany()
  console.log(`Encontradas ${connections.length} conexiones.`)
  
  // 2. Eliminar todas las conexiones para empezar de cero o dejar solo una limpia
  // Para este caso, lo más seguro es resetear la tabla si hay conflictos
  const deleted = await prisma.whatsAppConnection.deleteMany({})
  console.log(`Eliminadas ${deleted.count} conexiones conflictivas.`)
  
  console.log('✅ Base de datos de WhatsApp limpia. Por favor reinicia y escanea de nuevo.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
