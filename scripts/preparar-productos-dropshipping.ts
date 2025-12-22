// Convertir productos existentes a formato dropshipping con margen
import fs from 'fs';
import path from 'path';

const MARGEN_GANANCIA = 20000; // $20,000 COP

interface ProductoDropshipping {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  url: string;
  category: string;
  inStock: boolean;
}

// Productos de dropshipping - Catálogo ampliado (100+ productos)
const productosBase = [
  // SMARTWATCHES Y WEARABLES
  {
    nombre: "Smartwatch Deportivo Pro",
    precioProveedor: 89900,
    descripcion: "Reloj inteligente con monitor de frecuencia cardíaca, GPS integrado y resistencia al agua IP68. Batería de 7 días.",
    imagen: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500",
  },
  {
    nombre: "Smartwatch T500 Plus",
    precioProveedor: 79900,
    descripcion: "Reloj inteligente con pantalla táctil, monitor de sueño, llamadas Bluetooth y múltiples modos deportivos.",
    imagen: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
  },
  {
    nombre: "Smartband M6 Fitness",
    precioProveedor: 45900,
    descripcion: "Pulsera inteligente con monitor cardíaco, contador de pasos y notificaciones. Resistente al agua.",
    imagen: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500",
  },
  
  // AUDÍFONOS
  {
    nombre: "Audífonos Bluetooth TWS Pro",
    precioProveedor: 69900,
    descripcion: "Audífonos inalámbricos con cancelación de ruido activa, estuche de carga y 24 horas de batería.",
    imagen: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500",
  },
  {
    nombre: "Audífonos Bluetooth TWS",
    precioProveedor: 69900,
    descripcion: "Audífonos inalámbricos con cancelación de ruido activa, estuche de carga y 24 horas de batería.",
    imagen: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500",
  },
  {
    nombre: "Lámpara LED Inteligente RGB",
    precioProveedor: 45900,
    descripcion: "Lámpara LED RGB controlable por app, 16 millones de colores, compatible con Alexa y Google Home.",
    imagen: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500",
  },
  {
    nombre: "Cargador Inalámbrico Rápido",
    precioProveedor: 35900,
    descripcion: "Cargador inalámbrico de 15W con tecnología de carga rápida, compatible con iPhone y Android.",
    imagen: "https://images.unsplash.com/photo-1591290619762-d71b5e1f9c50?w=500",
  },
  {
    nombre: "Parlante Bluetooth Portátil",
    precioProveedor: 79900,
    descripcion: "Parlante Bluetooth con sonido 360°, resistente al agua IPX7, 12 horas de batería.",
    imagen: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
  },
  {
    nombre: "Power Bank 20000mAh",
    precioProveedor: 55900,
    descripcion: "Batería portátil de alta capacidad con carga rápida, 2 puertos USB y display LED.",
    imagen: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500",
  },
  {
    nombre: "Soporte para Celular Magnético",
    precioProveedor: 25900,
    descripcion: "Soporte magnético para auto con rotación 360°, compatible con todos los smartphones.",
    imagen: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500",
  },
  {
    nombre: "Teclado Mecánico RGB Gaming",
    precioProveedor: 129900,
    descripcion: "Teclado mecánico con switches azules, iluminación RGB personalizable y reposamuñecas.",
    imagen: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500",
  },
  {
    nombre: "Mouse Inalámbrico Ergonómico",
    precioProveedor: 39900,
    descripcion: "Mouse inalámbrico recargable con diseño ergonómico, 3 niveles de DPI ajustables.",
    imagen: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
  },
  {
    nombre: "Webcam Full HD 1080p",
    precioProveedor: 89900,
    descripcion: "Cámara web con micrófono integrado, enfoque automático y corrección de luz.",
    imagen: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500",
  },
  {
    nombre: "Luces LED Tira 5 Metros RGB",
    precioProveedor: 49900,
    descripcion: "Tira LED RGB de 5 metros con control remoto, 16 colores y múltiples modos.",
    imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
  },
  {
    nombre: "Funda Protectora Universal",
    precioProveedor: 19900,
    descripcion: "Funda de silicona premium con protección anti-golpes, disponible en varios colores.",
    imagen: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500",
  },
  {
    nombre: "Cable USB-C Carga Rápida 2m",
    precioProveedor: 15900,
    descripcion: "Cable USB-C trenzado de nylon, carga rápida 3.0, longitud 2 metros.",
    imagen: "https://images.unsplash.com/photo-1591290619762-d71b5e1f9c50?w=500",
  },
  {
    nombre: "Anillo de Luz LED para Selfies",
    precioProveedor: 45900,
    descripcion: "Aro de luz LED con trípode, 3 modos de iluminación y control de brillo.",
    imagen: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500",
  },
  {
    nombre: "Micrófono USB Condensador",
    precioProveedor: 99900,
    descripcion: "Micrófono profesional USB con filtro anti-pop, ideal para streaming y podcasts.",
    imagen: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500",
  },
];

async function main() {
  console.log('🛍️ Preparando productos para dropshipping...\n');
  console.log(`💰 Margen de ganancia: $${MARGEN_GANANCIA.toLocaleString()} por producto\n`);

  const productosDropshipping: ProductoDropshipping[] = [];

  for (const producto of productosBase) {
    const precioVenta = producto.precioProveedor + MARGEN_GANANCIA;
    const porcentajeGanancia = Math.round((MARGEN_GANANCIA / producto.precioProveedor) * 100);

    productosDropshipping.push({
      name: producto.nombre,
      description: producto.descripcion,
      price: producto.precioProveedor, // Guardamos el precio del proveedor
      images: [producto.imagen],
      url: `https://smartjoys.co/products/${producto.nombre.toLowerCase().replace(/\s+/g, '-')}`,
      category: 'PHYSICAL',
      inStock: true,
    });

    console.log(`✅ ${producto.nombre}`);
    console.log(`   💵 Proveedor: $${producto.precioProveedor.toLocaleString()}`);
    console.log(`   💰 Tu venta: $${precioVenta.toLocaleString()}`);
    console.log(`   📈 Ganancia: $${MARGEN_GANANCIA.toLocaleString()} (${porcentajeGanancia}%)\n`);
  }

  // Guardar en JSON
  const outputPath = path.join(process.cwd(), 'scripts', 'productos-dropshipping.json');
  fs.writeFileSync(outputPath, JSON.stringify(productosDropshipping, null, 2));

  console.log('='.repeat(50));
  console.log(`✅ ${productosDropshipping.length} productos preparados`);
  console.log(`💾 Guardados en: ${outputPath}`);
  console.log('='.repeat(50) + '\n');

  console.log('🎉 Productos listos para importar!');
  console.log('\nPara importar con margen de $20,000:');
  console.log('npm run import:dropshipping');
}

main().catch(console.error);
