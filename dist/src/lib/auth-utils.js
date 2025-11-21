"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = auth;
exports.hasRole = hasRole;
exports.isAdmin = isAdmin;
exports.hasActiveSubscription = hasActiveSubscription;
exports.getSubscriptionStatus = getSubscriptionStatus;
const auth_1 = require("./auth");
/**
 * Obtiene el usuario autenticado desde el token en las cookies o headers
 */
async function auth(request) {
    try {
        // Intentar obtener token de las cookies
        let token = request.cookies.get('token')?.value;
        // Si no hay token en cookies, intentar desde el header Authorization
        if (!token) {
            const authHeader = request.headers.get('authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        if (!token) {
            return null;
        }
        // Obtener usuario desde el token
        const user = await auth_1.AuthService.getUserFromToken(token);
        return user;
    }
    catch (error) {
        console.error('Error in auth():', error);
        return null;
    }
}
/**
 * Verifica si el usuario tiene un rol específico
 */
function hasRole(user, role) {
    if (!user)
        return false;
    return user.role === role;
}
/**
 * Verifica si el usuario es admin
 */
function isAdmin(user) {
    return hasRole(user, 'ADMIN');
}
/**
 * Verifica si el usuario tiene una suscripción activa
 */
async function hasActiveSubscription(userId) {
    return auth_1.AuthService.hasActiveSubscription(userId);
}
/**
 * Obtiene el estado de la suscripción del usuario
 */
async function getSubscriptionStatus(userId) {
    return auth_1.AuthService.getSubscriptionStatus(userId);
}
