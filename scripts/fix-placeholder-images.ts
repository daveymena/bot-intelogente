import fs from 'fs';
import path from 'path';

interface Product {
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  status: string;
  images: string[];
  tags: string[];
  stock: number;
  paymentLinkMercadoPago: string;
  paymentLinkPayPal: string;
  paymentLinkCustom: string;
}

async function fixPlaceholderImages() {
  console.log('🔍 Leyendo catálogo...');
  
  const catalogPath = path.join(process.cwd(), 'catalogo-completo-importar.json');
  const catalogData = fs.readFileSync(catalogPath, 'utf-8');
  const products: Product[] = JSON.parse(catalogData);
  
  console.log(`📦 Total de productos: ${products.length}`);
  
  let fixedCount = 0;
  let placeholderCount = 0;
  
  for (const product of products) {
    const hasPlaceholder = product.images.some(img => 
      img.startsWith('data:image/svg+xml;base64')
    );
    
    if (hasPlaceholder) {
      placeholderCount++;
      console.log(`\n❌ Producto con placeholder: ${product.name}`);
      
      // Si tiene un link custom de MegaComputer, intentar extraer la imagen
      if (product.paymentLinkCustom && product.paymentLinkCustom.includes('megacomputer.com.co')) {
        console.log(`   🔗 Link: ${product.paymentLinkCustom}`);
        
        // Intentar construir URL de imagen basada en el patrón observado
        // La mayoría de productos tienen imágenes en formato:
        // https://megacomputer.com.co/wp-content/uploads/YYYY/MM/nombre-archivo.webp
        
        // Por ahora, marcar como sin imagen para que el sistema use placeholder genérico
        product.images = [];
        fixedCount++;
        console.log(`   ✅ Marcado para usar imagen genérica`);
      } else {
        product.images = [];
        fixedCount++;
        console.log(`   ✅ Marcado para usar imagen genérica`);
      }
    }
  }
  
  console.log(`\n📊 Resumen:`);
  console.log(`   - Productos con placeholder: ${placeholderCount}`);
  console.log(`   - Productos corregidos: ${fixedCount}`);
  
  // Guardar el catálogo actualizado
  const outputPath = path.join(process.cwd(), 'catalogo-completo-importar-fixed.json');
  fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf-8');
  
  console.log(`\n✅ Catálogo corregido guardado en: catalogo-completo-importar-fixed.json`);
  console.log(`\n💡 Ahora puedes importar este archivo actualizado`);
}

fixPlaceholderImages().catch(console.error);
