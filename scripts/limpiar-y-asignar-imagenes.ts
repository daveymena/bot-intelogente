import fs from 'fs';
import path from 'path';

// Leer el JSON de productos
const productosPath = path.join(process.cwd(), 'scripts', 'productos-completos.json');
const fotosPath = path.join(process.cwd(), 'public', 'fotos');

const productosData = JSON.parse(fs.readFileSync(productosPath, 'utf-8'));

// Función para normalizar nombres (quitar acentos, espacios, etc.)
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9]/g, '_') // Reemplazar caracteres especiales
    .replace(/_+/g, '_') // Múltiples guiones bajos a uno solo
    .replace(/^_|_$/g, ''); // Quitar guiones al inicio/fin
}

// Leer todas las imágenes disponibles
const imagenesDisponibles = fs.readdirSync(fotosPath)
  .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

console.log(`📸 Encontradas ${imagenesDisponibles.length} imágenes en public/fotos`);

// Función para buscar imágenes que coincidan con un producto
function buscarImagenes(nombreProducto: string, codigo?: string): string[] {
  const nombreNormalizado = normalizar(nombreProducto);
  const codigoNormalizado = codigo ? normalizar(codigo) : '';
  
  const imagenesCoincidentes = imagenesDisponibles.filter(img => {
    const imgNormalizada = normalizar(img);
    return imgNormalizada.includes(nombreNormalizado.substring(0, 20)) || 
           (codigoNormalizado && imgNormalizada.includes(codigoNormalizado));
  });

  // Agrupar por nombre base (sin el número al final)
  const grupos: { [key: string]: string[] } = {};
  imagenesCoincidentes.forEach(img => {
    const base = img.replace(/_\d+\.(jpg|jpeg|png|webp)$/i, '');
    if (!grupos[base]) grupos[base] = [];
    grupos[base].push(img);
  });

  // Tomar el primer grupo encontrado
  const primerGrupo = Object.values(grupos)[0] || [];
  return primerGrupo.map(img => `/fotos/${img}`);
}

// Contador de productos procesados
let productosConImagenes = 0;
let productosSinImagenes = 0;

// Procesar laptops ASUS VivoBook
if (productosData.categorias?.productos_tecnologicos?.productos?.laptops?.asus_vivobook?.modelos) {
  productosData.categorias.productos_tecnologicos.productos.laptops.asus_vivobook.modelos.forEach((modelo: any) => {
    const nombre = `portatil asus vivobook ${modelo.procesador}`;
    const imagenes = buscarImagenes(nombre, modelo.codigo);
    if (imagenes.length > 0) {
      modelo.imagenes = imagenes;
      productosConImagenes++;
      console.log(`✅ ${modelo.codigo}: ${imagenes.length} imágenes asignadas`);
    } else {
      productosSinImagenes++;
      console.log(`❌ ${modelo.codigo}: Sin imágenes`);
    }
  });
}

// Procesar laptops HP
if (productosData.categorias?.productos_tecnologicos?.productos?.laptops?.hp?.modelos) {
  productosData.categorias.productos_tecnologicos.productos.laptops.hp.modelos.forEach((modelo: any) => {
    const nombre = `portatil hp ${modelo.procesador}`;
    const imagenes = buscarImagenes(nombre, modelo.codigo);
    if (imagenes.length > 0) {
      modelo.imagenes = imagenes;
      productosConImagenes++;
      console.log(`✅ ${modelo.codigo}: ${imagenes.length} imágenes asignadas`);
    } else {
      productosSinImagenes++;
      console.log(`❌ ${modelo.codigo}: Sin imágenes`);
    }
  });
}

// Procesar laptops Lenovo
if (productosData.categorias?.productos_tecnologicos?.productos?.laptops?.lenovo?.modelos) {
  productosData.categorias.productos_tecnologicos.productos.laptops.lenovo.modelos.forEach((modelo: any) => {
    const nombre = `portatil lenovo ${modelo.procesador}`;
    const imagenes = buscarImagenes(nombre, modelo.codigo);
    if (imagenes.length > 0) {
      modelo.imagenes = imagenes;
      productosConImagenes++;
      console.log(`✅ ${modelo.codigo}: ${imagenes.length} imágenes asignadas`);
    } else {
      productosSinImagenes++;
      console.log(`❌ ${modelo.codigo}: Sin imágenes`);
    }
  });
}

// Procesar MacBook
if (productosData.categorias?.productos_tecnologicos?.productos?.laptops?.apple?.modelos) {
  productosData.categorias.productos_tecnologicos.productos.laptops.apple.modelos.forEach((modelo: any) => {
    const imagenes = buscarImagenes('macbook pro m4', modelo.codigo);
    if (imagenes.length > 0) {
      modelo.imagenes = imagenes;
      productosConImagenes++;
      console.log(`✅ ${modelo.codigo}: ${imagenes.length} imágenes asignadas`);
    } else {
      productosSinImagenes++;
      console.log(`❌ ${modelo.codigo}: Sin imágenes`);
    }
  });
}

// Procesar motos
if (productosData.categorias?.vehiculos?.productos?.motos) {
  productosData.categorias.vehiculos.productos.motos.forEach((moto: any) => {
    const imagenes = buscarImagenes('moto', moto.id);
    if (imagenes.length > 0) {
      moto.imagenes = imagenes;
      productosConImagenes++;
      console.log(`✅ ${moto.id}: ${imagenes.length} imágenes asignadas`);
    } else {
      productosSinImagenes++;
      console.log(`❌ ${moto.id}: Sin imágenes`);
    }
  });
}

// Guardar el JSON actualizado
fs.writeFileSync(productosPath, JSON.stringify(productosData, null, 2), 'utf-8');

console.log('\n📊 RESUMEN:');
console.log(`✅ Productos con imágenes: ${productosConImagenes}`);
console.log(`❌ Productos sin imágenes: ${productosSinImagenes}`);
console.log(`\n💾 Archivo actualizado: ${productosPath}`);
