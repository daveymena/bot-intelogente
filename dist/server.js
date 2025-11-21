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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server.ts - Next.js Standalone + Socket.IO
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const next_1 = __importDefault(require("next"));
const dev = process.env.NODE_ENV !== 'production';
const currentPort = parseInt(process.env.PORT || '4000', 10);
// En producción, escuchar en todas las interfaces (0.0.0.0) para Docker/Easypanel
const hostname = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
// Custom server with Socket.IO integration
async function createCustomServer() {
    try {
        // 🔐 SISTEMA DE LICENCIAS DESACTIVADO
        // Usas sistema de suscripciones SaaS (por usuario), no por máquina
        // La verificación se hace en el dashboard por usuario
        console.log('\n✅ Sistema de suscripciones SaaS activo');
        console.log('   Verificación por usuario en dashboard\n');
        // Create Next.js app
        const nextApp = (0, next_1.default)({
            dev,
            dir: process.cwd(),
            // In production, use the current directory where .next is located
            conf: dev ? undefined : { distDir: './.next' }
        });
        await nextApp.prepare();
        const handle = nextApp.getRequestHandler();
        // Create HTTP server that will handle both Next.js and Socket.IO
        const server = (0, http_1.createServer)((req, res) => {
            // Skip socket.io requests from Next.js handler
            if (req.url?.startsWith('/api/socketio')) {
                return;
            }
            handle(req, res);
        });
        // Setup Socket.IO
        const io = new socket_io_1.Server(server, {
            path: '/api/socketio',
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        // Setup Socket.IO dynamically
        try {
            const socketModule = await Promise.resolve().then(() => __importStar(require('./src/lib/socket.js')));
            socketModule.setupSocket(io);
        }
        catch (error) {
            console.error('Error loading socket module:', error);
        }
        // Start the server
        server.listen(currentPort, hostname, async () => {
            console.log(`> Ready on http://${hostname}:${currentPort}`);
            console.log(`> Socket.IO server running at ws://${hostname}:${currentPort}/api/socketio`);
            // Inicializar Baileys automáticamente
            try {
                const { SessionManager } = await Promise.resolve().then(() => __importStar(require('./src/lib/session-manager.js')));
                await SessionManager.initialize();
            }
            catch (error) {
                console.error('> Error initializing Baileys:', error);
            }
            // 🚀 Inicializar sistema de auto-reconexión de WhatsApp (MEJORADO)
            try {
                const { WhatsAppAutoReconnect } = await Promise.resolve().then(() => __importStar(require('./src/lib/whatsapp-auto-reconnect.js')));
                await WhatsAppAutoReconnect.initialize();
                console.log('> ✅ Sistema de auto-reconexión de WhatsApp iniciado');
            }
            catch (error) {
                console.error('> ❌ Error initializing WhatsApp auto-reconnect:', error);
            }
        });
    }
    catch (err) {
        console.error('Server startup error:', err);
        process.exit(1);
    }
}
// Start the server
createCustomServer();
