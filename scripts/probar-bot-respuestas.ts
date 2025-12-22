import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simulación del servicio de IA
async function simularRespuestaIA(mensaje: string, productos: any[]): Promise<string> {
  const mensajeLower = mensaje.toLowerCase();
  
  // Buscar productos relevantes
  const productosRelevantes = productos.filter(p => {
    const nombre = p.name.toLowerCase();
    const descripcion = (p.description || '').toLowerCase();
    
    let tags: string[] = [];
    try {
      tags = p.tags ? JSON.parse(p.tags) : [];
    } catch (e) {
      // Si no es JSON válido, intentar separar por comas
      tags = p.tags ? p.tags.split(',').map((t: string) => t.trim()) : [];
    }
    
    return tags.some((tag: string) => mensajeLower.includes(tag.toLowerCase())) ||
           nombre.split(' ').some((palabra: string) => mensajeLower.includes(palabra.toLowerCase())) ||
           mensajeLower.includes('laptop') && nombre.includes('VivoBook') ||
           mensajeLower.includes('moto') && nombre.includes('Bajaj') ||
           mensajeLower.includes('macbook') && nombre.includes('MacBook');
  });

  if (productosRelevantes.length === 0) {
    return `¡Hola! Soy el asistente de Tecnovariedades D&S. 

No encontré productos específicos para "${mensaje}", pero tenemos:
- Laptops ASUS VivoBook desde $1,189,000
- MacBook Pro M4 desde $9,799,000
- Motos Bajaj Pulsar desde $6,000,000

¿En qué puedo ayudarte?`;
  }

  // Construir respuesta con productos encontrados
  let respuesta = `¡Hola! Encontré ${productosRelevantes.length} producto(s) que te pueden interesar:\n\n`;
  
  productosRelevantes.slice(0, 3).forEach((producto, index) => {
    let imagenes: string[] = [];
    try {
      imagenes = producto.images ? JSON.parse(producto.images) : [];
    } catch (e) {
      imagenes = [];
    }
    
    respuesta += `${index + 1}. **${producto.name}**\n`;
    respuesta += `   💰 Precio: $${producto.price.toLocaleString('es-CO')} COP\n`;
    respuesta += `   📝 ${producto.description}\n`;
    if (producto.stock) {
      respuesta += `   📦 Stock disponible: ${producto.stock} unidades\n`;
    }
    if (imagenes.length > 0) {
      respuesta += `   📸 Imágenes: ${imagenes.length} disponibles\n`;
    }
    respuesta += `\n`;
  });

  respuesta += `\n¿Te gustaría más información sobre alguno de estos productos?`;
  
  return respuesta;
}

async function probarBot() {
  console.log('🤖 PRUEBA DEL BOT DE WHATSAPP\n');
  console.log('='.repeat(60));
  
  try {
    // Obtener todos los productos
    const productos = await prisma.product.findMany({
      where: { status: 'AVAILABLE' }
    });

    console.log(`\n📦 Productos en base de datos: ${productos.length}\n`);

    // Casos de prueba
    const casosPrueba = [
      'Hola, busco una laptop',
      'Tienes laptops ASUS?',
      'Cuánto cuesta el MacBook?',
      'Necesito una moto',
      'Quiero ver laptops baratas',
      'Tienes algo con Ryzen 7?',
    ];

    for (const mensaje of casosPrueba) {
      console.log('\n' + '─'.repeat(60));
      console.log(`👤 CLIENTE: ${mensaje}`);
      console.log('─'.repeat(60));
      
      const respuesta = await simularRespuestaIA(mensaje, productos);
      console.log(`\n🤖 BOT:\n${respuesta}`);
      console.log('\n');
    }

    // Mostrar estadísticas de productos con imágenes
    console.log('\n' + '='.repeat(60));
    console.log('📊 ESTADÍSTICAS DE PRODUCTOS CON IMÁGENES');
    console.log('='.repeat(60));
    
    const productosConImagenes = productos.filter(p => {
      try {
        const imagenes = p.images ? JSON.parse(p.images) : [];
        return imagenes.length > 0;
      } catch (e) {
        return false;
      }
    });

    console.log(`\n✅ Productos con imágenes: ${productosConImagenes.length}`);
    console.log(`❌ Productos sin imágenes: ${productos.length - productosConImagenes.length}`);
    
    console.log('\n📸 Productos con imágenes:');
    productosConImagenes.forEach(p => {
      try {
        const imagenes = JSON.parse(p.images!);
        console.log(`  - ${p.name}: ${imagenes.length} imágenes`);
      } catch (e) {
        console.log(`  - ${p.name}: Error al leer imágenes`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

probarBot();
