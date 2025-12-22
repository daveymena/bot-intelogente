
import { db } from '../src/lib/db';

async function debugSearch(query: string, userId: string = 'user2') {
    console.log(`\n🔎 DEBUGGING SEARCH: "${query}" for User: ${userId}`);
    
    // 1. REPLICATE LOGIC FROM ProductRAG.search
    const queryLower = query.toLowerCase();

    // Check DB
    // Try to find ANY user if user2 fails, just to check existence
    const users = await db.user.findMany();
    console.log(`👤 Users in DB: ${users.length} (${users.map(u => u.phone).join(', ')})`);
    
    const targetUserId = userId === 'user2' ? users[0]?.id : userId; // Use first user if user2 not found
    console.log(`🎯 Using UserId: ${targetUserId}`);

    const products = await db.product.findMany({
        where: {
            userId: targetUserId,
            status: 'AVAILABLE'
        }
    });

    console.log(`📦 Total Products for User: ${products.length}`);

    if (products.length === 0) {
        console.log('❌ NO PRODUCTS FOUND FOR USER');
        return;
    }

    // CATEGORIAS MAPPING
    const categorias = {
      'idiomas': ['idiomas', 'idioma', 'ingles', 'frances', 'aleman', 'portugues', 'italiano', 'chino', 'japones', 'language', 'languages'],
      'piano': ['piano'],
      // ... others
      'pack': ['pack', 'megapack', 'mega'] 
    };

    // Detect Category
    let categoriaDetectada: string | null = null;
    for (const [categoria, palabras] of Object.entries(categorias)) {
      if (palabras.some(p => queryLower.includes(p))) {
        categoriaDetectada = categoria;
        console.log(`🏷️  Categoría detectada: ${categoria}`);
        // break; // Original code breaks? perfect-bot-system.ts line 70
        // FIX: The original code breaks on first match. 
        // If "mega psck de idiomas" matches "pack" first (if I added it), it might ignore "idiomas".
        // In original file:
        // 'idiomas' is first in list? No, it's an object, order not guaranteed but usually definition order.
        // In perfect-bot-system.ts:
        /*
        const categorias = {
          'idiomas': [...],
          'piano': [...],
          'guitarra': [...],
          'diseño': [...],
          'laptop': [...],
          'moto': [...],
          'album': [...]
        }
        */
      }
    }
    // Replicating original exact order logic
    const categoriasOriginal = {
      'idiomas': ['idiomas', 'idioma', 'ingles', 'frances', 'aleman', 'portugues', 'italiano', 'chino', 'japones', 'language', 'languages'],
      'piano': ['piano'],
      'guitarra': ['guitarra', 'guitar'],
      'diseño': ['diseño', 'design', 'grafico', 'photoshop', 'illustrator', 'corel'],
      'laptop': ['laptop', 'computador', 'portatil', 'notebook', 'asus', 'hp', 'lenovo', 'dell'],
      'moto': ['moto', 'motocicleta', 'pulsar', 'bajaj', 'yamaha', 'honda'],
      'album': ['album', 'albumes', 'coleccion', 'collection']
    }
    
    let catDetectada = null;
    for (const [cat, words] of Object.entries(categoriasOriginal)) {
         if (words.some(p => queryLower.includes(p))) {
             catDetectada = cat;
             console.log(`🏷️  [REAL] Categoría detectada: ${cat}`);
             break;
         }
    }

    // SCORING
    const scored = products.map(p => {
        let score = 0;
        const nombreLower = p.name.toLowerCase();
        const descLower = (p.description || '').toLowerCase();
        const trace = [];

        // 1. CATEGORY
        if (catDetectada) {
            const palabrasCategoria = categoriasOriginal[catDetectada as keyof typeof categoriasOriginal];
            const pertenece = palabrasCategoria.some(w => nombreLower.includes(w) || descLower.includes(w));
            if (pertenece) {
                score += 100;
                trace.push('+100 Category Match');
            } else {
                score -= 100;
                trace.push('-100 Category Mismatch');
            }
        }

        // 2. KEYWORDS
        // ... (simplified)
        if (queryLower.includes('mega') && nombreLower.includes('mega')) score += 15;
        if (queryLower.includes('idiomas') && nombreLower.includes('idiomas')) score += 15;

        return { name: p.name, score, trace };
    });

    scored.sort((a,b) => b.score - a.score);

    console.log('\n📊 Top 5 Results:');
    scored.slice(0, 5).forEach(s => {
        console.log(`   ${s.score} | ${s.name} | ${s.trace.join(', ')}`);
    });
}

// Run
debugSearch('Busco un mega psck de idiomas');
