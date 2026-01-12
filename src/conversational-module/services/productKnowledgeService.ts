/**
 * Servicio para enriquecer productos con la base de conocimiento existente
 * La información proviene de `base-conocimiento-productos.json`
 */

import fs from 'fs/promises';
import path from 'path';
import type { ProductoInfo } from '../ai/promptBuilder';

export interface ProductKnowledgeEntry {
  productId: string;
  productName: string;
  category: string;
  shortDescription?: string;
  detailedDescription?: string;
  keyFeatures?: string[];
  benefits?: string[];
  targetAudience?: string[];
  useCases?: string[];
  commonQuestions?: Array<{ question: string; answer: string }>;
  differentiators?: string[];
  generated?: string;
}

type KnowledgeMap = Map<string, ProductKnowledgeEntry>;

let knowledgeCache: KnowledgeMap | null = null;
let loadPromise: Promise<void> | null = null;

async function ensureKnowledgeLoaded() {
  if (knowledgeCache) {
    return;
  }

  if (!loadPromise) {
    loadPromise = (async () => {
      try {
        const filePath = path.join(process.cwd(), 'base-conocimiento-productos.json');
        const fileData = await fs.readFile(filePath, 'utf-8');
        const parsed: ProductKnowledgeEntry[] = JSON.parse(fileData);
        knowledgeCache = new Map(parsed.map(entry => [entry.productId, entry]));
        console.log(`[ProductKnowledge] ✅ ${parsed.length} entradas cargadas`);
      } catch (error: any) {
        knowledgeCache = new Map();
        console.warn('[ProductKnowledge] ⚠️ No se pudo cargar la base de conocimiento:', error.message);
      }
    })();
  }

  await loadPromise;
}

function buildKnowledgeDescription(entry: ProductKnowledgeEntry): string {
  const chunks: string[] = [];

  if (entry.shortDescription) {
    chunks.push(`📝 ${entry.shortDescription}`);
  }

  if (entry.keyFeatures?.length) {
    const features = entry.keyFeatures.map(f => `• ${f}`).join('\n');
    chunks.push(`⭐ *Características clave:*\n${features}`);
  }

  if (entry.benefits?.length) {
    const benefits = entry.benefits.map(b => `• ${b}`).join('\n');
    chunks.push(`🎯 *Beneficios reales:*\n${benefits}`);
  }

  if (entry.useCases?.length) {
    const useCases = entry.useCases.map(u => `• ${u}`).join('\n');
    chunks.push(`💡 *Usos recomendados:*\n${useCases}`);
  }

  if (entry.commonQuestions?.length) {
    const faqs = entry.commonQuestions
      .slice(0, 3)
      .map(q => `Q: ${q.question}\nA: ${q.answer}`)
      .join('\n\n');
    chunks.push(`❓ *Preguntas frecuentes:*\n${faqs}`);
  }

  if (entry.differentiators?.length) {
    const differentiators = entry.differentiators.map(d => `• ${d}`).join('\n');
    chunks.push(`🚀 *Diferenciales:*\n${differentiators}`);
  }

  return chunks.join('\n\n');
}

export async function enrichProductWithKnowledge(producto: ProductoInfo): Promise<ProductoInfo> {
  await ensureKnowledgeLoaded();

  if (!knowledgeCache) {
    return producto;
  }

  const entry = knowledgeCache.get(String(producto.id));
  if (!entry) {
    return producto;
  }

  const knowledgeDescription = buildKnowledgeDescription(entry);
  const existingDescription = producto.descripcion?.trim();
  const combinedDescription = existingDescription
    ? `${existingDescription}\n\n${knowledgeDescription}`
    : knowledgeDescription;

  return {
    ...producto,
    descripcion: combinedDescription,
    knowledge: entry,
  };
}

export async function enrichProductsWithKnowledge(productos: ProductoInfo[]): Promise<ProductoInfo[]> {
  await ensureKnowledgeLoaded();
  return Promise.all(productos.map(producto => enrichProductWithKnowledge(producto)));
}






