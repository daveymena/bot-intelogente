"use strict";
/**
 * 🔍 Servicio de Validación de Credenciales de Pago
 *
 * Valida credenciales de MercadoPago, PayPal, Hotmart y otros
 * proveedores de pago antes de guardarlas en la base de datos.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentValidator = void 0;
class PaymentValidator {
    /**
     * Valida credenciales de MercadoPago
     *
     * @param accessToken - Access Token de MercadoPago
     * @param publicKey - Public Key (opcional)
     * @returns Resultado de validación
     */
    static async validateMercadoPago(accessToken, publicKey) {
        try {
            // Validar formato
            if (!accessToken.startsWith('APP_USR-') && !accessToken.startsWith('TEST-')) {
                return {
                    isValid: false,
                    message: 'Formato de Access Token inválido. Debe comenzar con APP_USR- o TEST-'
                };
            }
            // Probar conexión con API de MercadoPago
            const response = await fetch('https://api.mercadopago.com/v1/account/settings', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                return {
                    isValid: false,
                    message: `Error de MercadoPago: ${error.message || response.statusText}`,
                    details: error
                };
            }
            const data = await response.json();
            return {
                isValid: true,
                message: `Conexión exitosa con MercadoPago (${data.site_id || 'Colombia'})`,
                details: {
                    siteId: data.site_id,
                    email: data.email
                }
            };
        }
        catch (error) {
            console.error('[PaymentValidator] Error validando MercadoPago:', error);
            return {
                isValid: false,
                message: `Error de conexión: ${error.message}`,
                details: error
            };
        }
    }
    /**
     * Valida credenciales de PayPal
     *
     * @param clientId - Client ID de PayPal
     * @param clientSecret - Client Secret de PayPal
     * @param mode - 'sandbox' o 'live'
     * @returns Resultado de validación
     */
    static async validatePayPal(clientId, clientSecret, mode = 'sandbox') {
        try {
            // Validar formato básico
            if (clientId.length < 50) {
                return {
                    isValid: false,
                    message: 'Client ID de PayPal parece inválido (muy corto)'
                };
            }
            if (clientSecret.length < 50) {
                return {
                    isValid: false,
                    message: 'Client Secret de PayPal parece inválido (muy corto)'
                };
            }
            // Determinar URL base según el modo
            const baseUrl = mode === 'live'
                ? 'https://api-m.paypal.com'
                : 'https://api-m.sandbox.paypal.com';
            // Obtener token de acceso
            const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
            const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'grant_type=client_credentials'
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                return {
                    isValid: false,
                    message: `Error de PayPal: ${error.error_description || response.statusText}`,
                    details: error
                };
            }
            const data = await response.json();
            return {
                isValid: true,
                message: `Conexión exitosa con PayPal (${mode})`,
                details: {
                    mode,
                    scope: data.scope,
                    expiresIn: data.expires_in
                }
            };
        }
        catch (error) {
            console.error('[PaymentValidator] Error validando PayPal:', error);
            return {
                isValid: false,
                message: `Error de conexión: ${error.message}`,
                details: error
            };
        }
    }
    /**
     * Valida formato de API Key de Hotmart
     *
     * @param apiKey - API Key de Hotmart
     * @returns Resultado de validación
     */
    static validateHotmart(apiKey) {
        try {
            // Hotmart usa API keys de 32 caracteres hexadecimales
            const hexRegex = /^[a-f0-9]{32}$/i;
            if (!hexRegex.test(apiKey)) {
                return {
                    isValid: false,
                    message: 'Formato de API Key de Hotmart inválido (debe ser 32 caracteres hexadecimales)'
                };
            }
            return {
                isValid: true,
                message: 'Formato de API Key válido (nota: no se puede validar conexión sin hacer una transacción real)'
            };
        }
        catch (error) {
            return {
                isValid: false,
                message: `Error validando Hotmart: ${error.message}`
            };
        }
    }
    /**
     * Valida número de teléfono colombiano (Nequi/Daviplata)
     *
     * @param phone - Número de teléfono
     * @returns Resultado de validación
     */
    static validateColombianPhone(phone) {
        try {
            // Limpiar el número
            const cleanPhone = phone.replace(/\D/g, '');
            // Validar formato colombiano (10 dígitos, empieza con 3)
            if (!/^3\d{9}$/.test(cleanPhone)) {
                return {
                    isValid: false,
                    message: 'Número de teléfono inválido. Debe ser un celular colombiano (10 dígitos, empieza con 3)'
                };
            }
            return {
                isValid: true,
                message: 'Número de teléfono válido',
                details: { formatted: cleanPhone }
            };
        }
        catch (error) {
            return {
                isValid: false,
                message: `Error validando teléfono: ${error.message}`
            };
        }
    }
    /**
     * Valida número de cuenta bancaria colombiana
     *
     * @param accountNumber - Número de cuenta
     * @returns Resultado de validación
     */
    static validateBankAccount(accountNumber) {
        try {
            // Limpiar el número
            const cleanAccount = accountNumber.replace(/\D/g, '');
            // Validar longitud (cuentas colombianas: 10-16 dígitos)
            if (cleanAccount.length < 10 || cleanAccount.length > 16) {
                return {
                    isValid: false,
                    message: 'Número de cuenta inválido. Debe tener entre 10 y 16 dígitos'
                };
            }
            return {
                isValid: true,
                message: 'Número de cuenta válido',
                details: { formatted: cleanAccount }
            };
        }
        catch (error) {
            return {
                isValid: false,
                message: `Error validando cuenta bancaria: ${error.message}`
            };
        }
    }
    /**
     * Valida URL de checkout (Hotmart, etc.)
     *
     * @param url - URL a validar
     * @returns Resultado de validación
     */
    static validateCheckoutUrl(url) {
        try {
            const urlObj = new URL(url);
            // Validar que sea HTTPS
            if (urlObj.protocol !== 'https:') {
                return {
                    isValid: false,
                    message: 'La URL debe usar HTTPS'
                };
            }
            // Validar dominios conocidos
            const validDomains = [
                'pay.hotmart.com',
                'checkout.hotmart.com',
                'mpago.la',
                'mercadopago.com',
                'paypal.com',
                'paypal.me'
            ];
            const isValidDomain = validDomains.some(domain => urlObj.hostname.includes(domain));
            if (!isValidDomain) {
                return {
                    isValid: false,
                    message: 'Dominio no reconocido. Verifica que sea una URL válida de pago'
                };
            }
            return {
                isValid: true,
                message: 'URL de checkout válida',
                details: { domain: urlObj.hostname }
            };
        }
        catch (error) {
            return {
                isValid: false,
                message: 'URL inválida'
            };
        }
    }
    /**
     * Valida todas las credenciales de un proveedor
     *
     * @param provider - Nombre del proveedor
     * @param credentials - Credenciales a validar
     * @returns Resultado de validación
     */
    static async validateProvider(provider, credentials) {
        switch (provider.toLowerCase()) {
            case 'mercadopago':
                return this.validateMercadoPago(credentials.accessToken, credentials.publicKey);
            case 'paypal':
                return this.validatePayPal(credentials.clientId, credentials.clientSecret, credentials.mode || 'sandbox');
            case 'hotmart':
                return this.validateHotmart(credentials.apiKey);
            case 'nequi':
            case 'daviplata':
                return this.validateColombianPhone(credentials.phone);
            case 'bank':
                return this.validateBankAccount(credentials.accountNumber);
            default:
                return {
                    isValid: false,
                    message: `Proveedor desconocido: ${provider}`
                };
        }
    }
}
exports.PaymentValidator = PaymentValidator;
// Exportar también como default
exports.default = PaymentValidator;
