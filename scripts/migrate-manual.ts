/**
 * 🔧 SCRIPT DE MIGRACIÓN MANUAL
 * Soluciona problemas de permisos de Prisma en Windows
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createConversationPatternTable() {
  console.log('🔧 Creando tabla conversation_patterns...\n');

  try {
    // Verificar si la tabla ya existe
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'conversation_patterns'
      );
    `;

    console.log('Verificando tabla existente...');

    // Crear tabla si no existe
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "conversation_patterns" (
        "id" TEXT NOT NULL,
        "pattern" TEXT NOT NULL,
        "queryType" TEXT NOT NULL,
        "keywords" TEXT NOT NULL,
        "responseTemplate" TEXT NOT NULL,
        "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
        "usageCount" INTEGER NOT NULL DEFAULT 1,
        "successRate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "conversation_patterns_pkey" PRIMARY KEY ("id")
      );
    `;

    console.log('✅ Tabla conversation_patterns creada');

    // Crear índices
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "conversation_patterns_pattern_key" 
      ON "conversation_patterns"("pattern");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "conversation_patterns_queryType_idx" 
      ON "conversation_patterns"("queryType");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "conversation_patterns_successRate_idx" 
      ON "conversation_patterns"("successRate");
    `;

    console.log('✅ Índices creados');

    // Verificar que todo funcionó
    const count = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "conversation_patterns";
    `;

    console.log('\n✅ Migración completada exitosamente!');
    console.log(`📊 Registros en conversation_patterns: ${(count as any)[0].count}`);

  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('✅ La tabla conversation_patterns ya existe');
    } else {
      console.error('❌ Error en migración:', error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
createConversationPatternTable()
  .then(() => {
    console.log('\n🎉 ¡Sistema híbrido listo para usar!');
    console.log('\nPróximos pasos:');
    console.log('1. npm run train:exhaustive  # Entrenar el bot');
    console.log('2. npm run knowledge:stats   # Ver estadísticas');
    console.log('3. npm run dev               # Iniciar servidor\n');
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
