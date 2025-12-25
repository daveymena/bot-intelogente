import { db } from './src/lib/db';

async function diagnose() {
  console.log('🔍 Diagnosticando base de datos...');
  try {
    const user = await db.user.findFirst();
    if (!user) {
      console.log('⚠️ No hay usuarios en la BD.');
      return;
    }
    console.log(`✅ Usuario encontrado: ${user.id} (${user.email})`);

    try {
      const settings = await db.botSettings.findFirst({
        where: { userId: user.id }
      });
      console.log('✅ Acceso a botSettings exitoso.');
      console.log('Settings:', settings);
    } catch (e: any) {
      console.error('❌ Error accediendo a botSettings:', e.message);
    }

    try {
      const products = await db.product.findMany({
        where: { userId: user.id }
      });
      console.log(`✅ Acceso a products exitoso (${products.length} productos).`);
    } catch (e: any) {
      console.error('❌ Error accediendo a products:', e.message);
    }

  } catch (e: any) {
    console.error('❌ Error general de DB:', e.message);
  } finally {
    await db.$disconnect();
  }
}

diagnose();
