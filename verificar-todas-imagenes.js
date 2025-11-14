const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function verificarImagen(url) {
  try {
    const response = await axios.head(url, { 
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    return { accessible: true, status: response.status };
  } catch (error) {
    return { accessible: false, status: error.response?.status || 'timeout' };
  }
}

async function verificarTodasImagenes() {
  try {
    console.log('🔍 Verificando accesibilidad de todas las imágenes...\n');
    
    const productos = await prisma.product.findMany({
      where: {
        AND: [
          { status: 'AVAILABLE' },
          { images: { not: null } }
        ]
      },
      select: {
        id: true,
        name: true,
        images: true
      }
    });
    
    console.log(`📦 Total de productos con imágenes: ${productos.length}\n`);
    
    let accesibles = 0;
    let noAccesibles = 0;
    const problemasDetectados = [];
    
    for (const producto of productos) {
      try {
        const imagenes = JSON.parse(producto.images);
        const primeraImagen = Array.isArray(imagenes) ? imagenes[0] : imagenes;
        
        if (!primeraImagen || primeraImagen.trim() === '') {
          console.log(`⚠️  ${producto.name}`);
          console.log(`   Sin URL de imagen válida\n`);
          noAccesibles++;
          continue;
        }
        
        const resultado = await verificarImagen(primeraImagen);
        
        if (resultado.accessible) {
          console.log(`✅ ${producto.name}`);
          console.log(`   ${primeraImagen.substring(0, 80)}...`);
          console.log(`   Status: ${resultado.status}\n`);
          accesibles++;
        } else {
          console.log(`❌ ${producto.name}`);
          console.log(`   ${primeraImagen.substring(0, 80)}...`);
          console.log(`   Status: ${resultado.status}\n`);
          noAccesibles++;
          
          problemasDetectados.push({
            nombre: producto.name,
            url: primeraImagen,
            status: resultado.status
          });
        }
        
      } catch (error) {
        console.log(`⚠️  ${producto.name}`);
        console.log(`   Error parseando imágenes: ${error.message}\n`);
        noAccesibles++;
      }
    }
    
    console.log('═'.repeat(60));
    console.log('📊 RESUMEN');
    console.log('═'.repeat(60));
    console.log(`✅ Imágenes accesibles: ${accesibles}`);
    console.log(`❌ Imágenes no accesibles: ${noAccesibles}`);
    console.log(`📦 Total: ${productos.length}`);
    
    if (problemasDetectados.length > 0) {
      console.log('\n⚠️  PROBLEMAS DETECTADOS:\n');
      problemasDetectados.forEach((p, i) => {
        console.log(`${i + 1}. ${p.nombre}`);
        console.log(`   URL: ${p.url.substring(0, 80)}...`);
        console.log(`   Error: ${p.status}`);
        console.log('');
      });
      
      console.log('💡 SOLUCIONES:');
      console.log('   1. Reemplazar URLs de Hotmart con imágenes públicas');
      console.log('   2. Subir imágenes a un servidor propio');
      console.log('   3. Usar URLs de Unsplash o similares');
      console.log('   4. Configurar permisos en Hotmart (si es posible)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verificarTodasImagenes();
