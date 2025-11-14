const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function arreglarTags() {
  try {
    console.log('🔧 Arreglando tags de Mega Pack 18: Reparación de teléfonos y tablets...\n');
    
    const producto = await prisma.product.findFirst({
      where: { name: { contains: 'Mega Pack 18', mode: 'insensitive' } }
    });
    
    if (producto) {
      console.log('✅ Encontrado: Mega Pack 18: Reparación de teléfonos y tablets');
      console.log(`   ID: ${producto.id}`);
      console.log(`   Tags actuales: ${producto.tags}`);
      
      const newTags = [
        // Términos principales
        "megapack",
        "mega pack",
        "curso",
        "cursos",
        "digital",
        
        // Reparación (con y sin tilde)
        "reparacion",
        "reparación",
        "repara",
        "arreglo",
        "mantenimiento",
        "servicio tecnico",
        "servicio técnico",
        
        // Dispositivos
        "telefono",
        "teléfono",
        "telefonos",
        "teléfonos",
        "celular",
        "celulares",
        "movil",
        "móvil",
        "moviles",
        "móviles",
        "smartphone",
        "smartphones",
        "tablet",
        "tablets",
        "tableta",
        "tabletas",
        
        // Combinaciones
        "reparacion de telefonos",
        "reparación de teléfonos",
        "reparacion de celulares",
        "reparación de celulares",
        "reparacion de tablets",
        "reparación de tablets",
        "reparacion moviles",
        "reparación móviles",
        "curso de reparacion",
        "curso de reparación",
        "curso reparacion",
        "curso reparación",
        
        // Técnico
        "tecnico",
        "técnico",
        "electronica",
        "electrónica",
        "hardware",
        "pantalla",
        "bateria",
        "batería"
      ];
      
      await prisma.product.update({
        where: { id: producto.id },
        data: { tags: JSON.stringify(newTags) }
      });
      
      console.log(`   ✅ Tags actualizados (${newTags.length} términos)\n`);
      
      console.log('✅ Proceso completado');
      console.log('\n🧪 Ahora prueba buscar:');
      console.log('   - "curso de reparación de teléfonos"');
      console.log('   - "reparación de celulares"');
      console.log('   - "curso reparación móviles"');
      console.log('   - "reparación tablets"');
      
    } else {
      console.log('❌ No se encontró Mega Pack 18');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

arreglarTags();
