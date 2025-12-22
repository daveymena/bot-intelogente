/**
 * Migración de Productos a PostgreSQL
 * Migra todos los productos de SQLite a PostgreSQL
 */

import { PrismaClient } from '@prisma/client';

// Cliente para SQLite (origen)
const sqliteClient = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

// Cliente para PostgreSQL (destino)
const postgresClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:6715320D@localhost:5432/davey?sslmode=disable'
    }
  }
});

interface MigrationStats {
  users: number;
  products: number;
  conversations: number;
  messages: number;
  settings: number;
  errors: string[];
}

async function migrateData(): Promise<MigrationStats> {
  const stats: MigrationStats = {
    users: 0,
    products: 0,
    conversations: 0,
    messages: 0,
    settings: 0,
    errors: []
  };

  console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║              MIGRACIÓN DE DATOS: SQLite → PostgreSQL                       ║
╚════════════════════════════════════════════════════════════════════════════╝
  `);

  try {
    // 1. Migrar Usuarios
    console.log(`\n[1/5] 👥 Migrando usuarios...`);
    try {
      const users = await sqliteClient.user.findMany();
      console.log(`   Encontrados: ${users.length} usuarios`);
      
      for (const user of users) {
        try {
          await postgresClient.user.upsert({
            where: { id: user.id },
            update: user,
            create: user
          });
          stats.users++;
        } catch (error: any) {
          stats.errors.push(`Usuario ${user.email}: ${error.message}`);
        }
      }
      console.log(`   ✅ Migrados: ${stats.users}/${users.length}`);
    } catch (error: any) {
      console.log(`   ⚠️  No se encontraron usuarios en SQLite`);
    }

    // 2. Migrar Productos
    console.log(`\n[2/5] 📦 Migrando productos...`);
    try {
      const products = await sqliteClient.product.findMany();
      console.log(`   Encontrados: ${products.length} productos`);
      
      for (const product of products) {
        try {
          await postgresClient.product.upsert({
            where: { id: product.id },
            update: product,
            create: product
          });

          stats.products++;
        } catch (error: any) {
          stats.errors.push(`Producto ${product.name}: ${error.message}`);
        }
      }
      console.log(`   ✅ Migrados: ${stats.products}/${products.length}`);
    } catch (error: any) {
      console.log(`   ⚠️  Error al migrar productos: ${error.message}`);
    }

    // 3. Migrar Conversaciones
    console.log(`\n[3/5] 💬 Migrando conversaciones...`);
    try {
      const conversations = await sqliteClient.conversation.findMany();
      console.log(`   Encontradas: ${conversations.length} conversaciones`);
      
      for (const conversation of conversations) {
        try {
          await postgresClient.conversation.upsert({
            where: { id: conversation.id },
            update: conversation,
            create: conversation
          });
          stats.conversations++;
        } catch (error: any) {
          stats.errors.push(`Conversación ${conversation.id}: ${error.message}`);
        }
      }
      console.log(`   ✅ Migradas: ${stats.conversations}/${conversations.length}`);
    } catch (error: any) {
      console.log(`   ⚠️  No se encontraron conversaciones en SQLite`);
    }

    // 4. Migrar Mensajes
    console.log(`\n[4/5] 📨 Migrando mensajes...`);
    try {
      const messages = await sqliteClient.message.findMany();
      console.log(`   Encontrados: ${messages.length} mensajes`);
      
      for (const message of messages) {
        try {
          await postgresClient.message.upsert({
            where: { id: message.id },
            update: message,
            create: message
          });
          stats.messages++;
        } catch (error: any) {
          stats.errors.push(`Mensaje ${message.id}: ${error.message}`);
        }
      }
      console.log(`   ✅ Migrados: ${stats.messages}/${messages.length}`);
    } catch (error: any) {
      console.log(`   ⚠️  No se encontraron mensajes en SQLite`);
    }

    // 5. Migrar Configuraciones
    console.log(`\n[5/5] ⚙️  Migrando configuraciones...`);
    try {
      const settings = await sqliteClient.botSettings.findMany();
      console.log(`   Encontradas: ${settings.length} configuraciones`);
      
      for (const setting of settings) {
        try {
          await postgresClient.botSettings.upsert({
            where: { id: setting.id },
            update: setting,
            create: setting
          });
          stats.settings++;
        } catch (error: any) {
          stats.errors.push(`Configuración ${setting.id}: ${error.message}`);
        }
      }
      console.log(`   ✅ Migradas: ${stats.settings}/${settings.length}`);
    } catch (error: any) {
      console.log(`   ⚠️  No se encontraron configuraciones en SQLite`);
    }

  } catch (error: any) {
    console.error(`\n❌ Error general en la migración:`, error);
    stats.errors.push(`Error general: ${error.message}`);
  } finally {
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }

  return stats;
}

async function verifyMigration() {
  console.log(`\n\n${'='.repeat(80)}`);
  console.log(`🔍 VERIFICANDO MIGRACIÓN EN POSTGRESQL`);
  console.log(`${'='.repeat(80)}\n`);

  try {
    const counts = {
      users: await postgresClient.user.count(),
      products: await postgresClient.product.count(),
      conversations: await postgresClient.conversation.count(),
      messages: await postgresClient.message.count(),
      settings: await postgresClient.botSettings.count()
    };

    console.log(`📊 Registros en PostgreSQL:`);
    console.log(`   - Usuarios: ${counts.users}`);
    console.log(`   - Productos: ${counts.products}`);
    console.log(`   - Conversaciones: ${counts.conversations}`);
    console.log(`   - Mensajes: ${counts.messages}`);
    console.log(`   - Configuraciones: ${counts.settings}`);

    // Mostrar algunos productos de ejemplo
    if (counts.products > 0) {
      console.log(`\n📦 Productos migrados (primeros 5):`);
      const sampleProducts = await postgresClient.product.findMany({
        take: 5,
        select: {
          name: true,
          price: true,
          category: true,
          stock: true
        }
      });

      sampleProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name}`);
        console.log(`      Precio: $${product.price.toLocaleString()}`);
        console.log(`      Categoría: ${product.category}`);
        console.log(`      Stock: ${product.stock}`);
      });
    }

  } catch (error: any) {
    console.error(`\n❌ Error al verificar migración:`, error.message);
  } finally {
    await postgresClient.$disconnect();
  }
}

async function main() {
  console.log(`\n⏰ Inicio: ${new Date().toLocaleString()}\n`);

  const stats = await migrateData();

  console.log(`\n\n${'='.repeat(80)}`);
  console.log(`📊 RESUMEN DE MIGRACIÓN`);
  console.log(`${'='.repeat(80)}\n`);

  console.log(`✅ Registros migrados exitosamente:`);
  console.log(`   - Usuarios: ${stats.users}`);
  console.log(`   - Productos: ${stats.products}`);
  console.log(`   - Conversaciones: ${stats.conversations}`);
  console.log(`   - Mensajes: ${stats.messages}`);
  console.log(`   - Configuraciones: ${stats.settings}`);
  console.log(`   - Total: ${stats.users + stats.products + stats.conversations + stats.messages + stats.settings}`);

  if (stats.errors.length > 0) {
    console.log(`\n⚠️  Errores encontrados (${stats.errors.length}):`);
    stats.errors.slice(0, 10).forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
    if (stats.errors.length > 10) {
      console.log(`   ... y ${stats.errors.length - 10} errores más`);
    }
  }

  // Verificar la migración
  await verifyMigration();

  console.log(`\n⏰ Fin: ${new Date().toLocaleString()}`);
  console.log(`\n✅ MIGRACIÓN COMPLETADA\n`);
}

main().catch(console.error);
