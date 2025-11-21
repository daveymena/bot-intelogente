"use strict";
/**
 * 🛡️ Servicio de Seguridad
 *
 * Maneja rate limiting, sanitización de inputs, validación de formatos
 * y otras funciones de seguridad para proteger la aplicación.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityService = void 0;
class SecurityService {
    /**
     * Verifica rate limiting para una IP
     *
     * @param ip - Dirección IP del cliente
     * @param maxRequests - Máximo de requests permitidos
     * @param windowMs - Ventana de tiempo en milisegundos
     * @returns true si está dentro del límite, false si excedió
     */
    static checkRateLimit(ip, maxRequests = 10, windowMs = 60000) {
        // Verificar si la IP está bloqueada
        if (this.blockedIPs.has(ip)) {
            return false;
        }
        const now = Date.now();
        const requests = this.requests.get(ip) || [];
        // Limpiar requests antiguos fuera de la ventana
        const validRequests = requests.filter(time => now - time < windowMs);
        // Verificar si excedió el límite
        if (validRequests.length >= maxRequests) {
            // Si excede mucho, bloquear temporalmente
            if (validRequests.length >= maxRequests * 2) {
                this.blockIP(ip, 300000); // 5 minutos
            }
            return false;
        }
        // Agregar el request actual
        validRequests.push(now);
        this.requests.set(ip, validRequests);
        return true;
    }
    /**
     * Bloquea una IP temporalmente
     *
     * @param ip - IP a bloquear
     * @param durationMs - Duración del bloqueo en ms
     */
    static blockIP(ip, durationMs = 300000) {
        this.blockedIPs.add(ip);
        console.warn(`[Security] 🚫 IP bloqueada: ${ip} por ${durationMs}ms`);
        // Desbloquear después del tiempo especificado
        setTimeout(() => {
            this.blockedIPs.delete(ip);
            console.log(`[Security] ✅ IP desbloqueada: ${ip}`);
        }, durationMs);
    }
    /**
     * Limpia el historial de rate limiting (útil para testing)
     */
    static clearRateLimits() {
        this.requests.clear();
        this.blockedIPs.clear();
    }
    /**
     * Sanitiza un input de texto
     *
     * @param input - Texto a sanitizar
     * @param maxLength - Longitud máxima permitida
     * @returns Texto sanitizado
     */
    static sanitizeInput(input, maxLength = 1000) {
        if (!input)
            return '';
        return input
            .replace(/[<>]/g, '') // Remover < y > para prevenir XSS
            .replace(/javascript:/gi, '') // Remover javascript: URLs
            .replace(/on\w+=/gi, '') // Remover event handlers
            .trim()
            .slice(0, maxLength);
    }
    /**
     * Sanitiza un email
     *
     * @param email - Email a sanitizar
     * @returns Email sanitizado o null si es inválido
     */
    static sanitizeEmail(email) {
        if (!email)
            return null;
        const sanitized = email.toLowerCase().trim();
        // Validar formato básico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitized)) {
            return null;
        }
        return sanitized;
    }
    /**
     * Sanitiza un número de teléfono
     *
     * @param phone - Teléfono a sanitizar
     * @returns Teléfono sanitizado (solo dígitos)
     */
    static sanitizePhone(phone) {
        if (!phone)
            return '';
        return phone.replace(/\D/g, '');
    }
    /**
     * Valida formato de API key según el proveedor
     *
     * @param key - API key a validar
     * @param provider - Proveedor (mercadopago, paypal, etc.)
     * @returns true si el formato es válido
     */
    static validateApiKeyFormat(key, provider) {
        if (!key)
            return false;
        const patterns = {
            mercadopago: /^(APP_USR-|TEST-)[a-zA-Z0-9-]+$/,
            paypal: /^[A-Za-z0-9_-]{50,}$/,
            hotmart: /^[a-f0-9]{32}$/i,
            stripe: /^(sk|pk)_(test|live)_[a-zA-Z0-9]{24,}$/
        };
        const pattern = patterns[provider.toLowerCase()];
        return pattern ? pattern.test(key) : true; // Si no hay patrón, aceptar
    }
    /**
     * Valida que una URL sea segura (HTTPS)
     *
     * @param url - URL a validar
     * @returns true si es segura
     */
    static isSecureUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'https:';
        }
        catch {
            return false;
        }
    }
    /**
     * Genera un token seguro aleatorio
     *
     * @param length - Longitud en bytes
     * @returns Token en formato hex
     */
    static generateSecureToken(length = 32) {
        const crypto = require('crypto');
        return crypto.randomBytes(length).toString('hex');
    }
    /**
     * Hash de un valor con SHA-256
     *
     * @param value - Valor a hashear
     * @returns Hash en formato hex
     */
    static hash(value) {
        const crypto = require('crypto');
        return crypto
            .createHash('sha256')
            .update(value)
            .digest('hex');
    }
    /**
     * Verifica si un request viene de un origen permitido
     *
     * @param origin - Origen del request
     * @param allowedOrigins - Lista de orígenes permitidos
     * @returns true si está permitido
     */
    static isAllowedOrigin(origin, allowedOrigins) {
        if (!origin)
            return false;
        return allowedOrigins.some(allowed => {
            if (allowed === '*')
                return true;
            if (allowed.includes('*')) {
                const regex = new RegExp('^' + allowed.replace('*', '.*') + '$');
                return regex.test(origin);
            }
            return origin === allowed;
        });
    }
    /**
     * Extrae la IP del cliente desde el request
     *
     * @param request - Request de Next.js
     * @returns IP del cliente
     */
    static getClientIP(request) {
        // Intentar obtener IP de headers comunes
        const forwarded = request.headers.get('x-forwarded-for');
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }
        const realIP = request.headers.get('x-real-ip');
        if (realIP) {
            return realIP;
        }
        // Fallback a IP del socket (puede ser proxy)
        return request.ip || 'unknown';
    }
    /**
     * Valida que un objeto JSON no contenga propiedades peligrosas
     *
     * @param obj - Objeto a validar
     * @returns true si es seguro
     */
    static isSafeJSON(obj) {
        if (!obj || typeof obj !== 'object')
            return true;
        const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
        for (const key of Object.keys(obj)) {
            if (dangerousKeys.includes(key)) {
                return false;
            }
            if (typeof obj[key] === 'object') {
                if (!this.isSafeJSON(obj[key])) {
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * Limpia datos sensibles de un objeto para logging
     *
     * @param obj - Objeto a limpiar
     * @returns Objeto sin datos sensibles
     */
    static sanitizeForLogging(obj) {
        if (!obj || typeof obj !== 'object')
            return obj;
        const sensitiveKeys = [
            'password',
            'apiKey',
            'accessToken',
            'clientSecret',
            'privateKey',
            'secret',
            'token',
            'authorization'
        ];
        const cleaned = Array.isArray(obj) ? [] : {};
        for (const [key, value] of Object.entries(obj)) {
            const lowerKey = key.toLowerCase();
            if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
                cleaned[key] = '***REDACTED***';
            }
            else if (typeof value === 'object' && value !== null) {
                cleaned[key] = this.sanitizeForLogging(value);
            }
            else {
                cleaned[key] = value;
            }
        }
        return cleaned;
    }
}
exports.SecurityService = SecurityService;
// Rate limiting en memoria (para desarrollo/producción sin Redis)
SecurityService.requests = new Map();
SecurityService.blockedIPs = new Set();
// Exportar también como default
exports.default = SecurityService;
