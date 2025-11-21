"use strict";
// Servicio de conversión de moneda con detección automática de país
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyService = void 0;
// Tasas de cambio actualizadas (base: USD = 1)
const EXCHANGE_RATES = {
    USD: { code: 'USD', symbol: '$', name: 'Dólar', rate: 1 },
    COP: { code: 'COP', symbol: '$', name: 'Peso Colombiano', rate: 4200 },
    MXN: { code: 'MXN', symbol: '$', name: 'Peso Mexicano', rate: 17 },
    ARS: { code: 'ARS', symbol: '$', name: 'Peso Argentino', rate: 350 },
    CLP: { code: 'CLP', symbol: '$', name: 'Peso Chileno', rate: 900 },
    PEN: { code: 'PEN', symbol: 'S/', name: 'Sol Peruano', rate: 3.7 },
    BRL: { code: 'BRL', symbol: 'R$', name: 'Real Brasileño', rate: 5 },
    EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
    GBP: { code: 'GBP', symbol: '£', name: 'Libra Esterlina', rate: 0.79 },
    VES: { code: 'VES', symbol: 'Bs', name: 'Bolívar Venezolano', rate: 36 },
    UYU: { code: 'UYU', symbol: '$', name: 'Peso Uruguayo', rate: 39 },
    BOB: { code: 'BOB', symbol: 'Bs', name: 'Boliviano', rate: 6.9 },
    PYG: { code: 'PYG', symbol: '₲', name: 'Guaraní Paraguayo', rate: 7300 },
    GTQ: { code: 'GTQ', symbol: 'Q', name: 'Quetzal Guatemalteco', rate: 7.8 },
    HNL: { code: 'HNL', symbol: 'L', name: 'Lempira Hondureño', rate: 24.7 },
    NIO: { code: 'NIO', symbol: 'C$', name: 'Córdoba Nicaragüense', rate: 36.7 },
    CRC: { code: 'CRC', symbol: '₡', name: 'Colón Costarricense', rate: 520 },
    PAB: { code: 'PAB', symbol: 'B/.', name: 'Balboa Panameño', rate: 1 },
    DOP: { code: 'DOP', symbol: 'RD$', name: 'Peso Dominicano', rate: 58 },
};
// Mapeo de países a monedas
const COUNTRY_CURRENCY_MAP = {
    CO: 'COP', // Colombia
    MX: 'MXN', // México
    AR: 'ARS', // Argentina
    CL: 'CLP', // Chile
    PE: 'PEN', // Perú
    BR: 'BRL', // Brasil
    VE: 'VES', // Venezuela
    UY: 'UYU', // Uruguay
    BO: 'BOB', // Bolivia
    PY: 'PYG', // Paraguay
    EC: 'USD', // Ecuador (usa USD)
    SV: 'USD', // El Salvador (usa USD)
    PA: 'PAB', // Panamá
    GT: 'GTQ', // Guatemala
    HN: 'HNL', // Honduras
    NI: 'NIO', // Nicaragua
    CR: 'CRC', // Costa Rica
    DO: 'DOP', // República Dominicana
    ES: 'EUR', // España
    US: 'USD', // Estados Unidos
    GB: 'GBP', // Reino Unido
};
class CurrencyService {
    /**
     * Detecta el país del usuario usando geolocalización IP
     */
    static async detectUserCountry() {
        try {
            // Intentar obtener de localStorage primero
            const cached = localStorage.getItem('user-country-info');
            if (cached) {
                const parsed = JSON.parse(cached);
                // Verificar que no tenga más de 24 horas
                if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                    this.userCountry = parsed.countryCode;
                    this.userCurrency = parsed.currency;
                    return parsed;
                }
            }
            // Usar API de geolocalización gratuita
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            const countryCode = data.country_code || 'CO';
            const currencyCode = COUNTRY_CURRENCY_MAP[countryCode] || 'COP';
            const currency = EXCHANGE_RATES[currencyCode] || EXCHANGE_RATES.COP;
            const countryInfo = {
                country: data.country_name || 'Colombia',
                countryCode,
                currency
            };
            // Guardar en localStorage
            localStorage.setItem('user-country-info', JSON.stringify({
                ...countryInfo,
                timestamp: Date.now()
            }));
            this.userCountry = countryCode;
            this.userCurrency = currency;
            return countryInfo;
        }
        catch (error) {
            console.error('Error detecting country:', error);
            // Fallback a Colombia
            const fallback = {
                country: 'Colombia',
                countryCode: 'CO',
                currency: EXCHANGE_RATES.COP
            };
            this.userCountry = 'CO';
            this.userCurrency = EXCHANGE_RATES.COP;
            return fallback;
        }
    }
    /**
     * Convierte un precio de COP a la moneda del usuario
     */
    static convertFromCOP(priceInCOP, targetCurrency) {
        const copRate = EXCHANGE_RATES.COP.rate;
        const targetRate = EXCHANGE_RATES[targetCurrency]?.rate || copRate;
        // COP -> USD -> Target Currency
        const priceInUSD = priceInCOP / copRate;
        const priceInTarget = priceInUSD * targetRate;
        return Math.round(priceInTarget);
    }
    /**
     * Convierte cualquier moneda a USD
     */
    static convertToUSD(price, fromCurrency) {
        const rate = EXCHANGE_RATES[fromCurrency]?.rate || 1;
        return price / rate;
    }
    /**
     * Convierte de una moneda a otra
     */
    static convert(price, fromCurrency, toCurrency) {
        const priceInUSD = this.convertToUSD(price, fromCurrency);
        const targetRate = EXCHANGE_RATES[toCurrency]?.rate || 1;
        return priceInUSD * targetRate;
    }
    /**
     * Formatea un precio con el símbolo de moneda correcto
     */
    static formatPrice(price, currencyCode, locale) {
        const currency = EXCHANGE_RATES[currencyCode] || EXCHANGE_RATES.USD;
        // Para monedas latinoamericanas sin decimales
        const noDecimalCurrencies = ['COP', 'CLP', 'PYG', 'VES'];
        const decimals = noDecimalCurrencies.includes(currencyCode) ? 0 : 2;
        try {
            return new Intl.NumberFormat(locale || 'es-CO', {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }).format(price);
        }
        catch {
            // Fallback manual si Intl falla
            const formatted = price.toLocaleString('es-CO', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
            return `${currency.symbol}${formatted}`;
        }
    }
    /**
     * Obtiene información de una moneda
     */
    static getCurrencyInfo(code) {
        return EXCHANGE_RATES[code] || null;
    }
    /**
     * Obtiene todas las monedas disponibles
     */
    static getAllCurrencies() {
        return Object.values(EXCHANGE_RATES);
    }
    /**
     * Obtiene la moneda del usuario (cached)
     */
    static getUserCurrency() {
        return this.userCurrency || EXCHANGE_RATES.COP;
    }
    /**
     * Establece manualmente la moneda del usuario
     */
    static setUserCurrency(currencyCode) {
        const currency = EXCHANGE_RATES[currencyCode];
        if (currency) {
            this.userCurrency = currency;
            localStorage.setItem('user-currency', currencyCode);
        }
    }
    /**
     * Calcula el precio en USD para el pago
     */
    static calculatePaymentAmount(priceInLocalCurrency, localCurrencyCode) {
        const localCurrency = EXCHANGE_RATES[localCurrencyCode] || EXCHANGE_RATES.COP;
        const amountUSD = this.convertToUSD(priceInLocalCurrency, localCurrencyCode);
        return {
            amountUSD: Math.round(amountUSD * 100) / 100, // 2 decimales
            amountLocal: priceInLocalCurrency,
            localCurrency,
            exchangeRate: localCurrency.rate
        };
    }
}
exports.CurrencyService = CurrencyService;
CurrencyService.userCurrency = null;
CurrencyService.userCountry = null;
