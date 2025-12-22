/**
 * 🧠 GENERADOR DE BASE DE CONOCIMIENTO
 * Genera knowledge-base.json desde los productos de la BD
 */

import { db } from '../src/lib/db';
import fs from 'fs';
import path from 'path';

interface KnowledgeBase {
  businessInfo: {
    name: string;
    description: string;
    phone: string;
    categories: string[];
  };
  paymentMethods: {
    online: Array<{ name: string; info: string }>;
    local: Array<{ name: string; number?: string; info: string }>;
  };
  products: Array<{
    id: number;
    name: string;
    price: number;
    category: string;
    description: string;
    tags: string[];
    keywords: string[];
  }>;
  responseTemplates: {
    greeting: string;
    singleProduct: string;
    multipleProducts: string;
    noProducts: string;
    paymentInfo: string;
  };
}

async function generateKnowledgeBase() {
  console.log('🧠 Generando base de conocimiento...\n');

  try {
    // 1. Cargar productos de la BD
    const products = await db.product.findMany({
      where: {
        status: 'AVAILABLE'
      },
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        description: true,
        tags: true,
        smartTags: true
      },
      take: 100
    });

    console.log(`📦 Productos cargados: ${products.length}`);

    // 2. Crear base de conocimiento
    const knowledgeBase: KnowledgeBase = {
      businessInfo: {
        name: 'Tecnovariedades D&S',
        description: 'Tu tienda de tecnología, cursos digitales y más',
        phone: '313 617 4267',
        categories: [
          'Laptops y Computadores',
          'Motos y Vehículos',
          'Cursos Digitales',
          'Megapacks de Contenido',
          'Accesorios Tecnológicos'
        ]
      },

      paymentMethods: {
        online: [
          {
            name: 'MercadoPago',
            info: 'Acepta tarjetas de crédito, débito y PSE'
          },
          {
            name: 'PayPal',
            info: 'Pagos internacionales seguros'
          }
        ],
        local: [
          {
            name: 'Nequi',
            number: '313 617 4267',
            info: 'Transferencia instantánea'
          },
          {
            name: 'Daviplata',
            number: '313 617 4267',
            info: 'Transferencia instantánea'
          },
          {
            name: 'Transferencia Bancaria',
            info: 'Banco Davivienda o Bancolombia'
          },
          {
            name: 'Efectivo',
            info: 'Contraentrega disponible'
          }
        ]
      },

      products: products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        description: p.description || '',
        tags: p.tags || [],
        keywords: [
          ...p.tags || [],
          ...p.smartTags || [],
          p.name.toLowerCase()
        ]
      })),

      responseTemplates: {
        greeting: `¡Hola! 👋 Bienvenido a **Tecnovariedades D&S**

Aquí encontrarás:
💻 Laptops y computadores
🏍️ Motos y vehículos
🎓 Cursos digitales y megapacks
📱 Accesorios tecnológicos

¿Qué estás buscando? 🔍`,

        singleProduct: `¡Hola! 👋 Bienvenido a **Tecnovariedades D&S**

{emoji} **{productName}**

{description}

💰 **Precio:** {price} COP

✨ **Características destacadas:**
• Excelente calidad
• Disponible inmediatamente
• Garantía incluida

📦 **Disponible ahora**

💳 **¿Cómo prefieres pagar?**
- MercadoPago / PayPal
- Nequi / Daviplata`,

        multipleProducts: `¡Hola! 👋 Bienvenido a **Tecnovariedades D&S**

Tengo estas opciones para ti:

{productList}

¿Cuál te interesa más? Dime el número 😊`,

        noProducts: `¡Hola! 👋 Bienvenido a **Tecnovariedades D&S**

No encontré productos específicos para esa búsqueda.

¿Quieres ver nuestras categorías?
💻 Laptops y computadores
🏍️ Motos
🎓 Cursos digitales
📱 Accesorios

¿Qué te interesa? 🔍`,

        paymentInfo: `💳 **Métodos de Pago Disponibles:**

🌐 **Online:**
• MercadoPago (tarjetas, PSE)
• PayPal (internacional)

📱 **Local:**
• Nequi: 313 617 4267
• Daviplata: 313 617 4267
• Transferencia bancaria
• Efectivo (contraentrega)

¿Con cuál método prefieres pagar? 😊`
      }
    };

    // 3. Guardar en archivo JSON
    const outputPath = path.join(process.cwd(), 'knowledge-base.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify(knowledgeBase, null, 2),
      'utf-8'
    );

    console.log(`\n✅ Base de conocimiento generada: ${outputPath}`);
    console.log(`\n📊 Estadísticas:`);
    console.log(`   Productos: ${knowledgeBase.products.length}`);
    console.log(`   Categorías: ${knowledgeBase.businessInfo.categories.length}`);
    console.log(`   Métodos de pago: ${knowledgeBase.paymentMethods.online.length + knowledgeBase.paymentMethods.local.length}`);
    console.log(`   Plantillas: ${Object.keys(knowledgeBase.responseTemplates).length}`);

    // 4. Generar versión compacta para Ollama
    const compactKB = {
      negocio: knowledgeBase.businessInfo.name,
      telefono: knowledgeBase.businessInfo.phone,
      productos: knowledgeBase.products.map(p => ({
        id: p.id,
        nombre: p.name,
        precio: p.price,
        categoria: p.category,
        descripcion: p.description.substring(0, 100)
      })),
      pagos: {
        online: knowledgeBase.paymentMethods.online.map(p => p.name),
        local: knowledgeBase.paymentMethods.local.map(p => `${p.name}${p.number ? ': ' + p.number : ''}`)
      },
      plantillas: knowledgeBase.responseTemplates
    };

    const compactPath = path.join(process.cwd(), 'knowledge-base-compact.json');
    fs.writeFileSync(
      compactPath,
      JSON.stringify(compactKB, null, 2),
      'utf-8'
    );

    console.log(`\n✅ Versión compacta generada: ${compactPath}`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Ejecutar
generateKnowledgeBase()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
