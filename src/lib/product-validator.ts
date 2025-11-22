/**
 * ✅ PRODUCT VALIDATOR
 * 
 * Valida que los productos existan en la base de datos ANTES de sugerirlos
 * Soluciona el problema de productos incorrectos o inventados
 * 
 * Características:
 * - Búsqueda exacta y fuzzy
 * - Validación de disponibilidad
 * - Top N productos por categoría
 * - Compatible con SaaS (cualquier catálogo)
 */

import { db } from './db';
import { Product } from '@prisma/client';

export class ProductValidator {
  /**
   * Buscar productos por categoría (Top 3)
   */
  static async findByCategory(
    category: string,
    userId: string,
    limit: number = 3
  ): Promise<Product[]> {
    try {
      console.log(`🔍 [VALIDATOR] Buscando productos en categoría: ${category}`);

      // Normalizar categoría
      const normalizedCategory = category.toLowerCase().trim();

      // Buscar productos (sin contains en enums)
      const products = await db.product.findMany({
        where: {
          userId,
          status: 'AVAILABLE',
          OR: [
            { name: { contains: normalizedCategory, mode: 'insensitive' as const } },
            { description: { contains: normalizedCategory, mode: 'insensitive' as const } },
            { customCategory: { contains: normalizedCategory, mode: 'insensitive' as const } },
            { tags: { contains: normalizedCategory, mode: 'insensitive' as const } }
          ]
        },
        orderBy: [
          { searchPriority: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit
      });

      console.log(`✅ [VALIDATOR] ${products.length} productos encontrados`);
      return products;
    } catch (error) {
      console.error('❌ [VALIDATOR] Error buscando por categoría:', error);
      return [];
    }
  }

  /**
   * Buscar producto específico por nombre
   */
  static async findSpecific(
    query: string,
    userId: string
  ): Promise<Product | null> {
    try {
      console.log(`🔍 [VALIDATOR] Buscando producto específico: ${query}`);

      const normalizedQuery = query.toLowerCase().trim();

      // Búsqueda exacta primero
      let product = await db.product.findFirst({
        where: {
          userId,
          status: 'AVAILABLE',
          name: { equals: query, mode: 'insensitive' as const }
        }
      });

      // Si no encuentra, búsqueda fuzzy
      if (!product) {
        product = await db.product.findFirst({
          where: {
            userId,
            status: 'AVAILABLE',
            OR: [
              { name: { contains: normalizedQuery, mode: 'insensitive' as const } },
              { description: { contains: normalizedQuery, mode: 'insensitive' as const } },
              { tags: { contains: normalizedQuery, mode: 'insensitive' as const } }
            ]
          },
          orderBy: { searchPriority: 'desc' }
        });
      }

      if (product) {
        console.log(`✅ [VALIDATOR] Producto encontrado: ${product.name}`);
      } else {
        console.log(`❌ [VALIDATOR] Producto no encontrado`);
      }

      return product;
    } catch (error) {
      console.error('❌ [VALIDATOR] Error buscando producto:', error);
      return null;
    }
  }

  /**
   * Buscar múltiples productos por query general
   */
  static async search(
    query: string,
    userId: string,
    limit: number = 3
  ): Promise<Product[]> {
    try {
      console.log(`🔍 [VALIDATOR] Búsqueda general: ${query}`);

      const normalizedQuery = query.toLowerCase().trim();
      const keywords = normalizedQuery.split(' ').filter(w => w.length > 2);

      const products = await db.product.findMany({
        where: {
          userId,
          status: 'AVAILABLE',
          OR: [
            { name: { contains: normalizedQuery, mode: 'insensitive' as const } },
            { description: { contains: normalizedQuery, mode: 'insensitive' as const } },
            { customCategory: { contains: normalizedQuery, mode: 'insensitive' as const } },
            { tags: { contains: normalizedQuery, mode: 'insensitive' as const } },
            ...keywords.map(keyword => ({
              OR: [
                { name: { contains: keyword, mode: 'insensitive' as const } },
                { description: { contains: keyword, mode: 'insensitive' as const } },
                { tags: { contains: keyword, mode: 'insensitive' as const } }
              ]
            }))
          ]
        },
        orderBy: [
          { searchPriority: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit
      });

      console.log(`✅ [VALIDATOR] ${products.length} productos encontrados`);
      return products;
    } catch (error) {
      console.error('❌ [VALIDATOR] Error en búsqueda:', error);
      return [];
    }
  }

  /**
   * Verificar disponibilidad de producto
   */
  static async checkAvailability(productId: string): Promise<boolean> {
    try {
      const product = await db.product.findUnique({
        where: { id: productId },
        select: { status: true, stock: true }
      });

      if (!product) return false;
      if (product.status !== 'AVAILABLE') return false;
      if (product.stock !== null && product.stock <= 0) return false;

      return true;
    } catch (error) {
      console.error('❌ [VALIDATOR] Error verificando disponibilidad:', error);
      return false;
    }
  }

  /**
   * Validar lista de nombres de productos
   * Retorna solo los que existen en BD
   */
  static async validateProductNames(
    productNames: string[],
    userId: string
  ): Promise<Product[]> {
    try {
      console.log(`🔍 [VALIDATOR] Validando ${productNames.length} productos`);

      const validProducts: Product[] = [];

      for (const name of productNames) {
        const product = await this.findSpecific(name, userId);
        if (product) {
          validProducts.push(product);
        }
      }

      console.log(`✅ [VALIDATOR] ${validProducts.length}/${productNames.length} productos válidos`);
      return validProducts;
    } catch (error) {
      console.error('❌ [VALIDATOR] Error validando productos:', error);
      return [];
    }
  }

  /**
   * Obtener productos relacionados
   */
  static async getRelated(
    productId: string,
    userId: string,
    limit: number = 3
  ): Promise<Product[]> {
    try {
      const product = await db.product.findUnique({
        where: { id: productId }
      });

      if (!product) return [];

      // Buscar productos de la misma categoría
      const related = await db.product.findMany({
        where: {
          userId,
          status: 'AVAILABLE',
          id: { not: productId },
          OR: [
            { category: product.category },
            { subcategory: product.subcategory }
          ]
        },
        orderBy: { searchPriority: 'desc' },
        take: limit
      });

      return related;
    } catch (error) {
      console.error('❌ [VALIDATOR] Error obteniendo relacionados:', error);
      return [];
    }
  }
}
