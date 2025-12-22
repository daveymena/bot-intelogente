/**
 * Ver exactamente qué productos ve la IA
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function ver() {
    console.log('🔍 Productos que ve la IA (primeros 100):\n');
    
    const productos = await prisma.product.findMany({
        where: { status: 'AVAILABLE' },
        select: {
            id: true,
            name: true,
            price: true,
            category: true,
            subcategory: true
        },
        take: 100
    });
    
    productos.forEach((p, idx) => {
        const numero = idx + 1;
        const marca = numero === 50 ? ' ← POSICIÓN 50' : '';
        const esPiano = p.name.toLowerCase().includes('piano') ? ' 🎹 CURSO DE PIANO' : '';
        console.log(`${numero}. ${p.name} - ${p.category}${marca}${esPiano}`);
    });
    
    // Buscar específicamente el curso de piano
    const posicionPiano = productos.findIndex(p => p.name.toLowerCase().includes('piano'));
    
    if (posicionPiano >= 0) {
        console.log(`\n🎹 CURSO DE PIANO encontrado en posición: ${posicionPiano + 1}`);
        console.log(`   Nombre: ${productos[posicionPiano].name}`);
        console.log(`   Precio: $${productos[posicionPiano].price.toLocaleString('es-CO')}`);
    } else {
        console.log('\n❌ Curso de piano NO está en los primeros 100 productos');
    }
    
    await prisma.$disconnect();
}

ver().catch(console.error);
