"use strict";
/**
 * 📸 SERVICIO DE MEDIOS
 * Prepara imágenes y otros medios para enviar por WhatsApp
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class MediaService {
    /**
     * Preparar imagen para enviar por WhatsApp
     */
    static async prepareImageMessage(imageUrl, caption) {
        console.log('📸 Preparando imagen:', imageUrl);
        try {
            let imageBuffer;
            // Si es URL, descargar
            if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                console.log('🌐 Descargando imagen desde URL...');
                const response = await axios_1.default.get(imageUrl, {
                    responseType: 'arraybuffer',
                    timeout: 10000
                });
                imageBuffer = Buffer.from(response.data);
            }
            // Si es ruta local
            else {
                console.log('📁 Leyendo imagen desde archivo local...');
                const fullPath = path_1.default.isAbsolute(imageUrl)
                    ? imageUrl
                    : path_1.default.join(process.cwd(), imageUrl);
                imageBuffer = await fs_1.default.promises.readFile(fullPath);
            }
            console.log('✅ Imagen preparada:', imageBuffer.length, 'bytes');
            return {
                image: imageBuffer,
                caption
            };
        }
        catch (error) {
            console.error('❌ Error preparando imagen:', error);
            throw new Error('No se pudo preparar la imagen');
        }
    }
    /**
     * Validar que una URL de imagen sea accesible
     */
    static async validateImageUrl(url) {
        try {
            const response = await axios_1.default.head(url, { timeout: 5000 });
            const contentType = response.headers['content-type'];
            return contentType?.startsWith('image/') || false;
        }
        catch {
            return false;
        }
    }
    /**
     * Obtener tamaño de imagen
     */
    static async getImageSize(imageUrl) {
        try {
            if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                const response = await axios_1.default.head(imageUrl, { timeout: 5000 });
                return parseInt(response.headers['content-length'] || '0');
            }
            else {
                const stats = await fs_1.default.promises.stat(imageUrl);
                return stats.size;
            }
        }
        catch {
            return 0;
        }
    }
}
exports.MediaService = MediaService;
