#!/usr/bin/env tsx
/**
 * Script para cambiar entre SQLite (desarrollo) y PostgreSQL (producción)
 * 
 * Uso:
 * npm run db:prod    - Cambiar a PostgreSQL para deploy
 * npm run db:dev     - Volver a SQLite para desarrollo local
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma');
const mode = process.argv[2] || 'prod';

function cambiarProvider(provider: 'sqlite' | 'postgresql') {
  try {
    let schema = readFileSync(schemaPath, 'utf-8');
    
    const oldProvider = provider === 'sqlite' ? 'postgresql' : 'sqlite';
    
    schema = schema.replace(
      `provider = "${oldProvider}"`,
      `provider = "${provider}"`
    );
    
    writeFileSync(schemaPath, schema, 'utf-8');
    
    console.log(`✅ Schema actualizado a: ${provider}`);
    
    if (provider === 'postgresql') {
      console.log('\n📋 Próximos pasos:');
      console.log('1. git add .');
      console.log('2. git commit -m "Deploy: PostgreSQL para producción"');
      console.log('3. git push');
      console.log('4. Redesplegar en Easypanel');
      console.log('5. Ejecutar: npx prisma db push');
      console.log('\n⚠️  Después del deploy, ejecuta: npm run db:dev');
    } else {
      console.log('\n✅ Listo para desarrollo local con SQLite');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (mode === 'prod') {
  cambiarProvider('postgresql');
} else if (mode === 'dev') {
  cambiarProvider('sqlite');
} else {
  console.log('Uso: npm run db:prod o npm run db:dev');
  process.exit(1);
}
