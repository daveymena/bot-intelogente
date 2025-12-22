import { PrismaClient } from '@prisma/client';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function importarProductos() {
  try {
    console.log('📦 Iniciando importación de productos desde MÚLTIPLES JSON...\n');
    
    // 0. Asegurar que existe el usuario por defecto
    const defaultUserId = process.env.DEFAULT_USER_ID || 'default-user-id';
    let user = await prisma.user.findUnique({ where: { id: defaultUserId } });
    
    if (!user) {
        // Intentar buscar por email si el ID falla, o crear uno nuevo
        user = await prisma.user.findFirst();
        
        if (!user) {
            console.log('👤 Creando usuario por defecto...');
            user = await prisma.user.create({
                data: {
                    id: defaultUserId,
                    email: 'admin@davey.com',
                    name: 'Admin Davey',
                    password: 'hashed_password_placeholder', // Dummy password
                    phone: '573000000000',
                    role: 'ADMIN',
                    membershipType: 'PROFESSIONAL'
                }
            });
        }
    }
    console.log(`👤 Usando usuario: ${user.id}`);

    // Archivos a importar
    const archivos = [
      'catalogo-completo-68-productos-ACTUALIZADO.json',
      'productos-digitales-actualizados.json'
    ];

    let todosLosProductos: any[] = [];

    // Leer y combinar archivos
    for (const archivo of archivos) {
      const path = join(process.cwd(), archivo);
      if (existsSync(path)) {
        console.log(`📖 Leyendo ${archivo}...`);
        const datos = JSON.parse(readFileSync(path, 'utf-8'));
        console.log(`   -> Encontrados ${datos.length} productos.`);
        todosLosProductos = [...todosLosProductos, ...datos];
      } else {
        console.log(`⚠️ Archivo no encontrado: ${archivo}`);
      }
    }
    
    // Eliminar duplicados por nombre (dando prioridad al último encontrado)
    const productosMap = new Map();
    todosLosProductos.forEach(p => {
      productosMap.set(p.name.trim().toLowerCase(), p);
    });
    
    const productosUnicos = Array.from(productosMap.values());
    console.log(`\n✅ Total de productos únicos a importar: ${productosUnicos.length}\n`);
    
    let importados = 0;
    let errores = 0;
    
    for (const producto of productosUnicos) {
      try {
        // Verificar si ya existe por nombre para no duplicar en BD
        const existente = await prisma.product.findFirst({
          where: { name: producto.name }
        });

        if (existente) {
            console.log(`  ⚠️ Producto ya existe: "${producto.name}" - Saltando...`);
            continue;
        }

        // Generar ID único
        const productId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Preparar datos para SQLite
        const productData = {
          id: productId,
          name: producto.name,
          description: producto.description || '',
          price: producto.price,
          category: producto.category,
          status: producto.status || 'AVAILABLE',
          userId: user.id,
          images: JSON.stringify(producto.images || []),
          stock: producto.stock,
          
          // Categorización inteligente
          mainCategory: determinarCategoriaPrincipal(producto),
          productTags: JSON.stringify(producto.tags || []),
          isAccessory: esAccesorio(producto),
          parentCategory: esAccesorio(producto) ? 'LAPTOPS' : null,
          
          // Metadata
          categorizedAt: new Date(),
          categorizedBy: 'IMPORTACION_MASIVA',
          categorizationConfidence: 100,
          
          // Links de pago
          paymentLinkCustom: producto.paymentLinkCustom || null
        };
        
        await prisma.product.create({
          data: productData
        });
        
        importados++;
        console.log(`  ✅ Importado: ${producto.name}`);
        
      } catch (error: any) {
        errores++;
        console.error(`  ❌ Error importando "${producto.name}":`, error.message);
      }
    }
    
    console.log('\n📊 Resumen de importación:');
    console.log(`  ✅ Nuevos importados: ${importados}`);
    console.log(`  ❌ Errores: ${errores}`);
    
    // Verificar total en BD
    const totalBD = await prisma.product.count();
    console.log(`\n✅ Total de productos en base de datos: ${totalBD}`);
    
  } catch (error) {
    console.error('❌ Error en la importación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Función auxiliar para determinar categoría principal
function determinarCategoriaPrincipal(producto: any): string {
  if (producto.category === 'DIGITAL') return 'CURSOS_DIGITALES';
  
  const nombre = producto.name.toLowerCase();
  const tags = (producto.tags || []).map((t: string) => t.toLowerCase());
  
  if (nombre.includes('moto') || tags.includes('moto')) return 'VEHICULOS';
  if (nombre.includes('impresora') || tags.includes('impresora')) return 'COMPUTACIÓN'; // O IMPRESION
  if (nombre.includes('monitor') || tags.includes('monitor')) return 'COMPUTACIÓN';
  if (nombre.includes('laptop') || nombre.includes('portatil') || nombre.includes('portátil')) return 'COMPUTACIÓN';
  
  return 'TECNOLOGÍA'; // Default
}

// Función auxiliar para detectar accesorios
function esAccesorio(producto: any): boolean {
  const nombre = producto.name.toLowerCase();
  const accesorios = ['mouse', 'teclado', 'webcam', 'audifonos', 'audífonos', 'cable', 'adaptador', 'funda', 'cargador'];
  return accesorios.some(acc => nombre.includes(acc));
}

importarProductos();
