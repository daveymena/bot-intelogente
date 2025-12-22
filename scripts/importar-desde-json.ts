import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function importar() {
  console.log('📥 IMPORTAR PRODUCTOS DESDE JSON');
  console.log('='.repeat(70));

  const jsonPath = path.join(process.cwd(), 'catalogo-completo-68-productos.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.log('❌ No se encontró: catalogo-completo-68-productos.json');
    console.log('💡 Primero ejecuta: exportar-productos.bat');
    return;
  }

  const productos = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`\n📄 Productos en JSON: ${productos.length}`);

  const usuario = await prisma.user.findFirst();
  
  if (!usuario) {
    console.log('❌ No hay usuarios en la BD');
    return;
  }

  console.log(`✅ Usuario: ${usuario.email}\n`);

  let importados = 0;
  let actualizados = 0;
  let errores = 0;

  for (const prod of productos) {
    try {
      const existente = await prisma.product.findFirst({
        where: { name: prod.name }
      });

      const data = {
        name: prod.name,
        description: prod.description,
        price: prod.price,
        currency: prod.currency || 'COP',
        category: prod.category,
        status: prod.status || 'AVAILABLE',
        images: JSON.stringify(prod.images || []),
        tags: JSON.stringify(prod.tags || []),
        stock: prod.stock,
        paymentLinkCustom: prod.paymentLinkCustom || null,
        userId: usuario.id,
      };

      if (existente) {
        await prisma.product.update({
          where: { id: existente.id },
          data
        });
        console.log(`🔄 ${prod.name.substring(0, 60)}...`);
        actualizados++;
      } else {
        await prisma.product.create({ data });
        console.log(`✅ ${prod.name.substring(0, 60)}...`);
        importados++;
      }

    } catch (error: any) {
      console.log(`❌ Error: ${prod.name.substring(0, 60)}...`);
      errores++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMEN:');
  console.log(`✅ Importados: ${importados}`);
  console.log(`🔄 Actualizados: ${actualizados}`);
  console.log(`❌ Errores: ${errores}`);
  console.log(`📦 Total: ${importados + actualizados + errores}/${productos.length}`);

  await prisma.$disconnect();
}

importar().catch(console.error);
