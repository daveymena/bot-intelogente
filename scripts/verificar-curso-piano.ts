/**
 * Verificar si existe el curso de piano en la BD
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificar() {
    console.log('🔍 Buscando curso de piano en la base de datos...\n');
    
    // Buscar productos que contengan "piano"
    const productos = await prisma.product.findMany({
        where: {
            status: 'AVAILABLE',
            OR: [
                { name: { contains: 'piano', mode: 'insensitive' } },
                { description: { contains: 'piano', mode: 'insensitive' } },
                { tags: { contains: 'piano', mode: 'insensitive' } }
            ]
        },
        select: {
            id: true,
            name: true,
            price: true,
            category: true,
            description: true,
            tags: true
        }
    });
    
    if (productos.length === 0) {
        console.log('❌ NO se encontró ningún producto relacionado con "piano"');
        console.log('\n💡 Necesitas agregar el curso de piano a la base de datos');
    } else {
        console.log(`✅ Se encontraron ${productos.length} producto(s) relacionado(s) con "piano":\n`);
        productos.forEach((p, idx) => {
            console.log(`${idx + 1}. ${p.name}`);
            console.log(`   Precio: $${p.price.toLocaleString('es-CO')}`);
            console.log(`   Categoría: ${p.category}`);
            if (p.description) {
                console.log(`   Descripción: ${p.description.substring(0, 100)}...`);
            }
            console.log();
        });
    }
    
    // Verificar cuántos productos hay en total
    const total = await prisma.product.count({
        where: { status: 'AVAILABLE' }
    });
    
    console.log(`📊 Total de productos disponibles en BD: ${total}`);
    console.log(`⚠️  La IA solo ve los primeros 20 productos`);
    
    if (productos.length > 0) {
        // Verificar en qué posición está el curso
        const todosProductos = await prisma.product.findMany({
            where: { status: 'AVAILABLE' },
            select: { id: true, name: true },
            take: 50
        });
        
        const posicion = todosProductos.findIndex(p => 
            p.name.toLowerCase().includes('piano')
        );
        
        if (posicion >= 0) {
            console.log(`\n📍 Posición del curso de piano: ${posicion + 1}`);
            if (posicion >= 20) {
                console.log(`⚠️  PROBLEMA: El curso está en posición ${posicion + 1}, pero la IA solo ve hasta la posición 20`);
                console.log(`💡 SOLUCIÓN: Aumentar el límite de productos que ve la IA`);
            } else {
                console.log(`✅ El curso está en posición ${posicion + 1}, la IA debería verlo`);
            }
        }
    }
    
    await prisma.$disconnect();
}

verificar().catch(console.error);
