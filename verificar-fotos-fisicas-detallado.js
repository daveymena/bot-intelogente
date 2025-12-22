/**
 * VERIFICACIÓN DETALLADA DE FOTOS FÍSICAS
 * Verifica archivo por archivo que las fotos existan
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Colores
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

/**
 * Verifica si un archivo existe y obtiene su información
 */
function verificarArchivoFisico(rutaRelativa) {
  // Limpiar la ruta
  const rutaLimpia = rutaRelativa.replace(/^\//, ''); // Quitar / inicial
  const rutaCompleta = path.join(process.cwd(), 'public', rutaLimpia);
  
  const resultado = {
    rutaRelativa,
    rutaCompleta,
    existe: false,
    tamaño: null,
    tamañoKB: null,
    tamañoMB: null,
    extension: null,
    error: null,
  };

  try {
    if (fs.existsSync(rutaCompleta)) {
      const stats = fs.statSync(rutaCompleta);
      resultado.existe = true;
      resultado.tamaño = stats.size;
      resultado.tamañoKB = (stats.size / 1024).toFixed(2);
      resultado.tamañoMB = (stats.size / (1024 * 1024)).toFixed(2);
      resultado.extension = path.extname(rutaCompleta);
    }
  } catch (error) {
    resultado.error = error.message;
  }

  return resultado;
}

/**
 * Función principal
 */
async function verificarFotosFisicasDetallado() {
  console.log('\n');
  log(colors.cyan, '═══════════════════════════════════════════════════════════');
  log(colors.cyan, '  VERIFICACIÓN DETALLADA DE FOTOS FÍSICAS');
  log(colors.cyan, '═══════════════════════════════════════════════════════════');
  console.log('\n');

  try {
    // 1. VERIFICAR CARPETA
    log(colors.blue, '1️⃣  VERIFICANDO CARPETA DE FOTOS');
    console.log('─────────────────────────────────────────────────────────────');
    
    const fotosPath = path.join(process.cwd(), 'public', 'fotos');
    console.log(`   Ruta: ${fotosPath}`);
    
    if (!fs.existsSync(fotosPath)) {
      log(colors.red, '   ❌ La carpeta no existe!');
      console.log('   Creando carpeta...');
      fs.mkdirSync(fotosPath, { recursive: true });
      log(colors.green, '   ✅ Carpeta creada');
    } else {
      log(colors.green, '   ✅ Carpeta existe');
      
      const archivos = fs.readdirSync(fotosPath);
      const imagenes = archivos.filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
      
      console.log(`   Total archivos: ${archivos.length}`);
      console.log(`   Imágenes: ${imagenes.length}`);
      
      if (imagenes.length > 0) {
        console.log('\n   Primeras 5 imágenes:');
        imagenes.slice(0, 5).forEach((img, i) => {
          const stats = fs.statSync(path.join(fotosPath, img));
          const tamañoKB = (stats.size / 1024).toFixed(2);
          console.log(`      ${i + 1}. ${img} (${tamañoKB} KB)`);
        });
      }
    }
    console.log('\n');

    // 2. OBTENER PRODUCTOS CON FOTOS
    log(colors.blue, '2️⃣  ANALIZANDO PRODUCTOS CON FOTOS');
    console.log('─────────────────────────────────────────────────────────────');
    
    const productos = await prisma.product.findMany({
      where: {
        status: 'AVAILABLE',
        images: { not: null },
      },
      select: {
        id: true,
        name: true,
        images: true,
        category: true,
      },
      orderBy: { name: 'asc' },
    });

    console.log(`   Total productos con fotos: ${productos.length}\n`);

    // 3. VERIFICAR CADA FOTO
    log(colors.blue, '3️⃣  VERIFICANDO CADA FOTO INDIVIDUALMENTE');
    console.log('─────────────────────────────────────────────────────────────\n');

    let totalFotos = 0;
    let fotosLocalesOK = 0;
    let fotosLocalesError = 0;
    let fotosExternas = 0;
    let fotosInvalidas = 0;

    const problemasDetallados = [];
    const fotosOK = [];

    for (const producto of productos) {
      let imagenes = [];
      
      try {
        if (typeof producto.images === 'string') {
          imagenes = JSON.parse(producto.images);
        } else if (Array.isArray(producto.images)) {
          imagenes = producto.images;
        }
      } catch (e) {
        console.log(`   ⚠️  ${producto.name}`);
        console.log(`      Error parseando JSON: ${e.message}\n`);
        continue;
      }

      if (!Array.isArray(imagenes) || imagenes.length === 0) {
        continue;
      }

      for (const img of imagenes) {
        totalFotos++;

        if (!img || typeof img !== 'string') {
          fotosInvalidas++;
          problemasDetallados.push({
            producto: producto.name,
            imagen: img,
            problema: 'URL inválida o vacía',
          });
          continue;
        }

        // URL externa
        if (img.startsWith('http://') || img.startsWith('https://')) {
          fotosExternas++;
          fotosOK.push({
            producto: producto.name,
            imagen: img,
            tipo: 'externa',
          });
          continue;
        }

        // URL local
        if (img.startsWith('/fotos/') || img.startsWith('/')) {
          const verificacion = verificarArchivoFisico(img);
          
          if (verificacion.existe) {
            fotosLocalesOK++;
            fotosOK.push({
              producto: producto.name,
              imagen: img,
              tipo: 'local',
              tamaño: verificacion.tamañoKB,
            });
          } else {
            fotosLocalesError++;
            problemasDetallados.push({
              producto: producto.name,
              imagen: img,
              problema: 'Archivo no existe en servidor',
              rutaCompleta: verificacion.rutaCompleta,
            });
          }
          continue;
        }

        // URL desconocida
        fotosInvalidas++;
        problemasDetallados.push({
          producto: producto.name,
          imagen: img,
          problema: 'Formato de URL desconocido',
        });
      }
    }

    // 4. MOSTRAR PROBLEMAS DETALLADOS
    if (problemasDetallados.length > 0) {
      log(colors.yellow, '4️⃣  PROBLEMAS ENCONTRADOS');
      console.log('─────────────────────────────────────────────────────────────\n');
      
      problemasDetallados.forEach((p, i) => {
        console.log(`   ${i + 1}. Producto: ${p.producto}`);
        console.log(`      Imagen: ${p.imagen}`);
        console.log(`      Problema: ${p.problema}`);
        if (p.rutaCompleta) {
          console.log(`      Ruta esperada: ${p.rutaCompleta}`);
        }
        console.log('');
      });
    }

    // 5. MOSTRAR FOTOS OK (MUESTRA)
    if (fotosOK.length > 0) {
      log(colors.green, '5️⃣  FOTOS VERIFICADAS OK (MUESTRA)');
      console.log('─────────────────────────────────────────────────────────────\n');
      
      fotosOK.slice(0, 10).forEach((f, i) => {
        console.log(`   ${i + 1}. ${f.producto}`);
        console.log(`      Tipo: ${f.tipo}`);
        console.log(`      URL: ${f.imagen}`);
        if (f.tamaño) {
          console.log(`      Tamaño: ${f.tamaño} KB`);
        }
        console.log('');
      });
      
      if (fotosOK.length > 10) {
        console.log(`   ... y ${fotosOK.length - 10} fotos más\n`);
      }
    }

    // 6. VERIFICAR PRODUCTOS ESPECÍFICOS
    log(colors.blue, '6️⃣  PRODUCTOS ESPECÍFICOS');
    console.log('─────────────────────────────────────────────────────────────\n');

    const productosEspecificos = [
      'piano',
      'portátil',
      'asus',
      'megapack',
    ];

    for (const keyword of productosEspecificos) {
      const prod = await prisma.product.findFirst({
        where: {
          name: { contains: keyword, mode: 'insensitive' },
          status: 'AVAILABLE',
        },
        select: {
          name: true,
          images: true,
        },
      });

      if (prod) {
        console.log(`   🔍 Buscando: "${keyword}"`);
        console.log(`   ✅ Encontrado: ${prod.name}`);
        
        let imgs = [];
        try {
          imgs = JSON.parse(prod.images || '[]');
        } catch (e) {}

        if (imgs.length > 0) {
          imgs.forEach((img, i) => {
            console.log(`      Foto ${i + 1}: ${img}`);
            
            if (img.startsWith('/')) {
              const verif = verificarArchivoFisico(img);
              console.log(`      Existe: ${verif.existe ? '✅' : '❌'}`);
              if (verif.existe) {
                console.log(`      Tamaño: ${verif.tamañoKB} KB`);
              } else {
                console.log(`      Ruta esperada: ${verif.rutaCompleta}`);
              }
            } else if (img.startsWith('http')) {
              console.log(`      Tipo: Externa (no verificada)`);
            }
          });
        } else {
          console.log(`      ⚠️  Sin fotos`);
        }
        console.log('');
      } else {
        console.log(`   ❌ No encontrado: "${keyword}"\n`);
      }
    }

    // 7. ESTADÍSTICAS FINALES
    log(colors.blue, '7️⃣  ESTADÍSTICAS FINALES');
    console.log('─────────────────────────────────────────────────────────────\n');
    
    console.log(`   Total fotos analizadas: ${totalFotos}`);
    console.log(`   ├── Fotos locales OK: ${fotosLocalesOK} (${((fotosLocalesOK / totalFotos) * 100).toFixed(1)}%)`);
    console.log(`   ├── Fotos locales ERROR: ${fotosLocalesError} (${((fotosLocalesError / totalFotos) * 100).toFixed(1)}%)`);
    console.log(`   ├── Fotos externas: ${fotosExternas} (${((fotosExternas / totalFotos) * 100).toFixed(1)}%)`);
    console.log(`   └── Fotos inválidas: ${fotosInvalidas} (${((fotosInvalidas / totalFotos) * 100).toFixed(1)}%)`);
    console.log('');

    const fotasOKTotal = fotosLocalesOK + fotosExternas;
    const tasaExito = ((fotasOKTotal / totalFotos) * 100).toFixed(1);
    
    console.log(`   Tasa de éxito: ${tasaExito}%`);
    console.log('');

    // 8. RESUMEN Y RECOMENDACIONES
    console.log('\n');
    log(colors.cyan, '═══════════════════════════════════════════════════════════');
    log(colors.cyan, '  RESUMEN Y RECOMENDACIONES');
    log(colors.cyan, '═══════════════════════════════════════════════════════════');
    console.log('');

    if (fotosLocalesError === 0 && fotosInvalidas === 0) {
      log(colors.green, '   🎉 ¡PERFECTO! Todas las fotos están OK');
      console.log('   ✅ Todas las fotos locales existen');
      console.log('   ✅ No hay URLs inválidas');
      console.log('   ✅ Sistema listo para enviar fotos por WhatsApp');
    } else {
      if (fotosLocalesError > 0) {
        log(colors.yellow, `   ⚠️  ${fotosLocalesError} fotos locales no existen`);
        console.log('   Acción: Agregar los archivos faltantes a /public/fotos/');
      }
      
      if (fotosInvalidas > 0) {
        log(colors.yellow, `   ⚠️  ${fotosInvalidas} URLs inválidas`);
        console.log('   Acción: Corregir las URLs en la base de datos');
      }
      
      if (parseFloat(tasaExito) >= 80) {
        console.log('');
        log(colors.green, '   ✅ Sistema funcional (>80% de fotos OK)');
        console.log('   Puedes usar el sistema, pero considera corregir los problemas');
      } else {
        console.log('');
        log(colors.red, '   ❌ Se requiere atención (<80% de fotos OK)');
        console.log('   Corrige los problemas antes de usar en producción');
      }
    }

    console.log('');
    log(colors.cyan, '═══════════════════════════════════════════════════════════');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
verificarFotosFisicasDetallado();
