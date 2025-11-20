import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarProductosDigitales() {
  console.log('🔍 Verificando productos digitales...\n');

  try {
    const usuario = await prisma.user.findUnique({
      where: { email: 'daveymena16@gmail.com' },
      include: {
        products: {
          where: {
            category: 'DIGITAL'
          },
          orderBy: {
            name: 'asc'
          }
        }
      }
    });

    if (!usuario) {
      console.error('❌ Usuario no encontrado');
      return;
    }

    console.log(`✅ Usuario: ${usuario.email}`);
    console.log(`📦 Productos digitales encontrados: ${usuario.products.length}\n`);

    console.log('📚 PRODUCTOS DIGITALES EN LA BASE DE DATOS:');
    console.log('='.repeat(60));
    
    usuario.products.forEach((p, i) => {
      console.log(`\n${i + 1}. ${p.name}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   💰 Precio: ${p.price.toLocaleString()} COP`);
      console.log(`   📅 Creado: ${new Date(p.createdAt).toLocaleDateString()}`);
    });

    // Lista de los 40 megapacks que deberían existir
    const megapacksCompletos = [
      'Mega Pack 01: Cursos Diseño Gráfico',
      'Mega Pack 02: Cursos Microsoft Office',
      'Mega Pack 03: Cursos Inglés',
      'Mega Pack 04: Cursos Excel',
      'Mega Pack 05: Cursos Hacking Ético',
      'Mega Pack 06: Cursos Programación',
      'Mega Pack 07: Cursos Marketing Digital',
      'Mega Pack 08: Cursos Fotografía',
      'Mega Pack 09: Cursos Video Edición',
      'Mega Pack 10: Cursos Música Producción',
      'Mega Pack 11: Cursos Marketing Digital',
      'Mega Pack 12: Cursos Emprendimiento',
      'Mega Pack 13: Cursos Finanzas Personales',
      'Mega Pack 14: Cursos Desarrollo Web',
      'Mega Pack 15: Cursos Inteligencia Artificial',
      'Mega Pack 16: Cursos Premium +900 GB',
      'Mega Pack 17: Cursos Idiomas',
      'Mega Pack 18: Reparación de teléfonos y tablets',
      'Mega Pack 19: WordPress',
      'Mega Pack 20: Cursos Cocina',
      'Mega Pack 21: Cursos Fitness',
      'Mega Pack 22: Cursos Yoga y Meditación',
      'Mega Pack 23: Cursos Belleza y Maquillaje',
      'Mega Pack 24: Cursos Arquitectura',
      'Mega Pack 25: Cursos Ingeniería',
      'Mega Pack 26: Cursos Medicina',
      'Mega Pack 27: Cursos Derecho',
      'Mega Pack 28: Cursos Contabilidad',
      'Mega Pack 29: Cursos Administración',
      'Mega Pack 30: Cursos Ventas',
      'Mega Pack 31: Cursos Liderazgo',
      'Mega Pack 32: Cursos Oratoria',
      'Mega Pack 33: Cursos Escritura Creativa',
      'Mega Pack 34: Plantillas Canva MEGA Pro',
      'Mega Pack 35: Cursos SEO',
      'Mega Pack 36: Cursos E-commerce',
      'Mega Pack 37: Marketing & Ventas',
      'Mega Pack 38: Redes Sociales',
      'Mega Pack 39: Trading',
      'Mega Pack 40: Cursos Completos',
      'PACK COMPLETO 40 Mega Packs',
      'Curso Completo de Piano Online'
    ];

    const nombresExistentes = usuario.products.map(p => p.name);
    const faltantes = megapacksCompletos.filter(nombre => 
      !nombresExistentes.some(existente => existente.includes(nombre.split(':')[0]))
    );

    console.log('\n\n❌ PRODUCTOS DIGITALES FALTANTES:');
    console.log('='.repeat(60));
    
    if (faltantes.length === 0) {
      console.log('✅ Todos los productos digitales están presentes');
    } else {
      faltantes.forEach((nombre, i) => {
        console.log(`${i + 1}. ${nombre}`);
      });
      
      console.log(`\n📊 Total faltantes: ${faltantes.length}`);
    }

    console.log('\n\n📊 RESUMEN:');
    console.log('='.repeat(60));
    console.log(`✅ Productos digitales en BD: ${usuario.products.length}`);
    console.log(`❌ Productos faltantes: ${faltantes.length}`);
    console.log(`📦 Total esperado: ${megapacksCompletos.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarProductosDigitales();
