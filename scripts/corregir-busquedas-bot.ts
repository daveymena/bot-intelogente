/**
 * Script para corregir las búsquedas que no funcionan en el bot
 */

import { db } from '../src/lib/db';

async function corregirBusquedas() {
  console.log('🔧 CORRIGIENDO BÚSQUEDAS DEL BOT\n');
  console.log('='.repeat(60));

  try {
    // 1. Corregir "PACK COMPLETO 40 Mega Packs" para que se encuentre con "megapack completo"
    const packCompleto = await db.product.findFirst({
      where: {
        name: {
          contains: 'PACK COMPLETO 40'
        }
      }
    });

    if (packCompleto) {
      console.log('\n✅ Encontrado: PACK COMPLETO 40 Mega Packs');
      console.log('   Descripción actual:', packCompleto.description?.substring(0, 100));
      
      // Agregar palabras clave a la descripción para mejorar búsqueda
      const nuevaDescripcion = `${packCompleto.description || ''}\n\nPalabras clave: megapack completo, super megapack, todos los cursos, pack completo, 40 megapacks, colección completa`;
      
      await db.product.update({
        where: { id: packCompleto.id },
        data: {
          description: nuevaDescripcion,
          subcategory: 'Megapacks Completos'
        }
      });
      
      console.log('   ✅ Actualizado con palabras clave para búsqueda');
    }

    // 2. Buscar productos de piano
    const productoPiano = await db.product.findFirst({
      where: {
        OR: [
          { name: { contains: 'piano', mode: 'insensitive' } },
          { description: { contains: 'piano', mode: 'insensitive' } }
        ]
      }
    });

    if (productoPiano) {
      console.log('\n✅ Encontrado producto de piano:', productoPiano.name);
      console.log('   Ya existe en la base de datos');
    } else {
      console.log('\n⚠️ No se encontró producto de piano');
      console.log('   Verificando en Mega Pack 09...');
      
      const megaPack09 = await db.product.findFirst({
        where: {
          name: {
            contains: 'Mega Pack 09'
          }
        }
      });
      
      if (megaPack09) {
        console.log('   Mega Pack 09 encontrado:', megaPack09.name);
        console.log('   Descripción:', megaPack09.description?.substring(0, 150));
        
        // Si contiene "piano" en la descripción, agregar a subcategoría
        if (megaPack09.description?.toLowerCase().includes('piano')) {
          await db.product.update({
            where: { id: megaPack09.id },
            data: {
              subcategory: 'Cursos de Música'
            }
          });
          console.log('   ✅ Actualizada subcategoría a "Cursos de Música"');
        }
      }
    }

    // 3. Verificar que todos los megapacks tengan subcategoría
    const megapacksSinSubcategoria = await db.product.findMany({
      where: {
        name: {
          contains: 'Mega Pack'
        },
        subcategory: null
      }
    });

    if (megapacksSinSubcategoria.length > 0) {
      console.log(`\n⚠️ ${megapacksSinSubcategoria.length} megapacks sin subcategoría`);
      
      for (const megapack of megapacksSinSubcategoria) {
        let subcategoria = 'Cursos Digitales';
        
        // Asignar subcategoría basada en el nombre/descripción
        const texto = `${megapack.name} ${megapack.description || ''}`.toLowerCase();
        
        if (texto.includes('diseño')) subcategoria = 'Diseño Gráfico';
        else if (texto.includes('programación') || texto.includes('web')) subcategoria = 'Programación';
        else if (texto.includes('inglés') || texto.includes('idiomas')) subcategoria = 'Idiomas';
        else if (texto.includes('marketing')) subcategoria = 'Marketing Digital';
        else if (texto.includes('excel') || texto.includes('office')) subcategoria = 'Office y Productividad';
        else if (texto.includes('video') || texto.includes('edición')) subcategoria = 'Edición de Video';
        else if (texto.includes('fotografía')) subcategoria = 'Fotografía';
        else if (texto.includes('música') || texto.includes('audio') || texto.includes('piano')) subcategoria = 'Música y Audio';
        else if (texto.includes('hacking')) subcategoria = 'Seguridad Informática';
        else if (texto.includes('emprendimiento')) subcategoria = 'Emprendimiento';
        else if (texto.includes('3d') || texto.includes('animación')) subcategoria = '3D y Animación';
        else if (texto.includes('gastronomía')) subcategoria = 'Gastronomía';
        else if (texto.includes('arquitectura') || texto.includes('ingeniería')) subcategoria = 'Arquitectura e Ingeniería';
        else if (texto.includes('completo') || texto.includes('40')) subcategoria = 'Megapacks Completos';
        
        await db.product.update({
          where: { id: megapack.id },
          data: { subcategory: subcategoria }
        });
        
        console.log(`   ✅ ${megapack.name} → ${subcategoria}`);
      }
    } else {
      console.log('\n✅ Todos los megapacks tienen subcategoría');
    }

    // 4. Verificar búsquedas después de correcciones
    console.log('\n\n🔍 VERIFICANDO BÚSQUEDAS DESPUÉS DE CORRECCIONES');
    console.log('='.repeat(60));

    const busquedasPrueba = [
      { query: 'megapack completo', esperado: 'PACK COMPLETO 40' },
      { query: 'super megapack', esperado: 'PACK COMPLETO 40' },
      { query: 'todos los cursos', esperado: 'PACK COMPLETO 40' },
      { query: 'piano', esperado: 'Mega Pack 09' },
      { query: 'música', esperado: 'Mega Pack 09' }
    ];

    for (const busqueda of busquedasPrueba) {
      const resultados = await db.product.findMany({
        where: {
          OR: [
            { name: { contains: busqueda.query, mode: 'insensitive' } },
            { description: { contains: busqueda.query, mode: 'insensitive' } },
            { subcategory: { contains: busqueda.query, mode: 'insensitive' } }
          ],
          status: 'AVAILABLE'
        }
      });

      if (resultados.length > 0) {
        console.log(`\n✅ "${busqueda.query}" → ${resultados.length} resultados`);
        resultados.slice(0, 2).forEach(r => {
          console.log(`   - ${r.name}`);
        });
      } else {
        console.log(`\n❌ "${busqueda.query}" → Sin resultados`);
      }
    }

    console.log('\n\n✅ CORRECCIONES COMPLETADAS');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

corregirBusquedas();
