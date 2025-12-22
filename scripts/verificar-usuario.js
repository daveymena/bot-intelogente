const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany()
  console.log('Usuarios encontrados:', users.length)
  users.forEach(u => {
    console.log('ID:', u.id)
    console.log('Email:', u.email)
    console.log('---')
  })
}

main().finally(() => prisma.$disconnect())
