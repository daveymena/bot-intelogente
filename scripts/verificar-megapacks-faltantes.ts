/**
 * Verificar megapacks faltantes comparando JSON con base de datos
 */

import { db } from '../src/lib/db';
import * as fs from 'fs';

async function verificarMegapacksFaltantes() {
  console.log('🔍 Verificando megapacks faltantes\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Leer JSON
  const jsonData = JSON.parse(
    fs.readFileSync('catalogo-megapacks-20mil-ACTUALIZADO.json', 'utf8')
  );

  // Filtrar solo megapacks
  const megapacksEnJSON = jsonData.filter((p: any) => 
    p.name.includes('Mega Pack')
  );

  console.log(`📦 Megapacks en JSON: ${megapacksEnJSON.length}\n`);

  // Obtener megapacks de la base de datos
  const megapacksEnDB = await db.product.findMany({
    where: {
      name: {
        contains: 'Mega Pack'
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  console.log(`💾 Megapacks en base de datos: ${megapacksEnDB.length}\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Crear mapa de megapacks en DB
  const dbNames = new Set(megapacksEnDB.map(p => p.name.trim().toLowerCase()));

  // Encontrar faltantes
  const faltantes = megapacksEnJSON.filter((p: any) => 
    !dbNames.has(p.name.trim().toLowerCase())
  );

  if (faltantes.length === 0) {
    console.log('✅ Todos los megapacks del JSON están en la base de datos\n');
  } else {
    console.log(`⚠️  MEGAPACKS FALTANTES: ${faltantes.length}\n`);
    
    faltantes.forEach((p: any, i: number) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   💰 Precio: $${p.price.toLocaleString('es-CO')}`);
      console.log(`   📝 Descripción: ${p.description.substring(0, 60)}...`);
      console.log('');
    });
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 MEGAPACKS EN BASE DE DATOS:\n');
  
  megapacksEnDB.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name}`);
  });

  return faltantes;
}

verificarMegapacksFaltantes()
  .then((faltantes) => {
    if (faltantes.length > 0) {
      console.log(`\n⚠️  Hay ${faltantes.length} megapacks faltantes`);
      console.log('Ejecuta el script de importación para agregarlos');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
