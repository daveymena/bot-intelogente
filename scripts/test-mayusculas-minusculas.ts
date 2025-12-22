import { ProductIntelligenceService } from '../src/lib/product-intelligence-service'
import { db } from '../src/lib/db'

async function testMayusculasMinusculas() {
  console.log('🧪 Probando búsqueda con mayúsculas y minúsculas...\n')
  
  const user = await db.user.findFirst()
  if (!user) {
    console.log('❌ No se encontró usuario')
    return
  }

  const tests = [
    'piano',
    'PIANO',
    'Piano',
    'PiAnO',
    'curso de piano',
    'CURSO DE PIANO',
    'Curso De Piano',
    'moto',
    'MOTO',
    'Moto',
    'laptop',
    'LAPTOP',
    'Laptop',
    'asus',
    'ASUS',
    'Asus'
  ]

  for (const test of tests) {
    const producto = await ProductIntelligenceService.findProduct(test, user.id)
    const resultado = producto ? `✅ ${producto.name}` : '❌ No encontrado'
    console.log(`"${test.padEnd(20)}" → ${resultado}`)
  }
  
  await db.$disconnect()
}

testMayusculasMinusculas()
