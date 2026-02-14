import { BaileysStableService } from './baileys-stable-service'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const userId = 'cmlhe8bup0000kmxg7en0g4ow'
  
  console.log(`Reconectando forzosamente a ${userId}...`)
  
  await BaileysStableService.disconnect(userId)
  console.log('Desconexión completada.')
  
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const result = await BaileysStableService.initializeConnection(userId)
  console.log('Resultado de inicialización:', result)
}

main().catch(console.error).finally(() => prisma.$disconnect())
