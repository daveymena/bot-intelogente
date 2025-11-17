/**
 * Obtiene el ID del primer usuario en la base de datos
 */

import { db } from '../src/lib/db';

async function getUserId() {
  try {
    const user = await db.user.findFirst();
    
    if (!user) {
      console.log('❌ No se encontró ningún usuario en la base de datos');
      process.exit(1);
    }
    
    console.log('✅ Usuario encontrado:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Nombre:', user.businessName || 'N/A');
    
    return user.id;
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

getUserId().then(() => process.exit(0));
