/**
 * Crear tabla de conocimiento en la base de datos
 */

import { db } from '../src/lib/db';

async function crearTablaConocimiento() {
  console.log('🔧 Creando tabla de conocimiento...\n');

  try {
    // Verificar si la tabla ya existe
    const tableExists = await db.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'conversation_knowledge'
      );
    `;

    console.log('Verificando tabla:', tableExists);

    console.log('\n✅ Para crear la tabla, ejecuta:');
    console.log('   npx prisma db push\n');
    console.log('O si prefieres usar migraciones:');
    console.log('   npx prisma migrate dev --name add-knowledge-base\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

crearTablaConocimiento();
