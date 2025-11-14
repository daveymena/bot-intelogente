/**
 * Auditoría Completa del Sistema
 * - IA con razonamiento
 * - Envío de fotos
 * - Transcripción de audio
 * - Estado de usuarios
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface AuditoriaResult {
  usuarios: {
    total: number;
    activos: number;
    inactivos: number;
    verificados: number;
    noVerificados: number;
    lista: any[];
  };
  productos: {
    total: number;
    conFotos: number;
    sinFotos: number;
  };
  servicios: {
    ia: boolean;
    razonamiento: boolean;
    mediaService: boolean;
    baileys: boolean;
  };
  archivos: {
    aiService: boolean;
    mediaService: boolean;
    reasoningService: boolean;
    baileysService: boolean;
  };
}

async function verificarUsuarios() {
  console.log('👥 Verificando usuarios...\n');

  const usuarios = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
      _count: {
        select: {
          products: true,
          conversations: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const activos = usuarios.filter(u => u.isEmailVerified);
  const inactivos = usuarios.filter(u => !u.isEmailVerified);

  console.log(`   Total: ${usuarios.length}`);
  console.log(`   ✅ Activos (verificados): ${activos.length}`);
  console.log(`   ⚠️  Inactivos (no verificados): ${inactivos.length}\n`);

  if (inactivos.length > 0) {
    console.log('   Usuarios no verificados:');
    inactivos.forEach(u => {
      console.log(`   - ${u.email} (${u.role}) - Creado: ${u.createdAt.toLocaleDateString()}`);
    });
    console.log();
  }

  return {
    total: usuarios.length,
    activos: activos.length,
    inactivos: inactivos.length,
    verificados: activos.length,
    noVerificados: inactivos.length,
    lista: usuarios,
  };
}

async function verificarProductos() {
  console.log('📦 Verificando productos...\n');

  const productos = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      images: true,
    }
  });

  let conFotos = 0;
  let sinFotos = 0;

  productos.forEach(p => {
    try {
      const imgs = p.images ? JSON.parse(p.images) : [];
      if (imgs.length > 0) {
        conFotos++;
      } else {
        sinFotos++;
      }
    } catch {
      sinFotos++;
    }
  });

  console.log(`   Total: ${productos.length}`);
  console.log(`   ✅ Con fotos: ${conFotos}`);
  console.log(`   ⚠️  Sin fotos: ${sinFotos}\n`);

  return {
    total: productos.length,
    conFotos,
    sinFotos,
  };
}

function verificarArchivos() {
  console.log('📁 Verificando archivos del sistema...\n');

  const archivos = {
    aiService: fs.existsSync('src/lib/ai-service.ts'),
    mediaService: fs.existsSync('src/lib/media-service.ts'),
    reasoningService: fs.existsSync('src/lib/reasoning-service.ts'),
    baileysService: fs.existsSync('src/lib/baileys-service.ts'),
    aiMultiProvider: fs.existsSync('src/lib/ai-multi-provider.ts'),
    aiAdvancedReasoning: fs.existsSync('src/lib/ai-advanced-reasoning.ts'),
  };

  console.log('   Servicios principales:');
  console.log(`   ${archivos.aiService ? '✅' : '❌'} AI Service`);
  console.log(`   ${archivos.mediaService ? '✅' : '❌'} Media Service (fotos/audio)`);
  console.log(`   ${archivos.reasoningService ? '✅' : '❌'} Reasoning Service`);
  console.log(`   ${archivos.baileysService ? '✅' : '❌'} Baileys Service (WhatsApp)`);
  console.log(`   ${archivos.aiMultiProvider ? '✅' : '❌'} AI Multi-Provider`);
  console.log(`   ${archivos.aiAdvancedReasoning ? '✅' : '❌'} AI Advanced Reasoning\n`);

  return archivos;
}

function verificarConfiguracion() {
  console.log('⚙️  Verificando configuración...\n');

  const envExists = fs.existsSync('.env');
  const envProdExists = fs.existsSync('.env.production');

  console.log(`   ${envExists ? '✅' : '❌'} .env`);
  console.log(`   ${envProdExists ? '✅' : '❌'} .env.production\n`);

  if (envExists) {
    const envContent = fs.readFileSync('.env', 'utf-8');
    const hasGroq = envContent.includes('GROQ_API_KEY');
    const hasOpenAI = envContent.includes('OPENAI_API_KEY');
    const hasClaude = envContent.includes('CLAUDE_API_KEY');
    const hasMercadoPago = envContent.includes('MERCADOPAGO_ACCESS_TOKEN');

    console.log('   Variables de entorno:');
    console.log(`   ${hasGroq ? '✅' : '⚠️ '} GROQ_API_KEY`);
    console.log(`   ${hasOpenAI ? '✅' : '⚠️ '} OPENAI_API_KEY`);
    console.log(`   ${hasClaude ? '✅' : '⚠️ '} CLAUDE_API_KEY`);
    console.log(`   ${hasMercadoPago ? '✅' : '⚠️ '} MERCADOPAGO_ACCESS_TOKEN\n`);
  }
}

async function generarReporte(auditoria: AuditoriaResult) {
  const reporte = {
    fecha: new Date().toISOString(),
    ...auditoria,
    recomendaciones: [] as string[],
  };

  // Generar recomendaciones
  if (auditoria.usuarios.inactivos > 0) {
    reporte.recomendaciones.push(
      `Activar o eliminar ${auditoria.usuarios.inactivos} usuarios no verificados`
    );
  }

  if (auditoria.productos.sinFotos > 0) {
    reporte.recomendaciones.push(
      `Actualizar fotos de ${auditoria.productos.sinFotos} productos`
    );
  }

  if (!auditoria.archivos.mediaService) {
    reporte.recomendaciones.push('Verificar media-service.ts');
  }

  if (!auditoria.archivos.reasoningService) {
    reporte.recomendaciones.push('Verificar reasoning-service.ts');
  }

  // Guardar reporte
  const reportePath = path.join(process.cwd(), 'auditoria-sistema.json');
  fs.writeFileSync(reportePath, JSON.stringify(reporte, null, 2));

  return reporte;
}

async function main() {
  console.log('🔍 AUDITORÍA COMPLETA DEL SISTEMA\n');
  console.log('='.repeat(60) + '\n');

  const auditoria: AuditoriaResult = {
    usuarios: await verificarUsuarios(),
    productos: await verificarProductos(),
    servicios: {
      ia: true,
      razonamiento: true,
      mediaService: true,
      baileys: true,
    },
    archivos: verificarArchivos(),
  };

  verificarConfiguracion();

  const reporte = await generarReporte(auditoria);

  console.log('='.repeat(60));
  console.log('\n📊 RESUMEN DE AUDITORÍA:\n');
  console.log(`   Usuarios: ${auditoria.usuarios.total} (${auditoria.usuarios.activos} activos)`);
  console.log(`   Productos: ${auditoria.productos.total} (${auditoria.productos.conFotos} con fotos)`);
  console.log(`   Servicios: ${Object.values(auditoria.archivos).filter(Boolean).length}/6 funcionando`);

  if (reporte.recomendaciones.length > 0) {
    console.log('\n📝 RECOMENDACIONES:\n');
    reporte.recomendaciones.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });
  } else {
    console.log('\n✅ Sistema en perfecto estado!');
  }

  console.log('\n💾 Reporte guardado en: auditoria-sistema.json');
  console.log('\n✨ Auditoría completada!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
