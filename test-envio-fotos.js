const axios = require('axios');

async function testEnvioFotos() {
  try {
    console.log('🧪 TEST: Envío de Fotos de Productos\n');
    console.log('═'.repeat(50));
    
    // URL de la foto del Mega Pack 01
    const photoUrl = 'https://hotmart.s3.amazonaws.com/product_pictures/dff88656-8bdd-42a4-b9ac-7eaeabb44202/MEGAPACK01CURSOSDEDESEO.png';
    
    console.log('\n📸 Probando descarga de imagen...');
    console.log(`URL: ${photoUrl}\n`);
    
    // Test 1: Verificar que la URL es accesible
    console.log('[1/4] Verificando accesibilidad de la URL...');
    try {
      const headResponse = await axios.head(photoUrl, { timeout: 5000 });
      console.log(`✅ URL accesible`);
      console.log(`   Status: ${headResponse.status}`);
      console.log(`   Content-Type: ${headResponse.headers['content-type']}`);
      console.log(`   Content-Length: ${headResponse.headers['content-length']} bytes`);
    } catch (error) {
      console.log(`❌ URL no accesible: ${error.message}`);
      return;
    }
    
    // Test 2: Descargar la imagen
    console.log('\n[2/4] Descargando imagen...');
    try {
      const response = await axios.get(photoUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const buffer = Buffer.from(response.data);
      const sizeKB = (buffer.length / 1024).toFixed(2);
      const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
      
      console.log(`✅ Imagen descargada exitosamente`);
      console.log(`   Tamaño: ${sizeKB} KB (${sizeMB} MB)`);
      console.log(`   Tipo: ${response.headers['content-type']}`);
      
      // Test 3: Verificar que es una imagen válida
      console.log('\n[3/4] Verificando formato de imagen...');
      const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
      const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
      const isWEBP = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
      
      if (isPNG) {
        console.log('✅ Formato: PNG válido');
      } else if (isJPEG) {
        console.log('✅ Formato: JPEG válido');
      } else if (isWEBP) {
        console.log('✅ Formato: WEBP válido');
      } else {
        console.log('⚠️ Formato desconocido o corrupto');
        console.log(`   Primeros bytes: ${buffer.slice(0, 16).toString('hex')}`);
      }
      
      // Test 4: Verificar tamaño razonable para WhatsApp
      console.log('\n[4/4] Verificando compatibilidad con WhatsApp...');
      const maxSizeMB = 16; // WhatsApp permite hasta 16MB
      if (buffer.length / 1024 / 1024 <= maxSizeMB) {
        console.log(`✅ Tamaño compatible con WhatsApp (< ${maxSizeMB}MB)`);
      } else {
        console.log(`❌ Imagen demasiado grande para WhatsApp (> ${maxSizeMB}MB)`);
      }
      
      console.log('\n' + '═'.repeat(50));
      console.log('✅ RESULTADO: La imagen es válida y puede enviarse por WhatsApp');
      console.log('\n💡 Si el bot no envía fotos, el problema está en:');
      console.log('   1. El socket de WhatsApp no está conectado');
      console.log('   2. El flujo no llega a la parte de envío de fotos');
      console.log('   3. Hay un error silencioso en el código');
      console.log('\n🔍 Revisa los logs del bot cuando envíes un mensaje');
      
    } catch (error) {
      console.log(`❌ Error descargando imagen: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Headers: ${JSON.stringify(error.response.headers)}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testEnvioFotos();
