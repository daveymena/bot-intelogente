import { PrismaClient as PrismaClientPostgres } from '@prisma/client';
import { PrismaClient as PrismaClientSQLite } from '@prisma/client';

// Conexión a PostgreSQL (antigua)
const postgresUrl = 'postgresql://postgres:password@157.173.97.41:5432/davey?sslmode=disable';
const prismaPostgres = new PrismaClientPostgres({
  datasources: {
    db: {
      url: postgresUrl
    }
  }
});

// Conexión a SQLite (nueva)
const prismaSQLite = new PrismaClientSQLite({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

async function migrarProductos() {
  try {
    console.log('🔄 Iniciando migración de productos...');
    
    // 1. Conectar y obtener productos de PostgreSQL
    console.log('📡 Conectando a PostgreSQL...');
    const productosPostgres = await prismaPostgres.product.findMany({
      where: {
        status: 'AVAILABLE'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`✅ Encontrados ${productosPostgres.length} productos en PostgreSQL`);
    
    if (productosPostgres.length === 0) {
      console.log('⚠️ No hay productos para migrar');
      return;
    }
    
    // 2. Migrar a SQLite
    console.log('💾 Migrando a SQLite...');
    let migrados = 0;
    let errores = 0;
    
    for (const producto of productosPostgres) {
      try {
        // Convertir arrays a strings JSON para SQLite
        const productData: any = {
          id: producto.id,
          name: producto.name,
          description: producto.description,
          price: producto.price,
          category: producto.category,
          status: producto.status,
          userId: producto.userId,
          images: typeof producto.images === 'string' ? producto.images : JSON.stringify(producto.images || []),
          stock: producto.stock,
          subcategory: producto.subcategory,
          createdAt: producto.createdAt,
          updatedAt: producto.updatedAt,
        };
        
        // Campos opcionales de categorización
        if (producto.mainCategory) productData.mainCategory = producto.mainCategory;
        if (producto.subCategory) productData.subCategory = producto.subCategory;
        if (producto.productTags) {
          productData.productTags = typeof producto.productTags === 'string' 
            ? producto.productTags 
            : JSON.stringify(producto.productTags || []);
        }
        if (producto.isAccessory !== undefined) productData.isAccessory = producto.isAccessory;
        if (producto.parentCategory) productData.parentCategory = producto.parentCategory;
        
        await prismaSQLite.product.create({
          data: productData
        });
        
        migrados++;
        console.log(`  ✅ ${migrados}/${productosPostgres.length}: ${producto.name}`);
      } catch (error: any) {
        errores++;
        console.error(`  ❌ Error migrando "${producto.name}":`, error.message);
      }
    }
    
    console.log('\n📊 Resumen de migración:');
    console.log(`  ✅ Migrados exitosamente: ${migrados}`);
    console.log(`  ❌ Errores: ${errores}`);
    console.log(`  📦 Total: ${productosPostgres.length}`);
    
    // 3. Verificar migración
    const totalSQLite = await prismaSQLite.product.count();
    console.log(`\n✅ Total de productos en SQLite: ${totalSQLite}`);
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    await prismaPostgres.$disconnect();
    await prismaSQLite.$disconnect();
  }
}

migrarProductos();
