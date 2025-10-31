import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function actualizarProductos() {
  try {
    console.log('🔄 Actualizando productos con imágenes...\n');

    const productosPath = path.join(process.cwd(), 'scripts', 'productos-completos.json');
    const productosData = JSON.parse(fs.readFileSync(productosPath, 'utf-8'));

    let actualizados = 0;
    let creados = 0;

    // Procesar laptops ASUS VivoBook
    if (productosData.categorias?.productos_tecnologicos?.productos?.laptops?.asus_vivobook?.modelos) {
      for (const modelo of productosData.categorias.productos_tecnologicos.productos.laptops.asus_vivobook.modelos) {
        if (modelo.imagenes && modelo.imagenes.length > 0) {
          const nombre = `ASUS VivoBook GO 15 - ${modelo.procesador} ${modelo.ram} ${modelo.almacenamiento}`;
          const descripcion = `Laptop ASUS VivoBook GO 15 con procesador ${modelo.procesador}, ${modelo.ram} RAM, ${modelo.almacenamiento} de almacenamiento, pantalla ${modelo.pantalla}, color ${modelo.color}`;

          // Buscar si existe un producto con este nombre
          const existente = await prisma.product.findFirst({
            where: { name: nombre }
          });

          const producto = existente 
            ? await prisma.product.update({
                where: { id: existente.id },
                data: {
                  description: descripcion,
                  price: modelo.precio,
                  stock: 5,
                  category: 'PHYSICAL',
                  images: JSON.stringify(modelo.imagenes),
                  tags: JSON.stringify([modelo.codigo, 'laptop', 'asus', 'vivobook']),
                },
              })
            : await prisma.product.create({
                data: {
                  name: nombre,
                  description: descripcion,
                  price: modelo.precio,
                  stock: 5,
                  category: 'PHYSICAL',
                  images: JSON.stringify(modelo.imagenes),
                  tags: JSON.stringify([modelo.codigo, 'laptop', 'asus', 'vivobook']),
                  userId: (await prisma.user.findFirst())!.id,
                },
              });

          if (producto) {
            actualizados++;
            console.log(`✅ ${modelo.codigo}: ${nombre}`);
          }
        }
      }
    }

    // Procesar MacBook
    if (productosData.categorias?.productos_tecnologicos?.productos?.laptops?.apple?.modelos) {
      for (const modelo of productosData.categorias.productos_tecnologicos.productos.laptops.apple.modelos) {
        if (modelo.imagenes && modelo.imagenes.length > 0) {
          const nombre = `MacBook Pro ${modelo.procesador} ${modelo.ram} ${modelo.almacenamiento}`;
          const descripcion = `MacBook Pro con chip ${modelo.procesador}, ${modelo.ram} RAM, ${modelo.almacenamiento} de almacenamiento, pantalla ${modelo.pantalla}, color ${modelo.color}`;

          const existente = await prisma.product.findFirst({
            where: { name: nombre }
          });

          const producto = existente 
            ? await prisma.product.update({
                where: { id: existente.id },
                data: {
                  description: descripcion,
                  price: modelo.precio,
                  stock: 2,
                  category: 'PHYSICAL',
                  images: JSON.stringify(modelo.imagenes),
                  tags: JSON.stringify([modelo.codigo, 'laptop', 'macbook', 'apple']),
                },
              })
            : await prisma.product.create({
                data: {
                  name: nombre,
                  description: descripcion,
                  price: modelo.precio,
                  stock: 2,
                  category: 'PHYSICAL',
                  images: JSON.stringify(modelo.imagenes),
                  tags: JSON.stringify([modelo.codigo, 'laptop', 'macbook', 'apple']),
                  userId: (await prisma.user.findFirst())!.id,
                },
              });

          if (producto) {
            actualizados++;
            console.log(`✅ ${modelo.codigo}: ${nombre}`);
          }
        }
      }
    }

    // Procesar motos
    if (productosData.categorias?.vehiculos?.productos?.motos) {
      for (const moto of productosData.categorias.vehiculos.productos.motos) {
        if (moto.imagenes && moto.imagenes.length > 0) {
          const nombre = `${moto.marca} ${moto.modelo} ${moto.año}`;
          const descripcion = `${moto.marca} ${moto.modelo} ${moto.año}, ${moto.cilindraje}, ${moto.caracteristicas.join(', ')}`;

          const existente = await prisma.product.findFirst({
            where: { name: nombre }
          });

          const producto = existente 
            ? await prisma.product.update({
                where: { id: existente.id },
                data: {
                  description: descripcion,
                  price: moto.precio,
                  stock: 1,
                  category: 'PHYSICAL',
                  images: JSON.stringify(moto.imagenes),
                  tags: JSON.stringify([moto.id, 'moto', 'bajaj', 'pulsar']),
                },
              })
            : await prisma.product.create({
                data: {
                  name: nombre,
                  description: descripcion,
                  price: moto.precio,
                  stock: 1,
                  category: 'PHYSICAL',
                  images: JSON.stringify(moto.imagenes),
                  tags: JSON.stringify([moto.id, 'moto', 'bajaj', 'pulsar']),
                  userId: (await prisma.user.findFirst())!.id,
                },
              });

          if (producto) {
            actualizados++;
            console.log(`✅ ${moto.id}: ${nombre}`);
          }
        }
      }
    }

    console.log(`\n📊 RESUMEN:`);
    console.log(`✅ Productos actualizados/creados: ${actualizados}`);
    console.log(`\n✨ Base de datos actualizada con éxito!`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

actualizarProductos();
