import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Agregando campo aiEnhanced a la base de datos...\n');

  try {
    // Intentar agregar el campo usando una migración manual
    // Como estamos en SQLite, necesitamos hacerlo con SQL directo
    await prisma.$executeRaw`
      ALTER TABLE products ADD COLUMN aiEnhanced INTEGER DEFAULT 0
    `;
    
    console.log('✅ Campo aiEnhanced agregado exitosamente\n');
  } catch (error: any) {
    if (error.message.includes('duplicate column name')) {
      console.log('ℹ️  El campo aiEnhanced ya existe\n');
    } else {
      console.error('❌ Error:', error.message);
    }
  }

  // Verificar cuántos productos ya fueron mejorados
  const mejorados = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM products WHERE aiEnhanced = 1
  ` as any[];

  const total = await prisma.product.count();

  console.log('📊 Estado actual:');
  console.log(`   Total productos: ${total}`);
  console.log(`   Ya mejorados: ${mejorados[0]?.count || 0}`);
  console.log(`   Pendientes: ${total - (mejorados[0]?.count || 0)}\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
