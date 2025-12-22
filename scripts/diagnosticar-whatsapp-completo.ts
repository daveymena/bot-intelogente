import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function diagnosticar() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DE WHATSAPP');
  console.log('='.repeat(70));

  // 1. Verificar archivos de sesión
  console.log('\n📁 1. ARCHIVOS DE SESIÓN:');
  console.log('-'.repeat(70));
  
  const authPath = path.join(process.cwd(), 'auth_sessions');
  if (fs.existsSync(authPath)) {
    const files = fs.readdirSync(authPath);
    console.log(`✅ Carpeta auth_sessions existe`);
    console.log(`📂 Archivos encontrados: ${files.length}`);
    
    if (files.length > 0) {
      files.forEach(file => {
        const filePath = path.join(authPath, file);
        const stats = fs.statSync(filePath);
        console.log(`   - ${file} (${Math.round(stats.size / 1024)} KB)`);
      });
    } else {
      console.log('⚠️  No hay archivos de sesión');
    }
  } else {
    console.log('❌ Carpeta auth_sessions NO existe');
  }

  // 2. Verificar usuarios
  console.log('\n\n👥 2. USUARIOS EN LA BASE DE DATOS:');
  console.log('-'.repeat(70));
  
  const usuarios = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      whatsappNumber: true,
      role: true,
      isActive: true,
      whatsappConnection: {
        select: {
          isConnected: true,
          status: true,
          phoneNumber: true,
          lastConnectedAt: true,
          lastMessageAt: true,
        }
      }
    }
  });

  console.log(`Total usuarios: ${usuarios.length}\n`);
  
  usuarios.forEach((u, i) => {
    console.log(`${i + 1}. ${u.email}`);
    console.log(`   Nombre: ${u.name || 'Sin nombre'}`);
    console.log(`   WhatsApp conectado: ${u.whatsappConnection?.isConnected ? '✅ SÍ' : '❌ NO'}`);
    if (u.whatsappConnection) {
      console.log(`   Estado: ${u.whatsappConnection.status}`);
      console.log(`   Número: ${u.whatsappConnection.phoneNumber || 'No configurado'}`);
      console.log(`   Última conexión: ${u.whatsappConnection.lastConnectedAt?.toLocaleString() || 'Nunca'}`);
      console.log(`   Último mensaje: ${u.whatsappConnection.lastMessageAt?.toLocaleString() || 'Nunca'}`);
    }
    console.log(`   Rol: ${u.role}`);
    console.log(`   Activo: ${u.isActive ? '✅ SÍ' : '❌ NO'}`);
    console.log(`   ID: ${u.id}`);
    console.log('');
  });

  // 3. Verificar conversaciones
  console.log('\n💬 3. CONVERSACIONES:');
  console.log('-'.repeat(70));
  
  const conversaciones = await prisma.conversation.findMany({
    select: {
      id: true,
      customerPhone: true,
      customerName: true,
      status: true,
      lastMessageAt: true,
      user: {
        select: {
          email: true,
          whatsappNumber: true
        }
      },
      _count: {
        select: {
          messages: true
        }
      }
    },
    orderBy: {
      lastMessageAt: 'desc'
    },
    take: 10
  });

  console.log(`Total conversaciones: ${conversaciones.length}\n`);
  
  if (conversaciones.length > 0) {
    conversaciones.forEach((c, i) => {
      console.log(`${i + 1}. ${c.customerPhone}`);
      console.log(`   Cliente: ${c.customerName || 'Sin nombre'}`);
      console.log(`   Estado: ${c.status}`);
      console.log(`   Mensajes: ${c._count.messages}`);
      console.log(`   Usuario: ${c.user.email} (${c.user.whatsappNumber || 'sin número'})`);
      console.log(`   Última actividad: ${c.lastMessageAt?.toLocaleString() || 'N/A'}`);
      console.log('');
    });
  } else {
    console.log('⚠️  No hay conversaciones registradas');
  }

  // 4. Verificar últimos mensajes
  console.log('\n📨 4. ÚLTIMOS MENSAJES:');
  console.log('-'.repeat(70));
  
  const mensajes = await prisma.message.findMany({
    select: {
      id: true,
      content: true,
      direction: true,
      createdAt: true,
      conversation: {
        select: {
          customerPhone: true,
          user: {
            select: {
              email: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  });

  console.log(`Total mensajes en BD: ${await prisma.message.count()}`);
  console.log(`Últimos 10 mensajes:\n`);
  
  if (mensajes.length > 0) {
    mensajes.forEach((m, i) => {
      console.log(`${i + 1}. [${m.direction}] ${m.conversation.customerPhone}`);
      console.log(`   Usuario: ${m.conversation.user.email}`);
      console.log(`   Contenido: ${m.content.substring(0, 60)}...`);
      console.log(`   Fecha: ${m.createdAt.toLocaleString()}`);
      console.log('');
    });
  } else {
    console.log('⚠️  No hay mensajes registrados');
  }

  // 5. Verificar variables de entorno
  console.log('\n⚙️  5. VARIABLES DE ENTORNO:');
  console.log('-'.repeat(70));
  
  const envVars = [
    'DATABASE_URL',
    'GROQ_API_KEY',
    'NODE_ENV',
    'PORT',
    'NEXT_PUBLIC_API_URL'
  ];

  envVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      if (varName.includes('KEY') || varName.includes('URL')) {
        console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
      } else {
        console.log(`✅ ${varName}: ${value}`);
      }
    } else {
      console.log(`❌ ${varName}: NO CONFIGURADA`);
    }
  });

  // 6. Verificar productos
  console.log('\n\n📦 6. PRODUCTOS:');
  console.log('-'.repeat(70));
  
  const totalProductos = await prisma.product.count();
  const productosDisponibles = await prisma.product.count({
    where: { status: 'AVAILABLE' }
  });

  console.log(`Total productos: ${totalProductos}`);
  console.log(`Disponibles: ${productosDisponibles}`);

  // RESUMEN Y RECOMENDACIONES
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 RESUMEN Y DIAGNÓSTICO');
  console.log('='.repeat(70));

  const problemas: string[] = [];
  const advertencias: string[] = [];

  // Verificar sesiones
  if (!fs.existsSync(authPath) || fs.readdirSync(authPath).length === 0) {
    problemas.push('❌ No hay archivos de sesión de WhatsApp');
  }

  // Verificar usuarios conectados
  const usuariosConectados = usuarios.filter(u => u.whatsappConnection?.isConnected);
  if (usuariosConectados.length === 0) {
    problemas.push('❌ Ningún usuario tiene WhatsApp conectado');
  } else {
    console.log(`\n✅ Usuarios con WhatsApp conectado: ${usuariosConectados.length}`);
    usuariosConectados.forEach(u => {
      console.log(`   - ${u.email} (${u.whatsappConnection?.phoneNumber || 'sin número'})`);
    });
  }

  // Verificar conversaciones recientes
  const conversacionesRecientes = conversaciones.filter(c => {
    const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return c.lastMessageAt && c.lastMessageAt > hace24h;
  });

  if (conversacionesRecientes.length === 0) {
    advertencias.push('⚠️  No hay conversaciones en las últimas 24 horas');
  } else {
    console.log(`\n✅ Conversaciones activas (24h): ${conversacionesRecientes.length}`);
  }

  // Verificar productos
  if (totalProductos === 0) {
    advertencias.push('⚠️  No hay productos en la base de datos');
  } else {
    console.log(`\n✅ Productos disponibles: ${productosDisponibles}/${totalProductos}`);
  }

  // Mostrar problemas
  if (problemas.length > 0) {
    console.log('\n\n🚨 PROBLEMAS ENCONTRADOS:');
    problemas.forEach(p => console.log(`   ${p}`));
  }

  if (advertencias.length > 0) {
    console.log('\n\n⚠️  ADVERTENCIAS:');
    advertencias.forEach(a => console.log(`   ${a}`));
  }

  // Recomendaciones
  console.log('\n\n💡 RECOMENDACIONES:');
  console.log('-'.repeat(70));

  if (problemas.includes('❌ No hay archivos de sesión de WhatsApp')) {
    console.log('1. Conecta WhatsApp desde el dashboard');
    console.log('   - Abre: http://localhost:3000');
    console.log('   - Ve a la sección de WhatsApp');
    console.log('   - Escanea el código QR');
  }

  if (problemas.includes('❌ Ningún usuario tiene WhatsApp conectado')) {
    console.log('2. Verifica el estado de conexión en la BD');
    console.log('   - Puede que la sesión exista pero el flag no esté actualizado');
  }

  if (conversacionesRecientes.length === 0) {
    console.log('3. Envía un mensaje de prueba al bot');
    console.log('   - Desde otro WhatsApp, envía: "Hola"');
    console.log('   - Verifica que llegue al dashboard');
  }

  console.log('\n✅ Diagnóstico completado');

  await prisma.$disconnect();
}

diagnosticar().catch(console.error);
