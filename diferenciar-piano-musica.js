const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diferenciar() {
  try {
    console.log('🎹 Diferenciando Curso de Piano vs Megapack de Música...\n');
    
    // 1. CURSO COMPLETO DE PIANO (individual)
    const cursoPiano = await prisma.product.findFirst({
      where: { name: { contains: 'Curso Completo de Piano', mode: 'insensitive' } }
    });
    
    if (cursoPiano) {
      console.log('✅ Encontrado: Curso Completo de Piano');
      console.log(`   ID: ${cursoPiano.id}`);
      console.log(`   Precio: $${cursoPiano.price.toLocaleString('es-CO')}`);
      
      const tagsPiano = [
        // Términos específicos de PIANO (muy específico)
        "curso de piano",
        "curso piano",
        "piano completo",
        "aprender piano",
        "clases de piano",
        "piano desde cero",
        "piano avanzado",
        "piano online",
        "tutorial piano",
        
        // Piano (palabra clave principal)
        "piano",
        
        // Curso
        "curso",
        "cursos",
        "curso completo",
        "curso individual",
        
        // Música (secundario)
        "musica",
        "música",
        
        // Nivel
        "principiante",
        "intermedio",
        "avanzado",
        "desde cero",
        
        // Formato
        "online",
        "digital",
        "video",
        "tutorial",
        "clases",
        
        // Categoría
        "educacion_desarrollo"
      ];
      
      await prisma.product.update({
        where: { id: cursoPiano.id },
        data: { tags: JSON.stringify(tagsPiano) }
      });
      
      console.log(`   ✅ Tags actualizados (${tagsPiano.length} términos)`);
      console.log(`   Enfoque: PIANO ESPECÍFICO\n`);
    }
    
    // 2. MEGA PACK 09: CURSOS MÚSICA Y AUDIO (varios cursos)
    const megapackMusica = await prisma.product.findFirst({
      where: { 
        name: { contains: 'Mega Pack 09', mode: 'insensitive' }
      }
    });
    
    if (megapackMusica) {
      console.log('✅ Encontrado: Mega Pack 09: Cursos Música y Audio');
      console.log(`   ID: ${megapackMusica.id}`);
      console.log(`   Precio: $${megapackMusica.price.toLocaleString('es-CO')}`);
      
      const tagsMusica = [
        // Términos de MÚSICA (general)
        "musica",
        "música",
        "cursos de musica",
        "cursos de música",
        "curso de musica",
        "curso de música",
        "produccion musical",
        "producción musical",
        "aprender musica",
        "aprender música",
        
        // Megapack
        "megapack",
        "mega pack",
        "pack de cursos",
        
        // Audio y producción
        "audio",
        "produccion",
        "producción",
        "produccion de audio",
        "producción de audio",
        
        // Software de música
        "fl studio",
        "flstudio",
        "ableton",
        "ableton live",
        "logic pro",
        "cubase",
        "pro tools",
        
        // Instrumentos (varios, no solo piano)
        "instrumentos",
        "guitarra",
        "bateria",
        "bajo",
        "teclado",
        
        // Conceptos musicales
        "teoria musical",
        "teoría musical",
        "composicion",
        "composición",
        "mezcla",
        "masterizacion",
        "masterización",
        
        // Curso
        "curso",
        "cursos",
        "digital",
        
        // Categoría
        "educacion_desarrollo"
      ];
      
      await prisma.product.update({
        where: { id: megapackMusica.id },
        data: { tags: JSON.stringify(tagsMusica) }
      });
      
      console.log(`   ✅ Tags actualizados (${tagsMusica.length} términos)`);
      console.log(`   Enfoque: MÚSICA GENERAL (varios cursos)\n`);
    }
    
    console.log('═'.repeat(60));
    console.log('📊 DIFERENCIACIÓN COMPLETADA');
    console.log('═'.repeat(60));
    
    console.log('\n🧪 PRUEBAS:');
    console.log('\n1. Cliente: "curso de piano"');
    console.log('   → Debe encontrar: Curso Completo de Piano ($65.000)');
    console.log('   → Razón: Tiene "curso de piano" en tags');
    
    console.log('\n2. Cliente: "piano"');
    console.log('   → Debe encontrar: Curso Completo de Piano ($65.000)');
    console.log('   → Razón: "piano" es más específico que "música"');
    
    console.log('\n3. Cliente: "cursos de música"');
    console.log('   → Debe encontrar: Mega Pack 09 ($20.000)');
    console.log('   → Razón: Tiene "cursos de música" en tags');
    
    console.log('\n4. Cliente: "producción musical"');
    console.log('   → Debe encontrar: Mega Pack 09 ($20.000)');
    console.log('   → Razón: Incluye FL Studio, Ableton, etc.');
    
    console.log('\n5. Cliente: "fl studio"');
    console.log('   → Debe encontrar: Mega Pack 09 ($20.000)');
    console.log('   → Razón: Software de producción musical');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

diferenciar();
