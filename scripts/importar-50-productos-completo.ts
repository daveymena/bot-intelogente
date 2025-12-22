import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ProductoImport {
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  stock: number;
  images?: string[];
  tags?: string[];
  isDigital?: boolean;
  deliveryInfo?: string;
  paymentMethods?: string[];
}

async function importarProductos() {
  try {
    console.log('🚀 Iniciando importación de 50 productos...\n');

    // Leer archivo JSON
    const filePath = path.join(__dirname, 'productos-completos.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const productos: ProductoImport[] = JSON.parse(fileContent);

    console.log(`📦 Productos encontrados: ${productos.length}\n`);

    // Obtener o crear usuario admin
    let user = await prisma.user.findFirst({
      where: { email: 'admin@smartsalesbot.com' }
    });

    if (!user) {
      console.log('👤 Creando usuario admin...');
      user = await prisma.user.create({
        data: {
          email: 'admin@smartsalesbot.com',
          name: 'Admin',
          password: 'hashed_password',
          emailVerified: true
        }
      });
    }

    console.log(`✅ Usuario: ${user.email}\n`);

    let importados = 0;
    let actualizados = 0;
    let errores = 0;

    for (const producto of productos) {
      try {
        // Verificar si el producto ya existe
        const existente = await prisma.product.findFirst({
          where: {
            name: producto.name,
            userId: user.id
          }
        });

        const productData = {
          name: producto.name,
          description: producto.description,
          price: producto.price,
          category: producto.category,
          subcategory: producto.subcategory || null,
          stock: producto.stock,
          images: producto.images || [],
          tags: producto.tags || [],
          isDigital: producto.isDigital || false,
          deliveryInfo: producto.deliveryInfo || null,
          paymentMethods: producto.paymentMethods || [],
          userId: user.id
        };

        if (existente) {
          // Actualizar producto existente
          await prisma.product.update({
            where: { id: existente.id },
            data: productData
          });
          actualizados++;
          console.log(`🔄 Actualizado: ${producto.name}`);
        } else {
          // Crear nuevo producto
          await prisma.product.create({
            data: productData
          });
          importados++;
          console.log(`✅ Importado: ${producto.name}`);
        }
      } catch (error) {
        errores++;
        console.error(`❌ Error con ${producto.name}:`, error);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE IMPORTACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Productos nuevos importados: ${importados}`);
    console.log(`🔄 Productos actualizados: ${actualizados}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📦 Total procesados: ${productos.length}`);
    console.log('='.repeat(60) + '\n');

    // Verificar total en base de datos
    const totalDB = await prisma.product.count({
      where: { userId: user.id }
    });
    console.log(`🗄️  Total de productos en base de datos: ${totalDB}\n`);

  } catch (error) {
    console.error('❌ Error fatal:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importarProductos();
