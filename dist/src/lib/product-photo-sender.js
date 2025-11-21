"use strict";
/**
 * 📸 SERVICIO ESPECIALIZADO DE ENVÍO DE FOTOS DE PRODUCTOS
 * Envía cada producto con su foto correspondiente
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductPhotoSender = void 0;
const google_drive_converter_1 = require("./google-drive-converter");
const axios_1 = __importDefault(require("axios"));
class ProductPhotoSender {
    /**
     * Enviar productos con sus fotos (uno por uno)
     */
    static async sendProductsWithPhotos(socket, to, products, maxProducts = 5) {
        try {
            console.log(`[ProductPhotoSender] 📸 Enviando ${Math.min(products.length, maxProducts)} productos con fotos`);
            let sent = 0;
            let failed = 0;
            for (let i = 0; i < Math.min(products.length, maxProducts); i++) {
                const product = products[i];
                try {
                    // Enviar producto con su foto
                    const result = await this.sendSingleProductWithPhoto(socket, to, product, i + 1, Math.min(products.length, maxProducts));
                    if (result.success) {
                        sent++;
                    }
                    else {
                        failed++;
                    }
                    // Pausa entre productos para no saturar
                    if (i < Math.min(products.length, maxProducts) - 1) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
                catch (error) {
                    console.error(`[ProductPhotoSender] ❌ Error enviando producto ${i + 1}:`, error.message);
                    failed++;
                }
            }
            console.log(`[ProductPhotoSender] 📊 Resultado: ${sent} enviados, ${failed} fallidos`);
            return { sent, failed };
        }
        catch (error) {
            console.error('[ProductPhotoSender] ❌ Error general:', error);
            return { sent: 0, failed: 0 };
        }
    }
    /**
     * Enviar un solo producto con su foto
     */
    static async sendSingleProductWithPhoto(socket, to, product, index, total) {
        try {
            console.log(`[ProductPhotoSender] 📦 Enviando producto ${index}/${total}: ${product.name}`);
            // Obtener fotos del producto
            let photos = [];
            if (product.images) {
                try {
                    const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                    photos = Array.isArray(parsed) ? parsed : [parsed];
                    console.log(`[ProductPhotoSender] 📸 Fotos encontradas: ${photos.length}`);
                }
                catch (e) {
                    console.log(`[ProductPhotoSender] ⚠️ Error parseando imágenes:`, e);
                }
            }
            // Convertir URLs de Google Drive
            if (photos.length > 0) {
                photos = google_drive_converter_1.GoogleDriveConverter.convertMultipleUrls(photos);
                console.log(`[ProductPhotoSender] 🔗 URLs convertidas: ${photos[0]}`);
            }
            // Preparar mensaje de texto
            const caption = this.formatProductCaption(product, index, total);
            // Si tiene foto, enviar con imagen
            if (photos.length > 0 && photos[0] && photos[0].trim() !== '') {
                const photoUrl = photos[0]; // Primera foto del producto
                console.log(`[ProductPhotoSender] 🖼️ Intentando descargar foto desde: ${photoUrl.substring(0, 100)}...`);
                try {
                    // Descargar imagen
                    const imageBuffer = await this.downloadImage(photoUrl);
                    if (!imageBuffer) {
                        console.log(`[ProductPhotoSender] ⚠️ No se pudo descargar la imagen, enviando solo texto`);
                        await socket.sendMessage(to, { text: caption });
                        return { success: true };
                    }
                    console.log(`[ProductPhotoSender] ✅ Imagen descargada, enviando...`);
                    // Enviar imagen con caption
                    await socket.sendMessage(to, {
                        image: imageBuffer,
                        caption: caption
                    });
                    console.log(`[ProductPhotoSender] ✅ Producto enviado con foto exitosamente`);
                    return { success: true };
                }
                catch (error) {
                    console.error(`[ProductPhotoSender] ❌ Error enviando imagen:`, error.message);
                    console.error(`[ProductPhotoSender] Stack:`, error.stack);
                    // Si falla la imagen, enviar solo texto
                    await socket.sendMessage(to, { text: caption });
                    return { success: true };
                }
            }
            else {
                // Sin foto, enviar solo texto
                console.log(`[ProductPhotoSender] 📝 Producto sin foto válida, enviando solo texto`);
                await socket.sendMessage(to, { text: caption });
                return { success: true };
            }
        }
        catch (error) {
            console.error(`[ProductPhotoSender] ❌ Error general:`, error.message);
            return { success: false, error: error.message };
        }
    }
    /**
     * Formatear caption del producto (VERSIÓN MEJORADA Y ORDENADA)
     */
    static formatProductCaption(product, index, total) {
        let caption = '';
        // 🎯 ENCABEZADO CON NOMBRE
        caption += `━━━━━━━━━━━━━━━━━━━━\n`;
        caption += `✨ *${product.name}*\n`;
        caption += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        // 📝 DESCRIPCIÓN COMPLETA (no truncada)
        if (product.description && product.description.length > 10) {
            caption += `📝 *Descripción:*\n`;
            caption += `${product.description}\n\n`;
        }
        // ✨ ESPECIFICACIONES (si existen)
        if (product.specs) {
            try {
                const specs = typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs;
                // Detectar tipo de producto
                const isCourse = product.name.toLowerCase().includes('curso') ||
                    product.description?.toLowerCase().includes('curso') ||
                    product.description?.toLowerCase().includes('aprende');
                const isMegapack = product.name.toLowerCase().includes('megapack') ||
                    product.name.toLowerCase().includes('mega pack');
                if (isCourse) {
                    // FORMATO PARA CURSOS
                    caption += `🎓 *Detalles del Curso:*\n`;
                    if (specs.duration)
                        caption += `⏱️ Duración: ${specs.duration}\n`;
                    if (specs.level)
                        caption += `📊 Nivel: ${specs.level}\n`;
                    if (specs.modules)
                        caption += `📚 Módulos: ${specs.modules}\n`;
                    if (specs.lessons)
                        caption += `🎬 Lecciones: ${specs.lessons}\n`;
                    if (specs.language)
                        caption += `🌐 Idioma: ${specs.language}\n`;
                    if (specs.certificate)
                        caption += `🏆 Certificado: ${specs.certificate}\n`;
                    if (specs.access)
                        caption += `♾️ Acceso: ${specs.access}\n`;
                    if (specs.support)
                        caption += `💬 Soporte: ${specs.support}\n`;
                    caption += '\n';
                    // QUÉ APRENDERÁS
                    if (specs.whatYouLearn || specs.topics) {
                        caption += `💡 *Qué Aprenderás:*\n`;
                        const topics = specs.whatYouLearn || specs.topics;
                        if (Array.isArray(topics)) {
                            topics.slice(0, 5).forEach((topic) => {
                                caption += `  ✓ ${topic}\n`;
                            });
                        }
                        else if (typeof topics === 'string') {
                            caption += `  ${topics}\n`;
                        }
                        caption += '\n';
                    }
                }
                else if (isMegapack) {
                    // FORMATO PARA MEGAPACKS
                    caption += `📦 *Contenido del Megapack:*\n`;
                    if (specs.totalCourses)
                        caption += `🎓 Cursos incluidos: ${specs.totalCourses}\n`;
                    if (specs.totalSize)
                        caption += `💾 Tamaño total: ${specs.totalSize}\n`;
                    if (specs.categories)
                        caption += `📂 Categorías: ${specs.categories}\n`;
                    if (specs.format)
                        caption += `📄 Formato: ${specs.format}\n`;
                    if (specs.language)
                        caption += `🌐 Idioma: ${specs.language}\n`;
                    caption += '\n';
                }
                else {
                    // FORMATO PARA PRODUCTOS FÍSICOS (laptops, motos, etc.)
                    caption += `✨ *Especificaciones:*\n`;
                    if (specs.processor)
                        caption += `⚙️ Procesador: ${specs.processor}\n`;
                    if (specs.ram)
                        caption += `💾 RAM: ${specs.ram}\n`;
                    if (specs.storage)
                        caption += `💿 Almacenamiento: ${specs.storage}\n`;
                    if (specs.screen)
                        caption += `🖥️ Pantalla: ${specs.screen}\n`;
                    if (specs.graphics)
                        caption += `🎮 Gráficos: ${specs.graphics}\n`;
                    if (specs.battery)
                        caption += `🔋 Batería: ${specs.battery}\n`;
                    if (specs.weight)
                        caption += `⚖️ Peso: ${specs.weight}\n`;
                    if (specs.color)
                        caption += `🎨 Color: ${specs.color}\n`;
                    if (specs.brand)
                        caption += `🏷️ Marca: ${specs.brand}\n`;
                    if (specs.model)
                        caption += `📱 Modelo: ${specs.model}\n`;
                    caption += '\n';
                }
            }
            catch (e) {
                console.error('[ProductPhotoSender] Error parseando specs:', e);
            }
        }
        // 💰 PRECIO DESTACADO
        const formattedPrice = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: product.currency || 'COP',
            minimumFractionDigits: 0
        }).format(product.price);
        caption += `━━━━━━━━━━━━━━━━━━━━\n`;
        caption += `💰 *PRECIO: ${formattedPrice}*\n`;
        caption += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        // ✅ BENEFICIOS Y CALL TO ACTION
        if (total === 1) {
            caption += `✅ *Beneficios:*\n`;
            caption += `  • Disponible de inmediato\n`;
            caption += `  • Envío a toda Colombia\n`;
            caption += `  • Garantía incluida\n`;
            caption += `  • Soporte personalizado\n\n`;
            caption += `💬 ¿Te interesa? Puedo enviarte los métodos de pago 😊`;
        }
        else {
            caption += `📱 Opción ${index} de ${total}\n\n`;
        }
        return caption;
    }
    /**
     * Descargar imagen desde URL
     */
    static async downloadImage(url) {
        try {
            // Validar URL
            if (!url || url.trim() === '') {
                return null;
            }
            // Convertir URL de Google Drive si es necesario
            if (google_drive_converter_1.GoogleDriveConverter.isGoogleDriveUrl(url)) {
                url = google_drive_converter_1.GoogleDriveConverter.convertToDirectUrl(url);
            }
            console.log(`[ProductPhotoSender] 📥 Descargando imagen...`);
            const response = await axios_1.default.get(url, {
                responseType: 'arraybuffer',
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            if (response.status === 200 && response.data) {
                const buffer = Buffer.from(response.data);
                const sizeKB = (buffer.length / 1024).toFixed(2);
                console.log(`[ProductPhotoSender] ✅ Imagen descargada: ${sizeKB} KB`);
                return buffer;
            }
            return null;
        }
        catch (error) {
            console.error(`[ProductPhotoSender] ❌ Error descargando imagen:`, error.message);
            return null;
        }
    }
    /**
     * Detectar si el mensaje solicita fotos
     */
    static detectPhotoRequest(message) {
        const normalized = message.toLowerCase().trim();
        const photoPatterns = [
            // Solicitudes directas
            /\b(foto|fotos|imagen|imagenes|imágenes|pic|pics|picture|pictures)\b/i,
            /\b(me\s+(envía|envia|manda|pasa|muestra|enseña))\s+(foto|fotos|imagen)/i,
            /\b(tiene|tienes|hay)\s+(foto|fotos|imagen)/i,
            /\b(ver|mirar|revisar|mostrar)\s+(foto|fotos|imagen)/i,
            /\b(foto|fotos|imagen)\s+(del|de|para|sobre)/i,
            /\b(cómo|como)\s+(se\s+ve|luce|es)/i,
            // Variaciones colombianas
            /\b(mándame|mandame|pasame|pásame)\s+(foto|fotos|imagen)/i,
            /\b(quiero\s+ver)/i,
            /\b(déjame|dejame)\s+ver/i,
            /\b(a\s+ver)/i,
            // Preguntas sobre apariencia
            /\b(qué\s+tal\s+se\s+ve|que\s+tal\s+se\s+ve)/i,
            /\b(cómo\s+es|como\s+es)/i,
            /\b(de\s+qué\s+color|de\s+que\s+color)/i,
        ];
        return photoPatterns.some(pattern => pattern.test(normalized));
    }
}
exports.ProductPhotoSender = ProductPhotoSender;
