/**
 * Script para verificar que el bot y el catálogo usen la misma información
 */

import { db } from '../src/lib/db';

async function verificarSincronizacion() {
  console.log('🔍 VERIFICANDO SINCRONIZACIÓN ENTRE BOT Y CATÁLOGO\n');
  console.log('='.repeat(60));

  try {
    // 1. Obtener productos de la base de datos (lo que usa el bot)
    const productosDB = await db.product.findMany({
      where: {
        status: 'AVAILABLE'
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`\n📊 PRODUCTOS EN BASE DE DATOS: ${productosDB.length}`);
    console.log('='.repeat(60));

    // 2. Verificar campos críticos
    const problemasEncontrados: string[] = [];

    productosDB.forEach((producto, index) => {
      console.log(`\n${index + 1}. ${producto.name}`);
      console.log(`   ID: ${producto.id}`);
      console.log(`   Precio: $${producto.price.toLocaleString('es-CO')} COP`);
      console.log(`   Categoría: ${producto.category || 'Sin categoría'}`);
      console.log(`   Subcategoría: ${producto.subcategory || 'Sin subcategoría'}`);
      console.log(`   Stock: ${producto.stock !== null ? producto.stock : 'Sin límite'}`);
      console.log(`   Estado: ${producto.status}`);
      console.log(`   Imagen: ${producto.imageUrl ? '✅ Sí' : '❌ No'}`);
      console.log(`   Link pago: ${producto.paymentLink || 'Sin link'}`);
      
      // Verificar descripción
      if (producto.description) {
        const descLength = producto.description.length;
        console.log(`   Descripción: ${descLength} caracteres`);
        
        if (descLength < 20) {
          problemasEncontrados.push(`⚠️ ${producto.name}: Descripción muy corta (${descLength} caracteres)`);
        }
      } else {
        console.log(`   Descripción: ❌ Sin descripción`);
        problemasEncontrados.push(`❌ ${producto.name}: Sin descripción`);
      }

      // Verificar precio
      if (producto.price <= 0) {
        problemasEncontrados.push(`❌ ${producto.name}: Precio inválido ($${producto.price})`);
      }

      // Verificar imagen
      if (!producto.imageUrl) {
        problemasEncontrados.push(`⚠️ ${producto.name}: Sin imagen`);
      }
    });

    // 3. Verificar productos duplicados
    console.log('\n\n🔍 VERIFICANDO PRODUCTOS DUPLICADOS');
    console.log('='.repeat(60));

    const nombresProductos = productosDB.map(p => p.name.toLowerCase().trim());
    const duplicados = nombresProductos.filter((nombre, index) => 
      nombresProductos.indexOf(nombre) !== index
    );

    if (duplicados.length > 0) {
      console.log('\n❌ PRODUCTOS DUPLICADOS ENCONTRADOS:');
      const uniqueDuplicados = [...new Set(duplicados)];
      uniqueDuplicados.forEach(nombre => {
        const productos = productosDB.filter(p => 
          p.name.toLowerCase().trim() === nombre
        );
        console.log(`\n   "${nombre}"`);
        productos.forEach(p => {
          console.log(`   - ID: ${p.id}, Precio: $${p.price.toLocaleString('es-CO')}`);
        });
        problemasEncontrados.push(`❌ Producto duplicado: "${nombre}" (${productos.length} veces)`);
      });
    } else {
      console.log('\n✅ No hay productos duplicados');
    }

    // 4. Verificar megapacks específicos
    console.log('\n\n🎓 VERIFICANDO MEGAPACKS ESPECÍFICOS');
    console.log('='.repeat(60));

    const megapacksEsperados = [
      { nombre: 'Mega Pack 01', precio: 20000 },
      { nombre: 'Mega Pack 03', precio: 20000 },
      { nombre: 'PACK COMPLETO 40 Mega Packs', precio: 60000 }
    ];

    for (const esperado of megapacksEsperados) {
      const encontrado = productosDB.find(p => 
        p.name.toLowerCase().includes(esperado.nombre.toLowerCase())
      );

      if (encontrado) {
        console.log(`\n✅ ${esperado.nombre}`);
        console.log(`   Precio esperado: $${esperado.precio.toLocaleString('es-CO')}`);
        console.log(`   Precio actual: $${encontrado.price.toLocaleString('es-CO')}`);
        
        if (encontrado.price !== esperado.precio) {
          problemasEncontrados.push(
            `❌ ${esperado.nombre}: Precio incorrecto (esperado: $${esperado.precio}, actual: $${encontrado.price})`
          );
        }
      } else {
        console.log(`\n❌ ${esperado.nombre}: NO ENCONTRADO`);
        problemasEncontrados.push(`❌ ${esperado.nombre}: No existe en la base de datos`);
      }
    }

    // 5. Verificar búsqueda de productos (simular búsqueda del bot)
    console.log('\n\n🔍 SIMULANDO BÚSQUEDAS DEL BOT');
    console.log('='.repeat(60));

    const busquedasPrueba = [
      'diseño gráfico',
      'inglés',
      'megapack completo',
      'curso de piano',
      'programación'
    ];

    for (const busqueda of busquedasPrueba) {
      console.log(`\n🔎 Búsqueda: "${busqueda}"`);
      
      const resultados = productosDB.filter(p => {
        const texto = `${p.name} ${p.description || ''} ${p.subcategory || ''}`.toLowerCase();
        return texto.includes(busqueda.toLowerCase());
      });

      if (resultados.length > 0) {
        console.log(`   ✅ Encontrados: ${resultados.length} productos`);
        resultados.slice(0, 3).forEach(r => {
          console.log(`      - ${r.name} ($${r.price.toLocaleString('es-CO')})`);
        });
      } else {
        console.log(`   ❌ No se encontraron productos`);
        problemasEncontrados.push(`⚠️ Búsqueda "${busqueda}": Sin resultados`);
      }
    }

    // 6. RESUMEN FINAL
    console.log('\n\n📋 RESUMEN FINAL');
    console.log('='.repeat(60));
    console.log(`Total productos: ${productosDB.length}`);
    console.log(`Productos con imagen: ${productosDB.filter(p => p.imageUrl).length}`);
    console.log(`Productos con descripción: ${productosDB.filter(p => p.description).length}`);
    console.log(`Productos con link de pago: ${productosDB.filter(p => p.paymentLink).length}`);

    if (problemasEncontrados.length > 0) {
      console.log('\n\n⚠️ PROBLEMAS ENCONTRADOS:');
      console.log('='.repeat(60));
      problemasEncontrados.forEach((problema, index) => {
        console.log(`${index + 1}. ${problema}`);
      });
      console.log('\n❌ SE ENCONTRARON PROBLEMAS - Revisar y corregir');
    } else {
      console.log('\n\n✅ TODO CORRECTO - Bot y catálogo sincronizados');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

verificarSincronizacion();
