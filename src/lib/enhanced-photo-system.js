/**
 * 📸🧠 SISTEMA DE FOTOS INTELIGENTE MEJORADO
 * Sistema que reconoce productos por nombre y los ubica automáticamente
 * Versión: 3.0 - Integración completa con bot estable
 */

import fs from 'fs';
import path from 'path';
import pkg from 'whatsapp-web.js';
const { MessageMedia } = pkg;

export class EnhancedPhotoSystem {
    constructor(metrics) {
        this.metrics = metrics;
        this.isEnabled = true;
        
        // Rutas de fotos
        this.photoPaths = {
            tech: path.join(process.cwd(), 'moto-ns-160'),           // Productos tecnológicos por nombre
            products: path.join(process.cwd(), 'product-images'),    // Fotos genéricas por ID
            moto: path.join(process.cwd(), 'moto-ns-160-backup')     // Fotos REALES de la moto
        };
        
        // Cache de fotos organizadas
        this.photoCache = new Map();
        this.productDatabase = new Map();
        
        // Inicializar sistema
        this.initializeSystem();
    }

    /**
     * Inicializar sistema completo
     */
    async initializeSystem() {
        this.metrics.addLog('info', '🚀 Inicializando Sistema de Fotos Inteligente v3.0');
        
        // Cargar base de datos de productos
        await this.loadProductDatabase();
        
        // Cargar y organizar fotos
        await this.loadAllPhotos();
        
        this.metrics.addLog('success', `📸 Sistema listo: ${this.photoCache.size} categorías de fotos cargadas`);
        this.metrics.addLog('success', `📦 Base de datos: ${this.productDatabase.size} productos registrados`);
    }

    /**
     * Cargar base de datos de productos desde archivos JSON
     */
    async loadProductDatabase() {
        try {
            // Cargar productos con imágenes reales
            const productsPath = path.join(process.cwd(), 'data', 'products-with-real-images.json');
            if (fs.existsSync(productsPath)) {
                const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
                
                productsData.products.forEach((product, index) => {
                    const productId = `product_${index + 1}`;
                    
                    this.productDatabase.set(productId, {
                        id: productId,
                        name: product.name,
                        price: product.price,
                        description: product.description || '',
                        keywords: this.generateProductKeywords(product.name),
                        category: this.detectProductCategory(product.name),
                        imageCount: 5
                    });
                });
            }

            // Cargar mapeo de productos
            const mappingPath = path.join(process.cwd(), 'data', 'product-image-mapping.json');
            if (fs.existsSync(mappingPath)) {
                const mappingData = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
                
                for (const [productId, productInfo] of Object.entries(mappingData.mapping)) {
                    if (!this.productDatabase.has(productId)) {
                        this.productDatabase.set(productId, {
                            id: productId,
                            name: productInfo.name,
                            price: productInfo.price,
                            keywords: this.generateProductKeywords(productInfo.name),
                            category: this.detectProductCategory(productInfo.name),
                            imageCount: productInfo.imageCount || 5
                        });
                    }
                }
            }

            // Agregar productos específicos conocidos
            this.addKnownProducts();
            
            this.metrics.addLog('success', `📚 Base de datos cargada: ${this.productDatabase.size} productos`);
            
        } catch (error) {
            this.metrics.addLog('error', `❌ Error cargando base de datos: ${error.message}`);
        }
    }

    /**
     * Agregar productos específicos conocidos
     */
    addKnownProducts() {
        const knownProducts = [
            {
                id: 'moto_pulsar_ns160',
                name: 'Moto Pulsar NS 160 FI 2020',
                price: '$6.000.000',
                keywords: ['moto', 'pulsar', 'ns160', 'ns 160', 'bajaj', 'motocicleta', 'mito'],
                category: 'motos'
            },
            {
                id: 'curso_piano',
                name: 'Curso Completo de Piano',
                price: '$50.000',
                keywords: ['piano', 'curso', 'musica', 'clases', 'aprender'],
                category: 'cursos'
            }
        ];

        knownProducts.forEach(product => {
            this.productDatabase.set(product.id, product);
        });
    }

    /**
     * Cargar todas las fotos de las diferentes carpetas
     */
    async loadAllPhotos() {
        try {
            // Cargar fotos tecnológicas (moto-ns-160)
            await this.loadTechPhotos();
            
            // Cargar fotos por ID de producto (product-images)
            await this.loadProductPhotos();
            
            // Cargar fotos de moto (moto-ns-160-backup)
            await this.loadMotoPhotos();
            
            this.metrics.addLog('success', `📸 Fotos cargadas en ${this.photoCache.size} categorías`);
            
        } catch (error) {
            this.metrics.addLog('error', `❌ Error cargando fotos: ${error.message}`);
        }
    }

    /**
     * Cargar fotos tecnológicas de moto-ns-160 (organizadas por nombre de producto)
     */
    async loadTechPhotos() {
        if (!fs.existsSync(this.photoPaths.tech)) return;

        const files = fs.readdirSync(this.photoPaths.tech);
        const imageFiles = files.filter(file => 
            /\.(jpg|jpeg|png|webp|gif)$/i.test(file) && !file.includes('README')
        );

        const categoryPhotos = {};
        const specificProductPhotos = {};

        imageFiles.forEach(file => {
            try {
                const filePath = path.join(this.photoPaths.tech, file);
                const stats = fs.statSync(filePath);
                
                if (stats.size > 1024) {
                    const category = this.detectCategoryFromFilename(file);
                    const specificProduct = this.detectSpecificProductFromFilename(file);
                    
                    const photoData = {
                        filename: file,
                        filePath: filePath,
                        size: stats.size,
                        source: 'tech',
                        priority: 5 // Prioridad media para fotos tech
                    };
                    
                    // Organizar por categoría general
                    if (!categoryPhotos[category]) {
                        categoryPhotos[category] = [];
                    }
                    categoryPhotos[category].push(photoData);
                    
                    // Organizar por producto específico
                    if (specificProduct && specificProduct !== 'general') {
                        if (!specificProductPhotos[specificProduct]) {
                            specificProductPhotos[specificProduct] = [];
                        }
                        specificProductPhotos[specificProduct].push(photoData);
                    }
                }
            } catch (error) {
                this.metrics.addLog('warning', `⚠️ Error cargando ${file}: ${error.message}`);
            }
        });

        // Guardar en cache por categoría
        for (const [category, photos] of Object.entries(categoryPhotos)) {
            this.photoCache.set(`tech_${category}`, photos);
        }
        
        // Guardar en cache por producto específico
        for (const [product, photos] of Object.entries(specificProductPhotos)) {
            this.photoCache.set(`tech_${product}`, photos);
        }

        this.metrics.addLog('info', `📸 Fotos tech cargadas: ${Object.keys(categoryPhotos).length} categorías, ${Object.keys(specificProductPhotos).length} productos específicos`);
    }

    /**
     * Detectar producto específico desde nombre de archivo
     */
    detectSpecificProductFromFilename(filename) {
        const name = filename.toLowerCase();

        // Productos específicos por nombre completo
        if (name.includes('macbook_pro_m4')) return 'macbook_pro_m4';
        if (name.includes('mouse_logitech_mx_ergo')) return 'mouse_logitech_mx_ergo';
        if (name.includes('mouse_trust_fyda')) return 'mouse_trust_fyda';
        if (name.includes('camara_web_logitech_c922')) return 'camara_logitech_c922';
        if (name.includes('cmara_gopro_hero_max')) return 'camara_gopro_hero_max';
        if (name.includes('diadema_gamer_logitech_g635')) return 'diadema_logitech_g635';
        if (name.includes('monitor_lg_32gn55rb')) return 'monitor_lg_ultragear';
        if (name.includes('portatil_asus_vivobook')) return 'laptop_asus_vivobook';
        if (name.includes('portatil_hp_omnibook')) return 'laptop_hp_omnibook';
        if (name.includes('portatil_hp_victus')) return 'laptop_hp_victus';
        if (name.includes('portatil_lenovo_v14')) return 'laptop_lenovo_v14';
        if (name.includes('teclado_trust_basics')) return 'teclado_trust_basics';
        if (name.includes('teclado_trust_primo')) return 'teclado_trust_primo';
        if (name.includes('timn_logitech_g29')) return 'timon_logitech_g29';
        if (name.includes('palanca_logitech')) return 'palanca_logitech';
        if (name.includes('impresora_multifuncional_epson')) return 'impresora_epson';

        return 'general';
    }

    /**
     * Cargar fotos por ID de producto
     */
    async loadProductPhotos() {
        if (!fs.existsSync(this.photoPaths.products)) return;

        const files = fs.readdirSync(this.photoPaths.products);
        const imageFiles = files.filter(file => 
            /^product_\d+_img_\d+$/i.test(file)
        );

        const productPhotos = {};

        imageFiles.forEach(file => {
            try {
                const filePath = path.join(this.photoPaths.products, file);
                const stats = fs.statSync(filePath);
                
                if (stats.size > 1024) {
                    const match = file.match(/^product_(\d+)_img_(\d+)$/i);
                    if (match) {
                        const productId = `product_${match[1]}`;
                        
                        if (!productPhotos[productId]) {
                            productPhotos[productId] = [];
                        }
                        
                        productPhotos[productId].push({
                            filename: file,
                            filePath: filePath,
                            size: stats.size,
                            source: 'products',
                            productId: productId
                        });
                    }
                }
            } catch (error) {
                this.metrics.addLog('warning', `⚠️ Error cargando ${file}: ${error.message}`);
            }
        });

        // Guardar en cache con nombres de categoría
        for (const [productId, photos] of Object.entries(productPhotos)) {
            const product = this.productDatabase.get(productId);
            if (product) {
                const categoryKey = `${product.category}_${productId}`;
                this.photoCache.set(categoryKey, photos);
                
                // También agregar por categoría general
                if (!this.photoCache.has(product.category)) {
                    this.photoCache.set(product.category, []);
                }
                this.photoCache.get(product.category).push(...photos);
            }
        }

        this.metrics.addLog('info', `📸 Fotos productos cargadas: ${Object.keys(productPhotos).length} productos`);
    }

    /**
     * Cargar fotos de moto REALES (moto-ns-160-backup)
     */
    async loadMotoPhotos() {
        if (!fs.existsSync(this.photoPaths.moto)) return;

        const files = fs.readdirSync(this.photoPaths.moto);
        const imageFiles = files.filter(file => 
            /\.(jpg|jpeg|png|webp|gif)$/i.test(file) && !file.includes('README')
        );

        const motoPhotos = [];

        imageFiles.forEach(file => {
            try {
                const filePath = path.join(this.photoPaths.moto, file);
                const stats = fs.statSync(filePath);
                
                if (stats.size > 1024) {
                    motoPhotos.push({
                        filename: file,
                        filePath: filePath,
                        size: stats.size,
                        source: 'moto_real',
                        priority: 10 // Alta prioridad para fotos reales de moto
                    });
                }
            } catch (error) {
                this.metrics.addLog('warning', `⚠️ Error cargando ${file}: ${error.message}`);
            }
        });

        if (motoPhotos.length > 0) {
            this.photoCache.set('moto_real', motoPhotos);
            this.photoCache.set('moto_pulsar_real', motoPhotos); // Alias adicional
            this.metrics.addLog('info', `📸 Fotos moto REALES cargadas: ${motoPhotos.length} fotos`);
        }
    }

    /**
     * Detectar categoría desde nombre de archivo
     */
    detectCategoryFromFilename(filename) {
        const name = filename.toLowerCase();

        // Patrones específicos para productos tecnológicos
        const patterns = {
            'laptop': ['portatil', 'laptop', 'vivobook', 'omnibook', 'victus'],
            'macbook': ['macbook'],
            'mouse': ['mouse'],
            'teclado': ['teclado'],
            'camara': ['camara', 'cmara', 'gopro'],
            'monitor': ['monitor'],
            'diadema': ['diadema'],
            'impresora': ['impresora'],
            'timon': ['timn', 'timon'],
            'palanca': ['palanca'],
            'moto': ['moto', 'pulsar', 'ns160', 'ns 160', 'bajaj']
        };

        for (const [category, keywords] of Object.entries(patterns)) {
            for (const keyword of keywords) {
                if (name.includes(keyword)) {
                    return category;
                }
            }
        }

        return 'general';
    }

    /**
     * Generar palabras clave para un producto
     */
    generateProductKeywords(productName) {
        const keywords = [];
        const name = productName.toLowerCase();
        
        // Palabras básicas
        const words = name.split(/\s+/).filter(word => word.length > 2);
        keywords.push(...words);
        
        // Marcas conocidas
        const brands = ['logitech', 'asus', 'hp', 'lenovo', 'trust', 'epson', 'gopro', 'astro', 'lg', 'apple', 'bajaj'];
        brands.forEach(brand => {
            if (name.includes(brand)) keywords.push(brand);
        });
        
        // Tipos de productos
        const types = [
            'laptop', 'portatil', 'macbook', 'mouse', 'teclado', 'monitor',
            'camara', 'diadema', 'impresora', 'timon', 'palanca', 'moto', 'pulsar', 'ns160',
            'piano', 'curso', 'musica'
        ];
        types.forEach(type => {
            if (name.includes(type)) keywords.push(type);
        });
        
        return [...new Set(keywords)];
    }

    /**
     * Detectar categoría de producto
     */
    detectProductCategory(productName) {
        const name = productName.toLowerCase();
        
        if (name.includes('laptop') || name.includes('portatil') || name.includes('macbook')) return 'laptops';
        if (name.includes('mouse')) return 'perifericos';
        if (name.includes('teclado')) return 'perifericos';
        if (name.includes('monitor')) return 'monitores';
        if (name.includes('camara') || name.includes('gopro')) return 'camaras';
        if (name.includes('diadema')) return 'audio';
        if (name.includes('impresora')) return 'impresoras';
        if (name.includes('timon') || name.includes('palanca')) return 'gaming';
        if (name.includes('moto') || name.includes('pulsar') || name.includes('ns160')) return 'motos';
        if (name.includes('piano') || name.includes('curso')) return 'cursos';
        
        return 'tecnologia';
    }

    /**
     * Buscar producto por consulta del usuario
     */
    searchProduct(userQuery) {
        const query = userQuery.toLowerCase();
        const results = [];

        // Buscar en base de datos de productos
        for (const [productId, productInfo] of this.productDatabase) {
            let score = 0;

            // Coincidencia exacta en nombre
            if (productInfo.name.toLowerCase().includes(query)) {
                score += 15;
            }

            // Coincidencia en palabras clave
            if (productInfo.keywords) {
                productInfo.keywords.forEach(keyword => {
                    if (query.includes(keyword)) {
                        score += 8;
                    }
                });
            }

            // Coincidencia en categoría
            if (productInfo.category && query.includes(productInfo.category)) {
                score += 5;
            }

            // Búsquedas específicas
            if (query.includes('moto') || query.includes('pulsar') || query.includes('mito')) {
                if (productInfo.category === 'motos' || productInfo.name.toLowerCase().includes('moto')) {
                    score += 20;
                }
            }

            if (query.includes('piano') || query.includes('curso')) {
                if (productInfo.category === 'cursos' || productInfo.name.toLowerCase().includes('piano')) {
                    score += 20;
                }
            }

            if (score > 0) {
                results.push({
                    ...productInfo,
                    score: score
                });
            }
        }

        // Ordenar por relevancia
        results.sort((a, b) => b.score - a.score);

        return results;
    }

    /**
     * Encontrar fotos de un producto específico con priorización inteligente
     */
    findProductPhotos(product) {
        const photos = [];
        
        // PRIORIDAD 1: Fotos específicas por nombre de producto (moto-ns-160)
        if (product.category === 'motos' || product.name.toLowerCase().includes('moto') || product.name.toLowerCase().includes('pulsar')) {
            // Para la moto, usar SIEMPRE las fotos reales de moto-ns-160-backup
            if (this.photoCache.has('moto_real')) {
                const motoRealPhotos = this.photoCache.get('moto_real');
                photos.push(...motoRealPhotos);
                this.metrics.addLog('info', `📸 Usando fotos REALES de moto: ${motoRealPhotos.length} fotos`);
            }
        } else {
            // Para otros productos, buscar por nombre específico en moto-ns-160
            const productNameLower = product.name.toLowerCase();
            
            // Buscar fotos por nombre específico del producto
            for (const [cacheKey, cachePhotos] of this.photoCache) {
                if (cacheKey.startsWith('tech_') || cacheKey === 'tech') {
                    // Verificar si las fotos coinciden con el producto específico
                    const matchingPhotos = cachePhotos.filter(photo => {
                        const filename = photo.filename.toLowerCase();
                        
                        // Coincidencias específicas por nombre
                        if (productNameLower.includes('macbook') && filename.includes('macbook')) return true;
                        if (productNameLower.includes('mouse') && filename.includes('mouse')) return true;
                        if (productNameLower.includes('teclado') && filename.includes('teclado')) return true;
                        if (productNameLower.includes('camara') && filename.includes('camara')) return true;
                        if (productNameLower.includes('gopro') && filename.includes('gopro')) return true;
                        if (productNameLower.includes('monitor') && filename.includes('monitor')) return true;
                        if (productNameLower.includes('diadema') && filename.includes('diadema')) return true;
                        if (productNameLower.includes('impresora') && filename.includes('impresora')) return true;
                        if (productNameLower.includes('timon') && filename.includes('timn')) return true;
                        if (productNameLower.includes('palanca') && filename.includes('palanca')) return true;
                        if (productNameLower.includes('logitech') && filename.includes('logitech')) return true;
                        if (productNameLower.includes('asus') && filename.includes('asus')) return true;
                        if (productNameLower.includes('hp') && filename.includes('hp')) return true;
                        if (productNameLower.includes('lenovo') && filename.includes('lenovo')) return true;
                        if (productNameLower.includes('trust') && filename.includes('trust')) return true;
                        if (productNameLower.includes('epson') && filename.includes('epson')) return true;
                        
                        return false;
                    });
                    
                    if (matchingPhotos.length > 0) {
                        photos.push(...matchingPhotos);
                        this.metrics.addLog('info', `📸 Usando fotos específicas por nombre: ${matchingPhotos.length} fotos`);
                        break; // Usar solo las fotos más específicas
                    }
                }
            }
            
            // PRIORIDAD 2: Si no se encontraron fotos específicas, usar por categoría
            if (photos.length === 0) {
                if (this.photoCache.has(product.category)) {
                    const categoryPhotos = this.photoCache.get(product.category);
                    photos.push(...categoryPhotos.slice(0, 3));
                    this.metrics.addLog('info', `📸 Usando fotos por categoría: ${categoryPhotos.length} fotos`);
                }
            }
            
            // PRIORIDAD 3: Fallback a fotos por ID específico del producto
            if (photos.length === 0) {
                const productKey = `${product.category}_${product.id}`;
                if (this.photoCache.has(productKey)) {
                    const idPhotos = this.photoCache.get(productKey);
                    photos.push(...idPhotos);
                    this.metrics.addLog('info', `📸 Usando fotos por ID: ${idPhotos.length} fotos`);
                }
            }
        }
        
        return photos.slice(0, 5); // Máximo 5 fotos
    }

    /**
     * Método principal para manejar solicitudes de fotos
     */
    async handlePhotoRequest(client, message, context = null) {
        try {
            const chatId = message.from;
            const messageText = message.body || '';

            // Detectar si es solicitud de fotos
            if (!this.shouldSendPhotos(messageText)) {
                return {
                    photosSent: false,
                    message: 'No se detectó solicitud de fotos'
                };
            }

            this.metrics.addLog('info', `🔍 Solicitud de fotos detectada: "${messageText}"`);

            // 🧠 USAR CONTEXTO SI ESTÁ DISPONIBLE
            let searchResults = [];
            
            if (context && context.product && context.product !== 'general' && context.isContextual) {
                this.metrics.addLog('success', `🧠 Usando contexto conversacional para fotos: ${context.product}`);
                // Buscar específicamente el producto del contexto
                searchResults = this.searchProduct(context.product);
            } else {
                // Buscar productos relevantes del mensaje
                searchResults = this.searchProduct(messageText);
            }
            
            if (searchResults.length === 0) {
                await this.sendProductSearchMessage(client, chatId, messageText);
                return {
                    photosSent: false,
                    message: 'No se encontraron productos específicos'
                };
            }
            
            // Tomar el producto más relevante
            const selectedProduct = searchResults[0];
            this.metrics.addLog('success', `📦 Producto seleccionado: ${selectedProduct.name} (score: ${selectedProduct.score})`);
            
            // Buscar fotos del producto
            const productPhotos = this.findProductPhotos(selectedProduct);
            
            if (productPhotos.length === 0) {
                await this.sendNoPhotosMessage(client, chatId, selectedProduct);
                return {
                    photosSent: false,
                    message: 'No se encontraron fotos del producto'
                };
            }
            
            // Enviar fotos del producto específico
            await this.sendSpecificProductPhotos(client, chatId, selectedProduct, productPhotos);
            
            return {
                photosSent: true,
                photosCount: productPhotos.length,
                message: `Fotos de ${selectedProduct.name} enviadas`
            };
            
        } catch (error) {
            this.metrics.addLog('error', `❌ Error enviando fotos: ${error.message}`);
            await this.sendErrorMessage(client, chatId);
            return {
                photosSent: false,
                message: `Error: ${error.message}`
            };
        }
    }

    /**
     * Verificar si debe enviar fotos
     */
    shouldSendPhotos(messageText) {
        const text = messageText.toLowerCase();
        
        const photoKeywords = [
            'foto', 'fotos', 'imagen', 'imagenes', 'ver', 'muestra', 'enseña',
            'como se ve', 'como es', 'aspecto', 'apariencia', 'mostrar'
        ];
        
        const productKeywords = [
            'moto', 'pulsar', 'laptop', 'mouse', 'teclado', 'camara', 'monitor',
            'diadema', 'impresora', 'timon', 'palanca', 'macbook', 'piano', 'curso'
        ];
        
        const hasPhotoKeyword = photoKeywords.some(keyword => text.includes(keyword));
        const hasProductKeyword = productKeywords.some(keyword => text.includes(keyword));
        
        return hasPhotoKeyword && hasProductKeyword;
    }

    /**
     * Enviar fotos de producto específico
     */
    async sendSpecificProductPhotos(client, chatId, product, photos) {
        // Mensaje inicial
        await client.sendMessage(chatId, 
            `📸 *¡Perfecto! Te muestro ${product.name}*\n\n` +
            `💰 Precio: *${product.price}*\n` +
            `📊 Te envío ${photos.length} fotos del producto\n` +
            `⏳ Un momento...`
        );

        await this.delay(1000);

        // Enviar cada foto
        for (let i = 0; i < photos.length; i++) {
            const photo = photos[i];
            
            try {
                const media = MessageMedia.fromFilePath(photo.filePath);

                media.caption = 
                    `📸 *${product.name}*\n\n` +
                    `💰 Precio: *${product.price}*\n` +
                    `📊 Foto ${i + 1} de ${photos.length}\n\n` +
                    `📞 WhatsApp: *304 274 8687*\n` +
                    `🛒 ¿Te interesa este producto?`;

                await client.sendMessage(chatId, media);
                this.metrics.addLog('success', `📸 Enviada foto ${i + 1}/${photos.length}: ${photo.filename}`);

                // Delay entre fotos
                if (i < photos.length - 1) {
                    await this.delay(2000);
                }

            } catch (photoError) {
                this.metrics.addLog('error', `❌ Error enviando foto ${photo.filename}: ${photoError.message}`);
            }
        }

        // Mensaje final
        await this.delay(1000);
        await client.sendMessage(chatId, 
            `✅ *¡Fotos de ${product.name} enviadas!*\n\n` +
            `😍 ¿Qué te parece este producto?\n` +
            `💬 ¿Quieres ver otros productos similares?\n\n` +
            `📞 *Para más información:*\n` +
            `WhatsApp: *304 274 8687*\n\n` +
            `🛒 ¡Disponible para entrega inmediata! 😊`
        );
    }

    /**
     * Enviar mensaje de búsqueda de productos
     */
    async sendProductSearchMessage(client, chatId, query) {
        const availableCategories = [
            '💻 Laptops (MacBook, Lenovo, HP, ASUS)',
            '🖱️ Mouse y Teclados (Logitech, Trust)',
            '📸 Cámaras (GoPro, Logitech)',
            '🖥️ Monitores (LG UltraGear)',
            '🎧 Audio (Diademas Gaming)',
            '🖨️ Impresoras (Epson)',
            '🎮 Gaming (Timones, Palancas)',
            '🏍️ Motos (Pulsar NS 160 FI)',
            '🎹 Cursos (Piano Completo)'
        ];

        await client.sendMessage(chatId,
            `🔍 *Busqué "${query}" pero necesito ser más específico*\n\n` +
            `📦 *Productos disponibles con fotos:*\n\n` +
            availableCategories.join('\n') + '\n\n' +
            `💡 *Ejemplos de búsqueda:*\n` +
            `• "fotos de la moto" o "fotos del pulsar"\n` +
            `• "fotos de laptop" o "fotos macbook"\n` +
            `• "fotos de mouse" o "fotos logitech"\n` +
            `• "fotos de cámara" o "fotos gopro"\n` +
            `• "fotos del curso de piano"\n\n` +
            `¿Qué producto específico te interesa? 😊`
        );
    }

    /**
     * Enviar mensaje cuando no hay fotos
     */
    async sendNoPhotosMessage(client, chatId, product) {
        await client.sendMessage(chatId,
            `📦 *${product.name}*\n\n` +
            `💰 Precio: *${product.price}*\n\n` +
            `📸 *No tengo fotos de este producto específico en este momento*\n\n` +
            `📞 *Contáctame para más información:*\n` +
            `WhatsApp: *304 274 8687*\n\n` +
            `💬 ¿Te interesa otro producto? 😊`
        );
    }

    /**
     * Enviar mensaje de error
     */
    async sendErrorMessage(client, chatId) {
        await client.sendMessage(chatId,
            `😅 *Ups, hubo un problemita buscando las fotos*\n\n` +
            `📞 *Mejor contáctame directamente:*\n` +
            `WhatsApp: *304 274 8687*\n\n` +
            `🛒 ¡Te puedo ayudar con cualquier producto! 😊`
        );
    }

    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Recargar sistema (para hot reload)
     */
    async reloadSystem() {
        this.photoCache.clear();
        this.productDatabase.clear();
        await this.initializeSystem();
        this.metrics.addLog('success', '🔥 Sistema de fotos recargado automáticamente');
    }

    /**
     * Obtener estadísticas del sistema
     */
    getStats() {
        const categories = Array.from(this.photoCache.keys());
        const totalPhotos = Array.from(this.photoCache.values())
            .reduce((total, photos) => total + photos.length, 0);

        return {
            enabled: this.isEnabled,
            totalCategories: categories.length,
            totalPhotos: totalPhotos,
            totalProducts: this.productDatabase.size,
            categories: categories,
            photoPaths: this.photoPaths
        };
    }
}

export default EnhancedPhotoSystem;