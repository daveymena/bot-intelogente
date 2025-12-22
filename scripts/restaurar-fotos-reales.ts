import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function restaurarFotosReales() {
  console.log('🔄 RESTAURANDO FOTOS REALES DESDE JSON\n');
  
  // Leer el archivo JSON con las fotos originales
  const jsonPath = path.join(process.cwd(), 'catalogo-completo-68-productos-ACTUALIZADO.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ No se encontró el archivo:', jsonPath);
    return;
  }
  
  const productosJSON = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`📦 Productos en JSON: ${productosJSON.length}\n`);
  
  let actualizados = 0;
  let noEncontrados = 0;
  let sinCambios = 0;
  
  for (const productoJSON of productosJSON) {
    try {
      // Buscar el producto en la base de datos por nombre
      const productoDB = await prisma.product.findFirst({
        where: {
          name: {
            contains: productoJSON.name.substring(0, 30) // Buscar por los primeros 30 caracteres
          }
        }
      });
      
      if (!productoDB) {
        console.log(`⚠️  No encontrado en BD: ${productoJSON.name}`);
        noEncontrados++;
        continue;
      }
      
      // Verificar si tiene imágenes en el JSON
      if (!productoJSON.images || productoJSON.images.length === 0) {
        console.log(`⚠️  Sin imágenes en JSON: ${productoJSON.name}`);
        continue;
      }
      
      // Obtener imágenes actuales
      const imagenesActuales = productoDB.images ? JSON.parse(productoDB.images) : [];
      const imagenesNuevas = productoJSON.images;
      
      // Comparar si son diferentes
      if (JSON.stringify(imagenesActuales) === JSON.stringify(imagenesNuevas)) {
        sinCambios++;
        continue;
      }
      
      // Actualizar con las imágenes reales
      await prisma.product.update({
        where: { id: productoDB.id },
        data: { images: JSON.stringify(imagenesNuevas) }
      });
      
      actualizados++;
      console.log(`✅ ${productoJSON.name}`);
      console.log(`   Fotos: ${imagenesNuevas.join(', ')}`);
      
    } catch (error) {
      console.error(`❌ Error en ${productoJSON.name}:`, error);
    }
  }
  
  console.log('\n📊 RESUMEN:');
  console.log(`  ✅ Actualizados: ${actualizados}`);
  console.log(`  ⚠️  No encontrados: ${noEncontrados}`);
  console.log(`  ➖ Sin cambios: ${sinCambios}`);
  console.log(`  📦 Total procesados: ${productosJSON.length}`);
  
  await prisma.$disconnect();
}

restaurarFotosReales().catch(console.error);
