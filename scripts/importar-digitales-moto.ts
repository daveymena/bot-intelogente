import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function importar() {
  console.log('📦 IMPORTANDO PRODUCTOS DIGITALES Y MOTO');
  console.log('='.repeat(70));

  const jsonPath = path.join(process.cwd(), 'productos-digitales-moto.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.log('❌ No se encontró productos-digitales-moto.json');
    return;
  }

  const productos = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`\n📄 Productos en JSON: ${productos.length}`);

  // Obtener el primer usuario (admin) para asignar los productos
  const usuario = await prisma.user.findFirst();
  
  if (!usuario) {
    console.log('❌ No hay usuarios en la BD. Crea un usuario primero.');
    return;
  }

  console.log(`✅ Asignando productos al usuario: ${usuario.email}\n`);

  let importados = 0;
  let actualizados = 0;
  let errores = 0;

  for (const prod of productos) {
    try {
      // Verificar si ya existe
      const existente = await prisma.product.findFirst({
        where: {
          name: prod.name
        }
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
        // Actualizar
        await prisma.product.update({
          where: { id: existente.id },
          data
        });
        console.log(`🔄 Actualizado: ${prod.name}`);
        actualizados++;
      } else {
        // Crear nuevo
        await prisma.product.create({
          data
        });
        console.log(`✅ Importado: ${prod.name}`);
        importados++;
      }

      // Mostrar info
      const fotos = prod.images || [];
      const categoria = prod.category === 'DIGITAL' ? '💾 DIGITAL' : '🏍️ FÍSICO';
      console.log(`   ${categoria} | Precio: $${prod.price.toLocaleString()}`);
      if (fotos.length > 0) {
        console.log(`   📸 Fotos: ${fotos.length}`);
      }
      console.log('');

    } catch (error: any) {
      console.log(`❌ Error con ${prod.name}: ${error.message}`);
      errores++;
    }
  }

  console.log('='.repeat(70));
  console.log('📊 RESUMEN:');
  console.log(`✅ Importados: ${importados}`);
  console.log(`🔄 Actualizados: ${actualizados}`);
  console.log(`❌ Errores: ${errores}`);
  console.log(`📦 Total procesados: ${importados + actualizados + errores}`);

  await prisma.$disconnect();
}

importar().catch(console.error);
