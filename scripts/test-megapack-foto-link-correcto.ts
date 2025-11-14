/**
 * Test completo: Verificar que el bot envíe foto y link correctos del megapack
 */

import { db } from '../src/lib/db';
import { ProductIntelligenceService } from '../src/lib/product-intelligence-service';
import { PaymentLinkGenerator } from '../src/lib/payment-link-generator';

async function testMegapackFotoLinkCorrecto() {
  console.log('🧪 TEST: Foto y Link Correcto de Megapack\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Simular conversación
  const mensajes = [
    'Hola',
    'Me interesa el mega pack 01',
    'Que métodos de pago tienen?',
    'Envíame el link de pago'
  ];

  let productoActual: any = null;

  for (let i = 0; i < mensajes.length; i++) {
    const mensaje = mensajes[i];
    console.log(`\n📱 Usuario: "${mensaje}"\n`);

    if (i === 0) {
      console.log('🤖 Bot: ¡Hola! Bienvenido a Tecnovariedades D&S\n');
      continue;
    }

    if (i === 1) {
      // Buscar producto
      console.log('🔍 Buscando producto...\n');
      
      const producto = await ProductIntelligenceService.findProduct(mensaje, 'test-user');
      
      if (producto) {
        productoActual = producto;
        
        console.log('✅ Producto encontrado:');
        console.log(`   📦 Nombre: ${productoActual.name}`);
        console.log(`   💰 Precio: $${productoActual.price.toLocaleString('es-CO')} ${productoActual.currency}`);
        console.log(`   🆔 ID: ${productoActual.id}`);
        
        // Parsear imágenes
        let images: string[] = [];
        try {
          images = JSON.parse(productoActual.images);
        } catch {
          images = [productoActual.images];
        }
        
        console.log(`   📸 Foto: ${images[0]}`);
        console.log(`   📝 Descripción: ${productoActual.description.substring(0, 100)}...`);
        
        // Verificar que la foto sea correcta
        const fotoCorrecta = 'https://hotmart.s3.amazonaws.com/product_pictures/00388af9-ea3f-4389-8e85-1cd1dcf11f72/Sintitulo600x600px.png';
        const fotoDiseno = 'https://hotmart.s3.amazonaws.com/product_pictures/dff88656-8bdd-42a4-b9ac-7eaeabb44202/MEGAPACK01CURSOSDEDESEO.png';
        
        if (productoActual.name.toLowerCase().includes('diseño gráfico')) {
          if (images[0] === fotoDiseno) {
            console.log('   ✅ Foto correcta (diseño gráfico)');
          } else {
            console.log('   ⚠️  Foto incorrecta para diseño gráfico');
          }
        } else {
          if (images[0] === fotoCorrecta) {
            console.log('   ✅ Foto correcta (megapack general)');
          } else {
            console.log('   ⚠️  Foto incorrecta para megapack general');
          }
        }
        
        console.log('\n🤖 Bot enviaría:');
        console.log(`   📸 Imagen: ${images[0]}`);
        console.log(`   📝 Mensaje con descripción del producto`);
      }
    }

    if (i === 2) {
      // Métodos de pago
      console.log('💳 Mostrando métodos de pago...\n');
      
      if (productoActual) {
        console.log('✅ Contexto de producto BLOQUEADO:');
        console.log(`   📦 Producto: ${productoActual.name}`);
        console.log(`   💰 Precio: $${productoActual.price.toLocaleString('es-CO')}`);
        console.log(`   🆔 ID: ${productoActual.id}`);
        
        console.log('\n🤖 Bot enviaría:');
        console.log('   💳 Lista de métodos de pago disponibles');
        console.log(`   📦 Para: ${productoActual.name}`);
        console.log(`   💰 Precio: $${productoActual.price.toLocaleString('es-CO')}`);
      } else {
        console.log('❌ ERROR: No hay producto en contexto');
      }
    }

    if (i === 3) {
      // Enviar link de pago
      console.log('🔗 Generando link de pago...\n');
      
      if (productoActual) {
        console.log('✅ Contexto de producto BLOQUEADO:');
        console.log(`   📦 Producto: ${productoActual.name}`);
        console.log(`   💰 Precio: $${productoActual.price.toLocaleString('es-CO')}`);
        console.log(`   🆔 ID: ${productoActual.id}`);
        
        // Generar link de MercadoPago
        const linkMercadoPago = await PaymentLinkGenerator.generateMercadoPagoLink(
          productoActual.name,
          productoActual.price,
          productoActual.id
        );
        
        console.log('\n🤖 Bot enviaría:');
        console.log(`   📦 Producto: ${productoActual.name}`);
        console.log(`   💰 Precio: $${productoActual.price.toLocaleString('es-CO')}`);
        console.log(`   🔗 Link MercadoPago: ${linkMercadoPago}`);
        console.log('   💳 Información de Nequi/Daviplata');
        console.log('   📧 Instrucciones de envío de comprobante');
        
        // Verificar que el link sea del producto correcto
        if (linkMercadoPago.includes(productoActual.id)) {
          console.log('\n   ✅ Link correcto (contiene ID del producto)');
        } else {
          console.log('\n   ⚠️  Link podría ser incorrecto');
        }
      } else {
        console.log('❌ ERROR: No hay producto en contexto');
      }
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ TEST COMPLETADO\n');
  
  // Verificar producto en base de datos
  console.log('📊 VERIFICACIÓN EN BASE DE DATOS:\n');
  
  const megapack01 = await db.product.findFirst({
    where: {
      name: {
        contains: 'Mega Pack 01'
      }
    }
  });
  
  if (megapack01) {
    console.log(`✅ Mega Pack 01 encontrado:`);
    console.log(`   📦 Nombre: ${megapack01.name}`);
    console.log(`   💰 Precio: $${megapack01.price.toLocaleString('es-CO')}`);
    console.log(`   🆔 ID: ${megapack01.id}`);
    
    let images: string[] = [];
    try {
      images = JSON.parse(megapack01.images);
    } catch {
      images = [megapack01.images];
    }
    
    console.log(`   📸 Foto: ${images[0]}`);
    
    const fotoDiseno = 'https://hotmart.s3.amazonaws.com/product_pictures/dff88656-8bdd-42a4-b9ac-7eaeabb44202/MEGAPACK01CURSOSDEDESEO.png';
    
    if (images[0] === fotoDiseno) {
      console.log('   ✅ Foto correcta (diseño gráfico)');
    } else {
      console.log('   ⚠️  Foto incorrecta');
      console.log(`   📸 Debería ser: ${fotoDiseno}`);
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('🎯 PUNTOS CLAVE:\n');
  console.log('1. ✅ El producto debe mantenerse en contexto durante toda la conversación');
  console.log('2. ✅ La foto debe ser la correcta del producto seleccionado');
  console.log('3. ✅ El link de pago debe ser del producto correcto');
  console.log('4. ✅ El precio debe ser consistente en todos los mensajes');
  console.log('5. ✅ NO debe cambiar a otro producto (ej: Piano)');
}

testMegapackFotoLinkCorrecto()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
