import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const connections = await prisma.whatsAppConnection.findMany()
  const users = await prisma.user.count()
  console.log('USERS_COUNT:', users)
  console.log('CONNECTIONS_COUNT:', connections.length)
  console.log('CONNECTIONS_JSON:', JSON.stringify(connections, null, 2))
}
main().catch(console.error).finally(() => prisma.$disconnect())
