// server.ts - Next.js Standalone + Socket.IO
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import path from 'path';
import { fileURLToPath } from 'url';

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
    const nextApp = next({ 
      dev,
      dir: process.cwd(),
      // In production, use the current directory where .next is located
      conf: dev ? undefined : { distDir: './.next' }
    });

    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    // Create HTTP server that will handle both Next.js and Socket.IO
    const server = createServer((req, res) => {
      // Skip socket.io requests from Next.js handler
      if (req.url?.startsWith('/api/socketio')) {
        return;
      }
      handle(req, res);
    });

    // Setup Socket.IO
    const io = new Server(server, {
      path: '/api/socketio',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Setup Socket.IO dynamically
    try {
      const socketModule = await import('./src/lib/socket.js');
      socketModule.setupSocket(io);
    } catch (error) {
      console.error('Error loading socket module:', error);
    }

    // Start the server
    server.listen(currentPort, hostname, async () => {
      console.log(`> Ready on http://${hostname}:${currentPort}`);
      console.log(`> Socket.IO server running at ws://${hostname}:${currentPort}/api/socketio`);
      
      // Inicializar Baileys automáticamente
      try {
        const { SessionManager } = await import('./src/lib/session-manager.js');
        await SessionManager.initialize();
      } catch (error) {
        console.error('> Error initializing Baileys:', error);
      }

      // 🚀 Inicializar sistema de auto-reconexión de WhatsApp (MEJORADO)
      try {
        const { WhatsAppAutoReconnect } = await import('./src/lib/whatsapp-auto-reconnect.js');
        await WhatsAppAutoReconnect.initialize();
        console.log('> ✅ Sistema de auto-reconexión de WhatsApp iniciado');
      } catch (error) {
        console.error('> ❌ Error initializing WhatsApp auto-reconnect:', error);
      }
    });

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

// Start the server
createCustomServer();
