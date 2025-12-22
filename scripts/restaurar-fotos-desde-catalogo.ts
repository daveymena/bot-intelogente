/**
 * Script para restaurar fotos desde el catálogo histórico
 * Actualiza productos en BD con las fotos del archivo JSON
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function restaurarFotosDesdeHistorial() {
  console.log('🔄 Restaurando fotos desde catálogo histórico...\n');

  // Leer el archivo JSON con las fotos
  const catalogoPath = path.join(process.cwd(), 'catalogo-completo-68-productos-ACTUALIZADO.json');
  
  if (!fs.existsSync(catalogoPath)) {
    console.log('❌ No se encontró el archivo de catálogo');
    return;
  }

  const catalogoData = JSON.parse(fs.readFileSync(catalogoPath, 'utf-8'));
  console.log(`📦 Productos en catálogo: ${catalogoData.length}\n`);

  let actualizados = 0;
  let sinCambios = 0;
  let errores = 0;

  for (const productoHistorico of catalogoData) {
    try {
      // Buscar producto en BD por nombre
      const productoBD = await prisma.product.findFirst({
        where: {
          name: {
            contains: productoHistorico.name.substring(0, 30), // Buscar por primeras palabras
            mode: 'insensitive'
          }
        }
      });

      if (!productoBD) {
        console.log(`⚠️  No encontrado en BD: ${productoHistorico.name.substring(0, 50)}...`);
        continue;
      }

      // Verificar si tiene fotos en el histórico
      if (!productoHistorico.images || productoHistorico.images.length === 0) {
        continue;
      }

      // Obtener fotos actuales
      const fotosActuales = productoBD.images ? JSON.parse(productoBD.images) : [];
      
      // Filtrar solo URLs válidas (http/https)
      const fotosHistoricas = productoHistorico.images.filter((img: string) => 
        img.startsWith('http')
      );

      if (fotosHistoricas.length === 0) {
        continue;
      }

      // Combinar fotos (sin duplicados)
      const todasLasFotos = [...new Set([...fotosActuales, ...fotosHistoricas])];

      // Solo actualizar si hay cambios
      if (todasLasFotos.length > fotosActuales.length) {
        await prisma.product.update({
          where: { id: productoBD.id },
          data: {
            images: JSON.stringify(todasLasFotos)
          }
        });

        console.log(`✅ ${productoBD.name.substring(0, 50)}...`);
        console.log(`   📷 ${fotosActuales.length} → ${todasLasFotos.length} fotos`);
        actualizados++;
      } else {
        sinCambios++;
      }

    } catch (error: any) {
      console.log(`❌ Error: ${productoHistorico.name.substring(0, 50)}...`);
      console.log(`   ${error.message}`);
      errores++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RESUMEN:');
  console.log(`   ✅ Actualizados: ${actualizados}`);
  console.log(`   ⚠️  Sin cambios: ${sinCambios}`);
  console.log(`   ❌ Errores: ${errores}`);
  console.log('\n✨ Proceso completado!');
}

restaurarFotosDesdeHistorial()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
