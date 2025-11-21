"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseGuard = void 0;
exports.useLicenseGuard = useLicenseGuard;
const license_service_1 = __importDefault(require("./license-service"));
/**
 * Guard para proteger funcionalidades según el tipo de licencia
 */
class LicenseGuard {
    /**
     * Verifica si el usuario tiene acceso a una característica
     */
    static async hasAccess(feature) {
        const licenseCheck = await this.licenseService.checkLicense();
        if (!licenseCheck.valid) {
            return false;
        }
        return this.licenseService.hasFeature(feature);
    }
    /**
     * Verifica si la licencia es válida
     */
    static async isValid() {
        const licenseCheck = await this.licenseService.checkLicense();
        return licenseCheck.valid;
    }
    /**
     * Obtiene información de la licencia
     */
    static async getInfo() {
        return await this.licenseService.checkLicense();
    }
    /**
     * Verifica límites según el tipo de licencia
     */
    static async checkLimit(limitType) {
        const licenseCheck = await this.licenseService.checkLicense();
        if (!licenseCheck.valid) {
            return { allowed: false };
        }
        // Límites según tipo de licencia
        const limits = {
            trial: {
                messages: 100,
                products: 50,
                users: 1,
            },
            monthly: {
                messages: -1, // ilimitado
                products: 500,
                users: 3,
            },
            yearly: {
                messages: -1,
                products: 1000,
                users: 10,
            },
            lifetime: {
                messages: -1,
                products: -1,
                users: -1,
            },
        };
        const licenseType = licenseCheck.type || 'trial';
        const limit = limits[licenseType]?.[limitType] || 0;
        // Si es -1, es ilimitado
        if (limit === -1) {
            return { allowed: true, limit: -1 };
        }
        return { allowed: true, limit };
    }
    /**
     * Middleware para Express/Next.js API routes
     */
    static async middleware(req, res, next) {
        try {
            const licenseCheck = await this.licenseService.checkLicense();
            if (!licenseCheck.valid) {
                return res.status(403).json({
                    error: 'Licencia inválida o expirada',
                    message: licenseCheck.message,
                    requiresActivation: true,
                });
            }
            // Agregar información de licencia al request
            req.license = {
                valid: true,
                type: licenseCheck.type,
                daysRemaining: licenseCheck.daysRemaining,
            };
            next();
        }
        catch (error) {
            console.error('Error in license middleware:', error);
            return res.status(500).json({
                error: 'Error al verificar licencia',
            });
        }
    }
}
exports.LicenseGuard = LicenseGuard;
LicenseGuard.licenseService = license_service_1.default.getInstance();
/**
 * Hook para React components
 */
function useLicenseGuard() {
    const checkAccess = async (feature) => {
        return await LicenseGuard.hasAccess(feature);
    };
    const checkValid = async () => {
        return await LicenseGuard.isValid();
    };
    const getInfo = async () => {
        return await LicenseGuard.getInfo();
    };
    return {
        checkAccess,
        checkValid,
        getInfo,
    };
}
exports.default = LicenseGuard;
