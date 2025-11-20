import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function insertarProductosFaltantes() {
  console.log('📦 Insertando productos digitales faltantes...\n');

  try {
    const usuario = await prisma.user.findUnique({
      where: { email: 'daveymena16@gmail.com' }
    });

    if (!usuario) {
      console.error('❌ Usuario no encontrado');
      return;
    }

    console.log(`✅ Usuario: ${usuario.email}\n`);

    // Productos digitales faltantes con descripciones
    const productosFaltantes = [
      {
        name: 'Mega Pack 06: Cursos Programación',
        description: '🎓 Mega Pack completo de Cursos de Programación\n\n✨ Incluye:\n• Python, JavaScript, Java, C++\n• Desarrollo Web Full Stack\n• Desarrollo de Apps Móviles\n• Bases de Datos\n• +50 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +100 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 07: Cursos Marketing Digital',
        description: '🎓 Mega Pack completo de Marketing Digital\n\n✨ Incluye:\n• SEO y SEM\n• Redes Sociales\n• Email Marketing\n• Google Ads y Facebook Ads\n• +40 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +80 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 08: Cursos Fotografía',
        description: '🎓 Mega Pack completo de Fotografía\n\n✨ Incluye:\n• Fotografía profesional\n• Edición con Lightroom y Photoshop\n• Fotografía de producto\n• Fotografía de retrato\n• +30 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +70 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 09: Cursos Video Edición',
        description: '🎓 Mega Pack completo de Edición de Video\n\n✨ Incluye:\n• Adobe Premiere Pro\n• After Effects\n• DaVinci Resolve\n• Final Cut Pro\n• +35 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +90 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 10: Cursos Música Producción',
        description: '🎓 Mega Pack completo de Producción Musical\n\n✨ Incluye:\n• FL Studio, Ableton Live\n• Mezcla y Masterización\n• Teoría Musical\n• Composición\n• +30 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +75 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 12: Cursos Emprendimiento',
        description: '🎓 Mega Pack completo de Emprendimiento\n\n✨ Incluye:\n• Creación de negocios\n• Plan de negocios\n• Financiamiento\n• Estrategias de crecimiento\n• +40 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +60 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 13: Cursos Finanzas Personales',
        description: '🎓 Mega Pack completo de Finanzas Personales\n\n✨ Incluye:\n• Inversiones\n• Ahorro e inversión\n• Criptomonedas\n• Bolsa de valores\n• +35 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +55 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 14: Cursos Desarrollo Web',
        description: '🎓 Mega Pack completo de Desarrollo Web\n\n✨ Incluye:\n• HTML, CSS, JavaScript\n• React, Vue, Angular\n• Node.js, PHP\n• WordPress avanzado\n• +50 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +120 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 15: Cursos Inteligencia Artificial',
        description: '🎓 Mega Pack completo de Inteligencia Artificial\n\n✨ Incluye:\n• Machine Learning\n• Deep Learning\n• ChatGPT y prompts\n• Python para IA\n• +40 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +85 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 17: Cursos Idiomas',
        description: '🎓 Mega Pack completo de Idiomas\n\n✨ Incluye:\n• Inglés (todos los niveles)\n• Francés, Alemán, Italiano\n• Portugués, Chino, Japonés\n• Métodos acelerados\n• +60 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +100 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 20: Cursos Cocina',
        description: '🎓 Mega Pack completo de Cocina\n\n✨ Incluye:\n• Cocina internacional\n• Repostería y panadería\n• Cocina saludable\n• Chef profesional\n• +40 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +70 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 21: Cursos Fitness',
        description: '🎓 Mega Pack completo de Fitness\n\n✨ Incluye:\n• Entrenamiento personal\n• Nutrición deportiva\n• Rutinas de ejercicio\n• Musculación\n• +35 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +60 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 22: Cursos Yoga y Meditación',
        description: '🎓 Mega Pack completo de Yoga y Meditación\n\n✨ Incluye:\n• Yoga para principiantes\n• Meditación guiada\n• Mindfulness\n• Relajación\n• +30 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +50 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 23: Cursos Belleza y Maquillaje',
        description: '🎓 Mega Pack completo de Belleza y Maquillaje\n\n✨ Incluye:\n• Maquillaje profesional\n• Cuidado de la piel\n• Peinados y estilismo\n• Uñas y manicure\n• +35 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +65 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 24: Cursos Arquitectura',
        description: '🎓 Mega Pack completo de Arquitectura\n\n✨ Incluye:\n• AutoCAD, Revit, SketchUp\n• Diseño arquitectónico\n• Renders 3D\n• Planos y proyectos\n• +40 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +95 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 25: Cursos Ingeniería',
        description: '🎓 Mega Pack completo de Ingeniería\n\n✨ Incluye:\n• Ingeniería civil\n• Ingeniería industrial\n• Ingeniería mecánica\n• Software especializado\n• +45 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +100 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 26: Cursos Medicina',
        description: '🎓 Mega Pack completo de Medicina\n\n✨ Incluye:\n• Anatomía y fisiología\n• Primeros auxilios\n• Enfermería\n• Medicina general\n• +40 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +85 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 27: Cursos Derecho',
        description: '🎓 Mega Pack completo de Derecho\n\n✨ Incluye:\n• Derecho civil y penal\n• Derecho laboral\n• Derecho comercial\n• Práctica jurídica\n• +35 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +70 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 28: Cursos Contabilidad',
        description: '🎓 Mega Pack completo de Contabilidad\n\n✨ Incluye:\n• Contabilidad básica y avanzada\n• Finanzas corporativas\n• Auditoría\n• Software contable\n• +40 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +75 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 29: Cursos Administración',
        description: '🎓 Mega Pack completo de Administración\n\n✨ Incluye:\n• Administración de empresas\n• Gestión de proyectos\n• Recursos humanos\n• Logística\n• +40 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +70 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 30: Cursos Ventas',
        description: '🎓 Mega Pack completo de Ventas\n\n✨ Incluye:\n• Técnicas de ventas\n• Negociación\n• Cierre de ventas\n• Ventas por teléfono\n• +35 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +60 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 31: Cursos Liderazgo',
        description: '🎓 Mega Pack completo de Liderazgo\n\n✨ Incluye:\n• Liderazgo empresarial\n• Gestión de equipos\n• Coaching\n• Motivación\n• +35 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +65 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 32: Cursos Oratoria',
        description: '🎓 Mega Pack completo de Oratoria\n\n✨ Incluye:\n• Hablar en público\n• Comunicación efectiva\n• Presentaciones impactantes\n• Lenguaje corporal\n• +30 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +55 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 33: Cursos Escritura Creativa',
        description: '🎓 Mega Pack completo de Escritura Creativa\n\n✨ Incluye:\n• Novelas y cuentos\n• Guiones de cine y TV\n• Copywriting\n• Redacción profesional\n• +35 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +60 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 35: Cursos SEO',
        description: '🎓 Mega Pack completo de SEO\n\n✨ Incluye:\n• SEO técnico y on-page\n• Link building\n• SEO local\n• Herramientas SEO\n• +30 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +50 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 36: Cursos E-commerce',
        description: '🎓 Mega Pack completo de E-commerce\n\n✨ Incluye:\n• Tiendas online\n• Shopify, WooCommerce\n• Dropshipping\n• Marketing para e-commerce\n• +40 cursos premium\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +75 GB de contenido',
        price: 20000
      },
      {
        name: 'Mega Pack 40: Cursos Completos',
        description: '🎓 Mega Pack DEFINITIVO - Todos los Cursos\n\n✨ Incluye:\n• Recopilación de los mejores cursos\n• Más de 500 cursos premium\n• Todas las categorías\n• Contenido actualizado 2024\n• +200 GB de contenido\n\n📦 Entrega: Inmediata por Google Drive\n💾 Tamaño: +200 GB de contenido',
        price: 20000
      }
    ];

    let insertados = 0;

    for (const producto of productosFaltantes) {
      try {
        await prisma.product.create({
          data: {
            name: producto.name,
            description: producto.description,
            price: producto.price,
            currency: 'COP',
            category: 'DIGITAL',
            subcategory: 'Cursos Digitales',
            status: 'AVAILABLE',
            images: '[]',
            tags: '["megapack","curso","digital","educación","online"]',
            userId: usuario.id
          }
        });

        console.log(`✅ ${producto.name}`);
        insertados++;
      } catch (error: any) {
        console.error(`❌ Error con ${producto.name}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN');
    console.log('='.repeat(60));
    console.log(`✅ Productos insertados: ${insertados}`);
    console.log(`📦 Total esperado: ${productosFaltantes.length}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

insertarProductosFaltantes();
