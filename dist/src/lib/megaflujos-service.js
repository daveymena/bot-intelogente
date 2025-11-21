"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MegaflujoService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class MegaflujoService {
    /**
     * Cargar ejemplos de megaflujos
     */
    static cargarEjemplos() {
        if (this.cargado && this.ejemplos.length > 0) {
            return this.ejemplos;
        }
        try {
            const rutaArchivo = path.join(process.cwd(), 'data', 'megaflujos-integracion-bot.json');
            if (fs.existsSync(rutaArchivo)) {
                const contenido = fs.readFileSync(rutaArchivo, 'utf-8');
                const datos = JSON.parse(contenido);
                this.ejemplos = datos.ejemplos || [];
                this.cargado = true;
                console.log(`✅ Cargados ${this.ejemplos.length} ejemplos de megaflujos`);
            }
        }
        catch (error) {
            console.error('❌ Error cargando megaflujos:', error);
        }
        return this.ejemplos;
    }
    /**
     * Buscar ejemplos similares a la entrada del usuario
     */
    static buscarSimilares(entrada, topK = 3) {
        const ejemplos = this.cargarEjemplos();
        if (ejemplos.length === 0)
            return [];
        const palabrasEntrada = entrada.toLowerCase().split(' ');
        return ejemplos
            .map((e) => ({
            ...e,
            similitud: palabrasEntrada.filter((p) => e.entrada.toLowerCase().includes(p)).length
        }))
            .filter((e) => e.similitud > 0)
            .sort((a, b) => b.similitud - a.similitud)
            .slice(0, topK)
            .map(({ similitud, ...rest }) => rest);
    }
    /**
     * Obtener contexto de megaflujos para el prompt
     */
    static obtenerContextoParaPrompt(entrada) {
        const similares = this.buscarSimilares(entrada, 2);
        if (similares.length === 0)
            return '';
        const contexto = similares
            .map((e) => `Ejemplo similar:\nUsuario: ${e.entrada}\nBot: ${e.salida}\nIntención: ${e.intención}`)
            .join('\n\n');
        return `Aquí hay ejemplos de conversaciones similares que pueden ayudarte:\n\n${contexto}\n\n`;
    }
    /**
     * Detectar intención basada en megaflujos
     */
    static detectarIntención(entrada) {
        const similares = this.buscarSimilares(entrada, 1);
        return similares.length > 0 ? similares[0].intención : null;
    }
    /**
     * Obtener acciones recomendadas
     */
    static obtenerAcciones(entrada) {
        const similares = this.buscarSimilares(entrada, 1);
        return similares.length > 0 && similares[0].acciones
            ? similares[0].acciones
            : [];
    }
    /**
     * Obtener estadísticas de megaflujos
     */
    static obtenerEstadísticas() {
        const ejemplos = this.cargarEjemplos();
        const porCategoría = {};
        const porComplejidad = {};
        const porIntención = {};
        ejemplos.forEach((e) => {
            porCategoría[e.categoría] = (porCategoría[e.categoría] || 0) + 1;
            porComplejidad[e.complejidad] = (porComplejidad[e.complejidad] || 0) + 1;
            porIntención[e.intención] = (porIntención[e.intención] || 0) + 1;
        });
        return {
            total: ejemplos.length,
            porCategoría,
            porComplejidad,
            porIntención
        };
    }
}
exports.MegaflujoService = MegaflujoService;
MegaflujoService.ejemplos = [];
MegaflujoService.cargado = false;
