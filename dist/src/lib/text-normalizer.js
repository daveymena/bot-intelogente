"use strict";
/**
 * 🔤 NORMALIZADOR DE TEXTO
 * Corrige errores de ortografía y entiende variaciones de palabras
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextNormalizer = void 0;
class TextNormalizer {
    /**
     * Normalizar texto: corregir errores y expandir sinónimos
     */
    static normalize(text) {
        let normalized = text.toLowerCase().trim();
        // Remover acentos para búsqueda más flexible
        normalized = this.removeAccents(normalized);
        // Corregir palabras comunes
        const words = normalized.split(/\s+/);
        const correctedWords = words.map(word => {
            // Buscar corrección exacta
            if (this.corrections[word]) {
                return this.corrections[word];
            }
            // Buscar corrección sin acentos
            const withoutAccents = this.removeAccents(word);
            if (this.corrections[withoutAccents]) {
                return this.corrections[withoutAccents];
            }
            return word;
        });
        return correctedWords.join(' ');
    }
    /**
     * Remover acentos para búsqueda más flexible
     */
    static removeAccents(text) {
        return text
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }
    /**
     * Expandir búsqueda con sinónimos
     */
    static expandWithSynonyms(text) {
        const normalized = this.normalize(text);
        const expanded = [normalized];
        // Buscar sinónimos
        for (const [key, synonymList] of Object.entries(this.synonyms)) {
            if (normalized.includes(key) || synonymList.some(syn => normalized.includes(syn))) {
                expanded.push(...synonymList);
            }
        }
        return [...new Set(expanded)]; // Remover duplicados
    }
    /**
     * Detectar intención de búsqueda de producto
     */
    static detectProductIntent(text) {
        const normalized = this.normalize(text);
        const keywords = [];
        let productType;
        // Detectar tipo de producto
        if (/portatil|laptop|notebook|compu|pc/.test(normalized)) {
            productType = 'portátil';
            keywords.push('portátil', 'laptop', 'notebook');
        }
        if (/moto|motocicleta/.test(normalized)) {
            productType = 'motocicleta';
            keywords.push('moto', 'motocicleta');
        }
        if (/curso|capacitacion|entrenamiento/.test(normalized)) {
            productType = 'curso';
            keywords.push('curso', 'capacitación');
        }
        if (/megapack|paquete|pack/.test(normalized)) {
            productType = 'megapack';
            keywords.push('megapack', 'paquete');
        }
        // Extraer palabras clave adicionales
        const words = normalized.split(/\s+/);
        for (const word of words) {
            if (word.length > 3 && !['para', 'con', 'sin', 'por', 'que', 'como'].includes(word)) {
                keywords.push(word);
            }
        }
        return {
            isProductQuery: !!productType || keywords.length > 0,
            productType,
            keywords: [...new Set(keywords)]
        };
    }
    /**
     * Limpiar texto para búsqueda en base de datos
     */
    static cleanForSearch(text) {
        return this.normalize(text)
            .replace(/[^\w\s]/g, ' ') // Remover puntuación
            .replace(/\s+/g, ' ') // Normalizar espacios
            .trim();
    }
}
exports.TextNormalizer = TextNormalizer;
// Diccionario de correcciones comunes
TextNormalizer.corrections = {
    // Productos
    'portatil': 'portátil',
    'portatiles': 'portátiles',
    'laptop': 'portátil',
    'laptops': 'portátiles',
    'compu': 'computador',
    'pc': 'computador',
    'computadora': 'computador',
    'note': 'portátil',
    'notebook': 'portátil',
    // Motos
    'moto': 'motocicleta',
    'motos': 'motocicletas',
    'motocicleta': 'motocicleta',
    'motocicletas': 'motocicletas',
    // Cursos
    'curso': 'curso',
    'cursos': 'cursos',
    'capacitacion': 'capacitación',
    'capacitaciones': 'capacitaciones',
    'entrenamiento': 'curso',
    // Megapacks (AMPLIADO)
    'megapack': 'megapack',
    'megapacks': 'megapack',
    'mega pack': 'megapack',
    'mega packs': 'megapack',
    'megapak': 'megapack',
    'megapac': 'megapack',
    'megapck': 'megapack',
    'paquete': 'megapack',
    'paquetes': 'megapack',
    'pack': 'megapack',
    'packs': 'megapack',
    'paquete completo': 'megapack completo',
    'pack completo': 'megapack completo',
    'todos los packs': 'megapack completo',
    'todos los megapacks': 'megapack completo',
    // Preguntas comunes
    'cuanto': 'cuánto',
    'cual': 'cuál',
    'q': 'qué',
    'k': 'qué',
    'xq': 'por qué',
    'xk': 'por qué',
    'porq': 'por qué',
    'pq': 'por qué',
    // Disponibilidad
    'disponible': 'disponible',
    'disponibles': 'disponibles',
    'hay': 'hay',
    'tienes': 'tienes',
    'tienen': 'tienen',
    'stock': 'stock',
    // Precio
    'precio': 'precio',
    'precios': 'precios',
    'cuesta': 'cuesta',
    'cuestan': 'cuestan',
    'vale': 'vale',
    'valen': 'valen',
    'valor': 'valor',
    'costo': 'costo',
    'costos': 'costos',
    // Marcas comunes (con errores)
    'asus': 'asus',
    'azus': 'asus',
    'asuz': 'asus',
    'lenovo': 'lenovo',
    'hp': 'hp',
    'dell': 'dell',
    'acer': 'acer',
    'samsung': 'samsung',
    'samsumg': 'samsung',
    'apple': 'apple',
    'aplle': 'apple',
    'macbook': 'macbook',
    'mac': 'macbook',
    // Especificaciones
    'ram': 'ram',
    'memoria': 'memoria',
    'disco': 'disco',
    'ssd': 'ssd',
    'hdd': 'hdd',
    'procesador': 'procesador',
    'cpu': 'procesador',
    'core': 'core',
    'intel': 'intel',
    'amd': 'amd',
    'ryzen': 'ryzen',
    'i3': 'i3',
    'i5': 'i5',
    'i7': 'i7',
    'i9': 'i9',
    // Colores
    'negro': 'negro',
    'blanco': 'blanco',
    'gris': 'gris',
    'plata': 'plata',
    'plateado': 'plata',
    'azul': 'azul',
    'rojo': 'rojo',
    'verde': 'verde',
    // Acciones
    'comprar': 'comprar',
    'quiero': 'quiero',
    'deseo': 'deseo',
    'necesito': 'necesito',
    'busco': 'busco',
    'info': 'información',
    'informacion': 'información',
    'detalles': 'detalles',
    'caracteristicas': 'características',
    'especificaciones': 'especificaciones',
    'link': 'link',
    'enlace': 'enlace',
    'url': 'link',
    'pagina': 'página',
    'web': 'página',
};
// Sinónimos para búsqueda de productos
TextNormalizer.synonyms = {
    'portátil': ['laptop', 'notebook', 'portatil', 'compu', 'pc', 'computador', 'computadora'],
    'motocicleta': ['moto', 'motos', 'motocicleta', 'motocicletas'],
    'curso': ['curso', 'cursos', 'capacitación', 'capacitacion', 'entrenamiento', 'clase'],
    'megapack': ['megapack', 'megapacks', 'mega pack', 'mega packs', 'paquete', 'paquetes', 'pack', 'packs'],
    'completo': ['completo', 'completa', 'todos', 'todo', 'todas', 'entero', 'entera', 'total', '40', 'cuarenta'],
    'precio': ['precio', 'costo', 'valor', 'cuánto', 'cuanto', 'vale', 'cuesta'],
    'disponible': ['disponible', 'hay', 'tienes', 'tienen', 'stock', 'existencia'],
};
