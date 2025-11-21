"use strict";
/**
 * 📸 SERVICIO DE ENVÍO DE FOTOS
 * Maneja el envío robusto de fotos por WhatsApp
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoSenderService = void 0;
const media_service_1 = require("./media-service");
const db_1 = require("./db");
const google_drive_converter_1 = require("./google-drive-converter");
class PhotoSenderService {
    /**
     * Enviar fotos de un producto
     */
    static async sendProductPhotos(socket, to, product, conversationId, maxPhotos = 3) {
        try {
            // Obtener fotos del producto y convertir URLs de Google Drive
            let photos = product.images ? JSON.parse(product.images) : [];
            if (photos.length === 0) {
                console.log(`[PhotoSender] ⚠️ Producto no tiene fotos`);
                return { sent: 0, failed: 0 };
            }
            // Convertir URLs de Google Drive a URLs directas
            photos = google_drive_converter_1.GoogleDriveConverter.convertMultipleUrls(photos);
            console.log(`[PhotoSender] 📸 Enviando hasta ${maxPhotos} fotos de ${photos.length} disponibles`);
            let sent = 0;
            let failed = 0;
            for (let i = 0; i < Math.min(photos.length, maxPhotos); i++) {
                let photoUrl = photos[i];
                // Convertir URL de Google Drive si es necesario
                if (google_drive_converter_1.GoogleDriveConverter.isGoogleDriveUrl(photoUrl)) {
                    console.log(`[PhotoSender] 🔄 Convirtiendo URL de Google Drive...`);
                    photoUrl = google_drive_converter_1.GoogleDriveConverter.convertToDirectUrl(photoUrl);
                    console.log(`[PhotoSender] ✅ URL convertida: ${photoUrl}`);
                }
                try {
                    console.log(`[PhotoSender] 📤 Procesando foto ${i + 1}/${Math.min(photos.length, maxPhotos)}`);
                    console.log(`[PhotoSender] 🔗 URL: ${photoUrl}`);
                    // Validar que la URL sea accesible
                    const isValid = await media_service_1.MediaService.validateImageUrl(photoUrl);
                    if (!isValid) {
                        console.log(`[PhotoSender] ⚠️ URL no válida o no accesible`);
                        failed++;
                        continue;
                    }
                    console.log(`[PhotoSender] ✅ URL válida, descargando...`);
                    // Preparar imagen
                    const imageData = await media_service_1.MediaService.prepareImageMessage(photoUrl, i === 0 ? `${product.name}\n💰 ${product.price.toLocaleString('es-CO')} COP` : undefined);
                    // Verificar buffer
                    if (!imageData.image || imageData.image.length === 0) {
                        console.log(`[PhotoSender] ⚠️ Buffer de imagen vacío`);
                        failed++;
                        continue;
                    }
                    const sizeKB = (imageData.image.length / 1024).toFixed(2);
                    console.log(`[PhotoSender] 📦 Imagen preparada: ${sizeKB} KB`);
                    // Enviar imagen
                    await socket.sendMessage(to, {
                        image: imageData.image,
                        caption: imageData.caption || ''
                    });
                    console.log(`[PhotoSender] ✅ Foto ${i + 1} enviada exitosamente`);
                    sent++;
                    // Guardar en DB
                    await db_1.db.message.create({
                        data: {
                            conversationId,
                            content: `[Foto ${i + 1} de ${product.name}]`,
                            direction: 'OUTGOING',
                            type: 'IMAGE'
                        }
                    });
                    // Pausa entre fotos
                    if (i < Math.min(photos.length, maxPhotos) - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1500));
                    }
                }
                catch (error) {
                    console.error(`[PhotoSender] ❌ Error enviando foto ${i + 1}:`, error.message);
                    failed++;
                }
            }
            console.log(`[PhotoSender] 📊 Resultado: ${sent} enviadas, ${failed} fallidas`);
            return { sent, failed };
        }
        catch (error) {
            console.error('[PhotoSender] ❌ Error general:', error);
            return { sent: 0, failed: 0 };
        }
    }
    /**
     * Detectar si el mensaje solicita fotos
     */
    static detectPhotoRequest(message) {
        const normalized = message.toLowerCase().trim();
        const photoPatterns = [
            /\b(foto|fotos|imagen|imagenes|imágenes|pic|pics|picture|pictures)\b/i,
            /\b(me\s+(envía|envia|manda|pasa|muestra|enseña))\s+(foto|fotos|imagen)/i,
            /\b(tiene|tienes|hay)\s+(foto|fotos|imagen)/i,
            /\b(ver|mirar|revisar)\s+(foto|fotos|imagen)/i,
            /\b(foto|fotos|imagen)\s+(del|de|para|sobre)/i,
            /\b(cómo|como)\s+(se\s+ve|luce|es)/i,
            /\b(me\s+envía|me\s+envia|me\s+manda|me\s+pasa|envíame|enviame)\b/i
        ];
        return photoPatterns.some(pattern => pattern.test(normalized));
    }
}
exports.PhotoSenderService = PhotoSenderService;
