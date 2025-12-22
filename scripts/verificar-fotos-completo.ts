import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function verificarFotosCompleto() {
  console.log('🔍 VERIFICACIÓN COMPLETA DE FOTOS\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. Verificar configuración
    console.log('1️⃣ CONFIGURACIÓN:');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000';
    console.log(`   Base URL: ${baseUrl}`);
    console.log('');

    // 2. Verificar carpeta de fotos
    console.log('2️⃣ CARPETA DE FOTOS:');
    const fotosPath = path.join(process.cwd(), 'public', 'fotos');
    const fotosExist = fs.existsSync(fotosPath);
    console.log(`   Ruta: ${fotosPath}`);
    console.log(`   Existe: ${fotosExist ? '✅' : '❌'}`);
    
    if (fotosExist) {
      const files = fs.readdirSync(fotosPath);
      const imageFiles = files.filter(f => 
        f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp') || f.endsWith('.jpeg')
      );
      console.log(`   Total archivos: ${files.length}`);
      console.log(`   Imágenes: ${imageFiles.length}`);
    }
    console.log('');

    // 3. Verificar productos con fotos
    console.log('3️⃣ PRODUCTOS CON FOTOS EN BD:');
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        images: true,
      },
    });

    let conFotos = 0;
    let sinFotos = 0;
    let fotosLocales = 0;
    let fotosExternas = 0;
    let fotosInvalidas = 0;

    const ejemplos: any[] = [];

    for (const product of products) {
      if (!product.images) {
        sinFotos++;
        continue;
      }

      try {
        const imagesArray = JSON.parse(product.images);
        if (!Array.isArray(imagesArray) || imagesArray.length === 0) {
          sinFotos++;
          continue;
        }

        conFotos++;

        // Analizar cada imagen
        for (const img of imagesArray) {
          if (img.startsWith('/fotos/')) {
            fotosLocales++;
            
            // Verificar si el archivo existe
            const filePath = path.join(process.cwd(), 'public', img);
            const exists = fs.existsSync(filePath);
            
            if (ejemplos.length < 3) {
              ejemplos.push({
                producto: product.name,
                imagen: img,
                url: `${baseUrl}${img}`,
                existe: exists,
              });
            }
            
            if (!exists) {
              fotosInvalidas++;
            }
          } else if (img.startsWith('http')) {
            fotosExternas++;
          }
        }
      } catch (e) {
        sinFotos++;
      }
    }

    console.log(`   Total productos: ${products.length}`);
    console.log(`   Con fotos: ${conFotos}`);
    console.log(`   Sin fotos: ${sinFotos}`);
    console.log(`   Fotos locales: ${fotosLocales}`);
    console.log(`   Fotos externas: ${fotosExternas}`);
    console.log(`   Fotos inválidas (no existen): ${fotosInvalidas}`);
    console.log('');

    // 4. Ejemplos
    if (ejemplos.length > 0) {
      console.log('4️⃣ EJEMPLOS DE CONVERSIÓN:');
      ejemplos.forEach((ej, i) => {
        console.log(`\n   ${i + 1}. ${ej.producto}`);
        console.log(`      Ruta BD: ${ej.imagen}`);
        console.log(`      URL completa: ${ej.url}`);
        console.log(`      Archivo existe: ${ej.existe ? '✅' : '❌'}`);
      });
      console.log('');
    }

    // 5. Verificar curso de piano específicamente
    console.log('5️⃣ VERIFICACIÓN CURSO DE PIANO:');
    const piano = await prisma.product.findFirst({
      where: {
        name: {
          contains: 'piano',
          mode: 'insensitive',
        },
      },
      select: {
        name: true,
        images: true,
      },
    });

    if (piano) {
      console.log(`   ✅ Encontrado: ${piano.name}`);
      if (piano.images) {
        const imgs = JSON.parse(piano.images);
        console.log(`   Imágenes en BD: ${JSON.stringify(imgs)}`);
        
        if (imgs.length > 0) {
          const img = imgs[0];
          const fullUrl = img.startsWith('/') ? `${baseUrl}${img}` : img;
          const filePath = path.join(process.cwd(), 'public', img);
          const exists = fs.existsSync(filePath);
          
          console.log(`   URL completa: ${fullUrl}`);
          console.log(`   Archivo existe: ${exists ? '✅' : '❌'}`);
          
          if (exists) {
            const stats = fs.statSync(filePath);
            console.log(`   Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
          }
        }
      } else {
        console.log(`   ⚠️ Sin imágenes en BD`);
      }
    } else {
      console.log(`   ❌ No encontrado`);
    }
    console.log('');

    // Resumen final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMEN:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (fotosInvalidas > 0) {
      console.log(`⚠️ ${fotosInvalidas} fotos no existen en el servidor`);
    }
    
    if (fotosLocales > 0 && fotosInvalidas === 0) {
      console.log(`✅ Todas las fotos locales existen`);
      console.log(`✅ Sistema listo para enviar fotos por WhatsApp`);
      console.log(`✅ URL base configurada: ${baseUrl}`);
    }
    
    if (sinFotos > 0) {
      console.log(`ℹ️ ${sinFotos} productos sin fotos (usarán placeholder)`);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarFotosCompleto();
