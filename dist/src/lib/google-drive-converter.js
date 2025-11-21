"use strict";
/**
 * 🔗 CONVERTIDOR DE URLS DE GOOGLE DRIVE
 * Convierte URLs de Google Drive a URLs directas de imagen
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleDriveConverter = void 0;
class GoogleDriveConverter {
    /**
     * Detectar si es URL de Google Drive
     */
    static isGoogleDriveUrl(url) {
        return url.includes('drive.google.com');
    }
    /**
     * Extraer ID de archivo de Google Drive
     */
    static extractFileId(url) {
        try {
            // Formato: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
            const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
            return match ? match[1] : null;
        }
        catch (error) {
            console.error('[GoogleDrive] Error extrayendo ID:', error);
            return null;
        }
    }
    /**
     * Convertir URL de Google Drive a URL directa
     */
    static convertToDirectUrl(url) {
        if (!this.isGoogleDriveUrl(url)) {
            return url;
        }
        const fileId = this.extractFileId(url);
        if (!fileId) {
            console.warn('[GoogleDrive] No se pudo extraer ID del archivo');
            return url;
        }
        // Convertir a URL directa de descarga
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    /**
     * Convertir múltiples URLs
     */
    static convertMultipleUrls(urls) {
        return urls.map(url => this.convertToDirectUrl(url));
    }
    /**
     * Validar y convertir URL de producto
     */
    static processProductImages(images) {
        try {
            const imageArray = typeof images === 'string' ? JSON.parse(images) : images;
            return this.convertMultipleUrls(imageArray);
        }
        catch (error) {
            console.error('[GoogleDrive] Error procesando imágenes:', error);
            return [];
        }
    }
}
exports.GoogleDriveConverter = GoogleDriveConverter;
