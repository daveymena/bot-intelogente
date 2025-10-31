// Script para explorar y obtener productos de tiendas en Dropi
import puppeteer from 'puppeteer';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface DropiProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: string;
  supplier: string;
  sku: string;
  inStock: boolean;
  shippingTime?: string;
  storeUrl?: string;
}

interface DropiStore {
  name: string;
  url: string;
  category: string;
  productsCount: number;
}

// Tiendas populares en Dropi (puedes agregar más)
const TIENDAS_RECOMENDADAS = [
  'https://app.dropi.co/store/smartjoys',
  'https://app.dropi.co/store/techstore',
  'https://app.dropi.co/store/gadgetscol',
  'https://app.dropi.co/store/hogarplus',
];

async function buscarProductosDropi(categoria: string, limite: number = 50): Promise<DropiProduct[]> {
  try {
    console.log(`🔍 Buscando productos en categoría: ${categoria}`);

    // Nota: Dropi puede requerir API key para acceso completo
    // Si tienes una cuenta, agrega tu API key aquí
    const apiKey = process.env.DROPI_API_KEY || '';

    const response = await axios.get(`${DROPI_API_BASE}/products`, {
      params: {
        category: categoria,
        limit: limite,
        country: 'CO', // Colombia
      },
      headers: apiKey ? {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      } : {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    const products: DropiProduct[] = response.data.products || [];
    console.log(`   ✅ Encontrados ${products.length} productos`);
    
    return products;

  } catch (error: any) {
    if (error.response?.status === 401) {
      console.error(`   ❌ Error de autenticación. Necesitas una API key de Dropi.`);
      console.log(`   💡 Regístrate en https://dropi.co y obtén tu API key`);
    } else {
      console.error(`   ❌ Error: ${error.message}`);
    }
    return [];
  }
}

// Alternativa: Scrapear el catálogo público de Dropi
async function scrapearCatalogoPublico(): Promise<DropiProduct[]> {
  console.log('🌐 Intentando obtener productos del catálogo público...\n');

  const productos: DropiProduct[] = [];
  
  // URLs públicas de proveedores en Dropi
  const urlsPublicas = [
    'https://dropi.co/productos',
    'https://dropi.co/catalogo',
  ];

  for (const url of urlsPublicas) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 15000,
      });

      // Aquí iría el parsing del HTML si la página es pública
      console.log(`✅ Accedido: ${url}`);
      
    } catch (error) {
      console.log(`⚠️  No se pudo acceder a ${url}`);
    }
  }

  return productos;
}

// Función para obtener productos de ejemplo (demo)
function obtenerProductosDemo(): DropiProduct[] {
  return [
    {
      id: 'demo-1',
      name: 'Smartwatch Deportivo Pro',
      description: 'Reloj inteligente con monitor de frecuencia cardíaca, GPS integrado y resistencia al agua IP68. Batería de 7 días.',
      price: 129900,
      comparePrice: 199900,
      images: [
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500',
      ],
      category: 'Tecnología',
      supplier: 'Dropi',
      sku: 'SMART-001',
      inStock: true,
      shippingTime: '3-5 días hábiles',
    },
    {
      id: 'demo-2',
      name: 'Audífonos Bluetooth TWS',
      description: 'Audífonos inalámbricos con cancelación de ruido activa, estuche de carga y 24 horas de batería.',
      price: 89900,
      comparePrice: 149900,
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500',
      ],
      category: 'Tecnología',
      supplier: 'Dropi',
      sku: 'AUD-001',
      inStock: true,
      shippingTime: '3-5 días hábiles',
    },
    {
      id: 'demo-3',
      name: 'Lámpara LED Inteligente',
      description: 'Lámpara LED RGB controlable por app, 16 millones de colores, compatible con Alexa y Google Home.',
      price: 59900,
      comparePrice: 89900,
      images: [
        'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500',
      ],
      category: 'Hogar',
      supplier: 'Dropi',
      sku: 'LED-001',
      inStock: true,
      shippingTime: '3-5 días hábiles',
    },
  ];
}

async function main() {
  console.log('🚀 Iniciando obtención de productos Dropi...\n');

  let todosLosProductos: DropiProduct[] = [];

  // Verificar si hay API key configurada
  const apiKey = process.env.DROPI_API_KEY;

  if (apiKey) {
    console.log('✅ API Key de Dropi detectada\n');
    
    // Obtener productos por categoría
    for (const categoria of CATEGORIAS) {
      const productos = await buscarProductosDropi(categoria, 20);
      todosLosProductos = [...todosLosProductos, ...productos];
      
      // Pausa entre requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } else {
    console.log('⚠️  No se encontró API Key de Dropi');
    console.log('📝 Para obtener productos reales:');
    console.log('   1. Regístrate en https://dropi.co');
    console.log('   2. Obtén tu API key');
    console.log('   3. Agrégala al .env: DROPI_API_KEY=tu_key_aqui\n');
    
    // Intentar catálogo público
    const productosPublicos = await scrapearCatalogoPublico();
    
    if (productosPublicos.length > 0) {
      todosLosProductos = productosPublicos;
    } else {
      console.log('📦 Usando productos de demostración...\n');
      todosLosProductos = obtenerProductosDemo();
    }
  }

  // Remover duplicados
  const productosUnicos = Array.from(
    new Map(todosLosProductos.map(p => [p.id, p])).values()
  );

  console.log(`\n✅ Total de productos únicos: ${productosUnicos.length}`);

  // Guardar en JSON
  const outputPath = path.join(process.cwd(), 'scripts', 'dropi-productos.json');
  fs.writeFileSync(outputPath, JSON.stringify(productosUnicos, null, 2));
  console.log(`💾 Productos guardados en: ${outputPath}`);

  console.log('\n✨ Proceso completado!');
  console.log('\nPara importar a la base de datos:');
  console.log('npx tsx scripts/import-dropi.ts');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
