/**
 * Búsqueda de productos
 * Simple y efectiva
 */

import { db } from '@/lib/db';
import { Product } from '../types';

export async function searchProduct(query: string): Promise<Product | null> {
  try {
    console.log('[Products] 🔍 Buscando:', query);

    const queryLower = query.toLowerCase();
    
    // Extraer palabras clave
    const keywords = queryLower
      .replace(/[¿?¡!.,;]/g, ' ')
      .split(' ')
      .filter(w => w.length > 2 && !['para', 'con', 'por', 'los', 'las', 'del', 'una', 'uno', 'que'].includes(w));

    if (keywords.length === 0) {
      return null;
    }

    console.log('[Products] 📝 Keywords:', keywords);

    // Buscar en BD
    const products = await db.product.findMany({
      where: {
        AND: [
          {
            OR: keywords.map(kw => ({
              OR: [
                { name: { contains: kw, mode: 'insensitive' } },
                { description: { contains: kw, mode: 'insensitive' } },
              ]
            }))
          },
          { status: 'AVAILABLE' }
        ]
      },
      take: 5,
    });

    if (products.length === 0) {
      console.log('[Products] ❌ No encontrado');
      return null;
    }

    // Calcular relevancia
    const scored = products.map(p => {
      let score = 0;
      const nameLower = p.name.toLowerCase();
      keywords.forEach(kw => {
        if (nameLower.includes(kw)) score += 3;
      });
      return { product: p, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const best = scored[0].product;
    console.log('[Products] ✅ Encontrado:', best.name);

    return {
      id: best.id,
      name: best.name,
      price: best.price,
      description: best.description,
      category: best.category,
      stock: best.stock,
      images: best.images,
    };
  } catch (error) {
    console.error('[Products] Error:', error);
    return null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const product = await db.product.findUnique({ where: { id } });
    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      stock: product.stock,
      images: product.images,
    };
  } catch (error) {
    console.error('[Products] Error obteniendo por ID:', error);
    return null;
  }
}
