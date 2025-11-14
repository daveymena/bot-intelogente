#!/usr/bin/env node

/**
 * Script para crear usuario administrador en smart-sales
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cambiar al directorio de smart-sales
process.chdir(path.join(__dirname, '..', 'smart-sales'));

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Creando usuario administrador...\n');

  try {
    // Verificar si ya existe un admin
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@smart-sales.com' }
    });

    if (existingAdmin) {
      console.log('⚠️  El usuario admin ya existe');
      console.log('📧 Email: admin@smart-sales.com');
      console.log('🔑 Password: admin123\n');
      return;
    }

    // Crear hash del password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Crear usuario admin
    const admin = await prisma.user.create({
      data: {
        email: 'admin@smart-sales.com',
        name: 'Administrador',
        password: hashedPassword,
        role: 'ADMIN',
        isEmailVerified: true,
        isActive: true
      }
    });

    console.log('✅ Usuario administrador creado exitosamente!\n');
    console.log('📧 Email: admin@smart-sales.com');
    console.log('🔑 Password: admin123');
    console.log('🌐 Dashboard: http://localhost:3000\n');
    console.log('⚠️  IMPORTANTE: Cambia el password después del primer login\n');

  } catch (error) {
    console.error('❌ Error creando usuario:', error.message);
    
    if (error.code === 'P2002') {
      console.log('\n💡 El usuario ya existe. Usa estas credenciales:');
      console.log('📧 Email: admin@smart-sales.com');
      console.log('🔑 Password: admin123\n');
    }
  }
}

main()
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
