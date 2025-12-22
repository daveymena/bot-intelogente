import { db } from '../src/lib/db';

async function main() {
  const producto = await db.product.findFirst({
    where: {
      name: {
        contains: 'Piano',
        mode: 'insensitive',
      },
    },
  });

  if (producto) {
    console.log('Producto encontrado:', producto.name);
    console.log('Category:', producto.category);
    console.log('Subcategory:', producto.subcategory);
    console.log('Type:', producto.type);
  } else {
    console.log('No se encontró el producto');
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
