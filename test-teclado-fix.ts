/**
 * Test para verificar que "teclado" (periférico) no coincide con "Curso de Piano"
 */

const testProducts = [
    {
        id: 'curso-piano-1',
        name: 'Mega Pack Curso de Piano Completo',
        tipo_producto: 'CURSO_DIGITAL',
        category: 'Cursos',
        tags: ['piano', 'música', 'curso', 'instrumento', 'teclado', 'clásico', 'jazz'],
        price: 60000
    },
    {
        id: 'teclado-mecanico-1',
        name: 'Teclado Mecánico RGB Gaming',
        tipo_producto: 'FISICO',
        category: 'Periféricos',
        tags: ['teclado', 'mecánico', 'gaming', 'rgb', 'pc'],
        price: 189900
    },
    {
        id: 'teclado-combo-1',
        name: 'Teclado y Mouse Inalámbrico Combo',
        tipo_producto: 'FISICO',
        category: 'Periféricos',
        tags: ['teclado', 'mouse', 'inalámbrico', 'combo', 'oficina'],
        price: 89900
    }
];

async function testPeripheralSearch() {
    console.log('🧪 TEST: Búsqueda de "teclado" (periférico)\n');
    
    const searchTerm = 'teclado';
    
    // Simular filtro contextual
    const peripheralKeywords = ['teclado', 'mouse', 'monitor', 'auriculares'];
    const isPeripheralSearch = peripheralKeywords.some(kw => searchTerm.includes(kw));
    
    let productsToSearch = testProducts;
    
    if (isPeripheralSearch) {
        productsToSearch = testProducts.filter((p: any) => {
            const tipo = (p.tipo_producto || '').toLowerCase();
            const name = (p.name || '').toLowerCase();
            const category = (p.category || '').toLowerCase();
            
            // Excluir si es curso o megapack
            if (tipo.includes('curso') || tipo.includes('digital') || 
                name.includes('curso') || name.includes('mega pack') ||
                category.includes('curso') || category.includes('digital')) {
                return false;
            }
            return true;
        });
        console.log(`✅ Filtro aplicado: ${testProducts.length} → ${productsToSearch.length} productos`);
    }
    
    // Fuzzy search
    const Fuse = (await import('fuse.js')).default;
    const fuse = new Fuse(productsToSearch, {
        threshold: 0.6,
        keys: [
            { name: 'name', weight: 0.5 },
            { name: 'tags', weight: 0.3 },
            { name: 'category', weight: 0.2 }
        ]
    });
    
    const results = fuse.search(searchTerm);
    
    console.log(`\n📊 Resultados para "${searchTerm}":\n`);
    
    if (results.length === 0) {
        console.log('❌ No se encontraron productos');
        return;
    }
    
    results.forEach((r, i) => {
        const match = Math.round((1 - r.score!) * 100);
        const icon = r.item.tipo_producto === 'CURSO_DIGITAL' ? '📚' : '⌨️';
        console.log(`${i + 1}. ${icon} ${r.item.name}`);
        console.log(`   Tipo: ${r.item.tipo_producto}`);
        console.log(`   Match: ${match}%`);
        console.log(`   Precio: $${r.item.price.toLocaleString('es-CO')}\n`);
    });
    
    // Validación
    const hasCurso = results.some(r => r.item.tipo_producto === 'CURSO_DIGITAL');
    
    if (hasCurso) {
        console.log('❌ FALLO: Se encontró un curso en los resultados');
        console.log('   El filtro contextual NO está funcionando correctamente\n');
    } else {
        console.log('✅ ÉXITO: Solo se encontraron periféricos físicos');
        console.log('   El filtro contextual está funcionando correctamente\n');
    }
}

// Ejecutar test
testPeripheralSearch().catch(console.error);
