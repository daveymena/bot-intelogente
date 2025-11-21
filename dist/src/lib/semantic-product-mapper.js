"use strict";
/**
 * 🧠 MAPEADOR SEMÁNTICO DE PRODUCTOS
 * Entiende lo que el cliente REALMENTE busca, aunque no use el nombre exacto
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemanticProductMapper = void 0;
class SemanticProductMapper {
    /**
     * Encuentra el producto más relevante basado en la búsqueda del cliente
     */
    static findBestMatch(query) {
        const queryLower = query.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Quitar acentos
        let bestMatch = null;
        let bestScore = 0;
        for (const mapping of this.MAPPINGS) {
            let score = 0;
            // Verificar cada keyword del mapping
            for (const keyword of mapping.keywords) {
                const keywordNormalized = keyword.toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                // Coincidencia exacta
                if (queryLower === keywordNormalized) {
                    score += 100;
                }
                // Contiene la keyword completa
                else if (queryLower.includes(keywordNormalized)) {
                    score += 50;
                }
                // Palabras en común
                else {
                    const queryWords = queryLower.split(/\s+/);
                    const keywordWords = keywordNormalized.split(/\s+/);
                    const commonWords = queryWords.filter(w => keywordWords.includes(w) && w.length > 3);
                    score += commonWords.length * 10;
                }
            }
            if (score > bestScore) {
                bestScore = score;
                bestMatch = mapping;
            }
        }
        // Solo retornar si hay un match razonable (score > 30)
        if (bestScore > 30) {
            console.log(`[SemanticMapper] 🎯 Match encontrado: "${bestMatch?.productName}" (score: ${bestScore})`);
            console.log(`[SemanticMapper] 💡 ${bestMatch?.explanation}`);
            console.log(`[SemanticMapper] ✨ ${bestMatch?.benefit}`);
            return bestMatch;
        }
        return null;
    }
    /**
     * Genera una respuesta inteligente explicando el beneficio
     */
    static generateSmartResponse(query, productFound) {
        const mapping = this.findBestMatch(query);
        if (!mapping) {
            return ''; // Dejar que la IA maneje la respuesta
        }
        // Generar respuesta personalizada
        let response = `¡Perfecto! 😊 ${mapping.explanation}.\n\n`;
        response += `✨ **Beneficio adicional:** ${mapping.benefit}\n\n`;
        response += `💰 Precio: $${productFound.price.toLocaleString('es-CO')} COP\n`;
        response += `🎓 Acceso de por vida\n\n`;
        response += `¿Te gustaría más información o proceder con la compra? 😄`;
        return response;
    }
    /**
     * Obtiene sugerencias de productos relacionados
     */
    static getRelatedProducts(query) {
        const queryLower = query.toLowerCase();
        const related = [];
        // Buscar productos relacionados
        for (const mapping of this.MAPPINGS) {
            for (const keyword of mapping.keywords) {
                if (queryLower.includes(keyword.toLowerCase())) {
                    if (!related.includes(mapping.productName)) {
                        related.push(mapping.productName);
                    }
                }
            }
        }
        return related.slice(0, 3); // Máximo 3 sugerencias
    }
}
exports.SemanticProductMapper = SemanticProductMapper;
// Mapeo inteligente de búsquedas a productos
SemanticProductMapper.MAPPINGS = [
    // IDIOMAS
    {
        keywords: ['ingles', 'inglés', 'english', 'curso ingles', 'curso de ingles'],
        productName: 'Mega Pack 03: Cursos Inglés',
        explanation: 'El Mega Pack 03 incluye cursos completos de inglés',
        benefit: 'No solo inglés básico, sino desde principiante hasta avanzado, con pronunciación, gramática y conversación'
    },
    {
        keywords: ['idiomas', 'idioma', 'lenguajes', 'curso idiomas'],
        productName: 'Mega Pack 08: Cursos Idiomas',
        explanation: 'El Mega Pack 08 incluye cursos de múltiples idiomas',
        benefit: 'Inglés, francés, alemán, italiano, portugués y más. Aprende varios idiomas con un solo pack'
    },
    // DISEÑO GRÁFICO
    {
        keywords: ['diseño grafico', 'diseño gráfico', 'diseno grafico', 'photoshop', 'illustrator', 'curso diseño', 'curso de diseño'],
        productName: 'Mega Pack 01: Cursos Diseño Gráfico',
        explanation: 'El Mega Pack 01 es especializado en diseño gráfico profesional',
        benefit: 'Photoshop, Illustrator, InDesign, técnicas profesionales, diseño de logos, branding y más'
    },
    {
        keywords: ['archivos diseño', 'plantillas diseño', 'recursos diseño'],
        productName: 'Mega Pack 07: Archivos editables de diseño gráfico',
        explanation: 'El Mega Pack 07 incluye archivos editables listos para usar',
        benefit: 'Miles de plantillas, mockups, vectores y recursos editables para tus proyectos'
    },
    // PROGRAMACIÓN
    {
        keywords: ['programacion', 'programación', 'programar', 'codigo', 'código', 'desarrollo web', 'curso programacion'],
        productName: 'Mega Pack 02: Cursos Programación Web',
        explanation: 'El Mega Pack 02 cubre programación web completa',
        benefit: 'HTML, CSS, JavaScript, React, Node.js, Python, PHP, bases de datos. De principiante a avanzado'
    },
    // MARKETING
    {
        keywords: ['marketing', 'marketing digital', 'redes sociales', 'publicidad', 'curso marketing'],
        productName: 'Mega Pack 03: Cursos Marketing Digital',
        explanation: 'El Mega Pack 03 especializado en marketing digital',
        benefit: 'SEO, SEM, Facebook Ads, Instagram Marketing, Google Ads, email marketing, copywriting y analítica'
    },
    // OFFICE Y EXCEL
    {
        keywords: ['excel', 'office', 'word', 'powerpoint', 'curso excel', 'curso office'],
        productName: 'Mega Pack 05: Cursos Excel y Office',
        explanation: 'El Mega Pack 05 domina Excel y Office completo',
        benefit: 'Excel avanzado, macros, Word profesional, PowerPoint impactante, Access y más'
    },
    {
        keywords: ['microsoft office', 'paquete office'],
        productName: 'Mega Pack 02: Cursos Microsoft Office',
        explanation: 'El Mega Pack 02 especializado en Microsoft Office',
        benefit: 'Domina todas las herramientas de Office para ser más productivo'
    },
    // VIDEO Y EDICIÓN
    {
        keywords: ['video', 'edicion video', 'edición video', 'premiere', 'after effects', 'curso video'],
        productName: 'Mega Pack 04: Cursos Edición de Video',
        explanation: 'El Mega Pack 04 para edición de video profesional',
        benefit: 'Premiere Pro, After Effects, DaVinci Resolve, efectos especiales, motion graphics'
    },
    // FOTOGRAFÍA
    {
        keywords: ['fotografia', 'fotografía', 'foto', 'camara', 'cámara', 'curso fotografia'],
        productName: 'Mega Pack 06: Cursos Fotografía',
        explanation: 'El Mega Pack 06 especializado en fotografía profesional',
        benefit: 'Técnicas de fotografía, iluminación, composición, edición, fotografía de producto y retrato'
    },
    // MÚSICA
    {
        keywords: ['musica', 'música', 'audio', 'produccion musical', 'piano', 'guitarra', 'curso musica'],
        productName: 'Mega Pack 09: Cursos Música y Audio',
        explanation: 'El Mega Pack 09 incluye cursos de música y producción de audio',
        benefit: 'Piano, guitarra, producción musical, mezcla, masterización, teoría musical'
    },
    // 3D Y ANIMACIÓN
    {
        keywords: ['3d', 'animacion', 'animación', 'blender', 'maya', 'curso 3d'],
        productName: 'Mega Pack 10: Cursos 3D y Animación',
        explanation: 'El Mega Pack 10 para modelado 3D y animación',
        benefit: 'Blender, Maya, 3ds Max, animación de personajes, modelado arquitectónico'
    },
    // EMPRENDIMIENTO
    {
        keywords: ['emprendimiento', 'negocio', 'empresa', 'emprender', 'curso emprendimiento'],
        productName: 'Mega Pack 07: Cursos Emprendimiento',
        explanation: 'El Mega Pack 07 para emprendedores',
        benefit: 'Cómo iniciar tu negocio, estrategias de crecimiento, finanzas, liderazgo'
    },
    // HACKING ÉTICO
    {
        keywords: ['hacking', 'seguridad', 'ciberseguridad', 'ethical hacking', 'curso hacking'],
        productName: 'Mega Pack 05: Cursos Hacking Ético',
        explanation: 'El Mega Pack 05 especializado en seguridad informática',
        benefit: 'Hacking ético, pentesting, seguridad de redes, análisis de vulnerabilidades'
    },
    // PACK COMPLETO
    {
        keywords: ['todos', 'completo', 'todo', 'todos los cursos', 'pack completo', 'super megapack', '40 megapacks'],
        productName: 'PACK COMPLETO 40 Mega Packs',
        explanation: 'El PACK COMPLETO incluye TODOS los 40 Mega Packs',
        benefit: 'Acceso a TODO el catálogo. Ahorro de $740.000 COP. Más de 5000 cursos en todas las áreas'
    }
];
