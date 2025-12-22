import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function agregarFotos() {
  console.log('📸 Agregando fotos a todos los productos...\n');
  
  const productos = await prisma.product.findMany();
  console.log(`Total productos: ${productos.length}\n`);
  
  let actualizados = 0;
  
  for (const producto of productos) {
    try {
      const imagenes = producto.images ? JSON.parse(producto.images) : [];
      
      if (imagenes.length === 0) {
        // Imagen por defecto
        let imagen = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';
        
        // Detectar tipo de producto
        const nombre = producto.name.toLowerCase();
        
        if (nombre.includes('curso')) {
          imagen = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
        } else if (nombre.includes('pack')) {
          imagen = 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800';
        } else if (nombre.includes('laptop') || nombre.includes('portátil')) {
          imagen = 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800';
        } else if (nombre.includes('moto')) {
          imagen = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800';
        }
        
        await prisma.product.update({
          where: { id: producto.id },
          data: { images: JSON.stringify([imagen]) }
        });
        
        actualizados++;
        console.log(`✅ ${producto.name}`);
      }
    } catch (error) {
      console.error(`❌ Error en ${producto.name}:`, error);
    }
  }
  
  console.log(`\n✅ Fotos agregadas: ${actualizados}`);
  await prisma.$disconnect();
}

agregarFotos();
