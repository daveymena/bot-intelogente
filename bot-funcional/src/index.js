import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg;
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { AIService } from './services/aiService.js';
import { MemoryService } from './services/memoryService.js';
import { SalesAgent } from './services/salesAgent.js';
import { DatabaseService } from './services/databaseService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============ CONFIGURACIÓN ============
const API_PORT = process.env.API_PORT || 3001;
const DASHBOARD_PORT = process.env.DASHBOARD_PORT || 3000;

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  🚀 SMART SALES BOT - SISTEMA COMPLETO                     ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');
console.log('📦 Tecnovariedades D&S - Cali, Valle del Cauca');
console.log('📞 Contacto: +57 313 617 4267\n');

// ============ ESTADO GLOBAL ============
let botState = {
    status: 'disconnected',
    qr: null,
    qrDataUrl: null,
    phone: null,
    connectedAt: null
};

let clientsData = [];
let conversationsData = {};

// ============ HELPERS ============
const dataPath = (file) => path.join(__dirname, 'data', file);

const readJSON = (file, defaultValue = []) => {
    try {
        const filePath = dataPath(file);
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
    } catch (e) {
        console.error(`Error leyendo ${file}:`, e.message);
    }
    return defaultValue;
};

const writeJSON = (file, data) => {
    try {
        const filePath = dataPath(file);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (e) {
        console.error(`Error escribiendo ${file}:`, e.message);
        return false;
    }
};

// ============ API SERVER ============
const app = express();
app.use(cors());
app.use(express.json());

// Servir dashboard compilado
const dashboardPath = path.join(__dirname, '../dashboard/dist');
if (fs.existsSync(dashboardPath)) {
    app.use(express.static(dashboardPath));
}

// --- RUTAS API: BOT ---
app.get('/api/bot/status', (req, res) => {
    res.json(botState);
});

app.post('/api/bot/start', (req, res) => {
    botState.status = 'connecting';
    res.json({ success: true, message: 'Bot iniciando...' });
});

app.post('/api/bot/stop', async (req, res) => {
    try {
        await client.destroy();
        botState.status = 'disconnected';
        botState.qr = null;
        res.json({ success: true, message: 'Bot detenido' });
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

app.post('/api/bot/restart', async (req, res) => {
    try {
        await client.destroy();
        botState.status = 'connecting';
        client.initialize();
        res.json({ success: true, message: 'Bot reiniciando...' });
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

// --- RUTAS API: PRODUCTOS ---
app.get('/api/products', (req, res) => {
    const products = readJSON('products.json', []);
    const productsWithIds = products.map((p, i) => ({
        ...p,
        id: p.id || i + 1,
        type: p.category === 'DIGITAL' ? 'digital' : 'physical',
        stock: p.category === 'DIGITAL' ? 999 : (p.stock || 5)
    }));
    res.json(productsWithIds);
});

app.get('/api/products/:id', (req, res) => {
    const products = readJSON('products.json', []);
    const product = products.find((p, i) => (p.id || i + 1) == req.params.id);
    if (product) res.json(product);
    else res.status(404).json({ error: 'Producto no encontrado' });
});

app.post('/api/products', (req, res) => {
    const products = readJSON('products.json', []);
    const newProduct = { ...req.body, id: Date.now(), status: 'AVAILABLE', currency: 'COP' };
    products.push(newProduct);
    writeJSON('products.json', products);
    res.json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
    const products = readJSON('products.json', []);
    const index = products.findIndex((p, i) => (p.id || i + 1) == req.params.id);
    if (index !== -1) {
        products[index] = { ...products[index], ...req.body };
        writeJSON('products.json', products);
        res.json(products[index]);
    } else {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

app.delete('/api/products/:id', (req, res) => {
    let products = readJSON('products.json', []);
    products = products.filter((p, i) => (p.id || i + 1) != req.params.id);
    writeJSON('products.json', products);
    res.json({ success: true });
});

// --- RUTAS API: ESTADÍSTICAS ---
app.get('/api/stats', (req, res) => {
    const products = readJSON('products.json', []);
    const clients = readJSON('clients.json', []);
    const stats = readJSON('stats.json', {});
    res.json({
        totalProducts: products.length,
        totalConversations: stats.totalConversations || clients.length || 0,
        totalClients: clients.length || 0,
        salesThisMonth: stats.salesThisMonth || 0,
        revenue: stats.revenue || 0
    });
});

// --- RUTAS API: CONFIGURACIÓN ---
app.get('/api/settings', (req, res) => {
    const settings = readJSON('settings.json', {
        botName: 'David Martínez',
        businessName: 'Tecnovariedades D&S',
        phone: '313 617 4267',
        city: 'Cali, Colombia',
        nequi: '313 617 4267',
        daviplata: '313 617 4267'
    });
    res.json(settings);
});

app.put('/api/settings', (req, res) => {
    const current = readJSON('settings.json', {});
    const updated = { ...current, ...req.body };
    writeJSON('settings.json', updated);
    res.json(updated);
});

// --- RUTAS API: PROMPTS ---
app.get('/api/prompts', (req, res) => {
    const prompts = readJSON('prompts.json', {});
    res.json(prompts);
});

app.put('/api/prompts', (req, res) => {
    writeJSON('prompts.json', req.body);
    res.json(req.body);
});

// --- RUTAS API: CLIENTES ---
app.get('/api/clients', (req, res) => {
    const clients = readJSON('clients.json', []);
    res.json(clients);
});

app.get('/api/clients/:id', (req, res) => {
    const clients = readJSON('clients.json', []);
    const client = clients.find(c => c.id == req.params.id);
    if (client) res.json(client);
    else res.status(404).json({ error: 'Cliente no encontrado' });
});

// --- RUTAS API: CONVERSACIONES ---
app.get('/api/conversations', (req, res) => {
    const conversations = readJSON('conversations.json', {});
    res.json(conversations);
});

app.get('/api/conversations/:clientId', (req, res) => {
    const conversations = readJSON('conversations.json', {});
    res.json(conversations[req.params.clientId] || []);
});

// --- RUTAS API: AUTH ---
app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    res.json({ success: true, user: { id: 1, email, name: email.split('@')[0] } });
});

app.post('/api/auth/register', (req, res) => {
    const { email, name } = req.body;
    res.json({ success: true, user: { id: Date.now(), email, name: name || email.split('@')[0] } });
});

app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true });
});

// --- RUTAS API: PERSONALIDAD ---
app.get('/api/personality', (req, res) => {
    res.json(readJSON('personality.json', { selected: 'friendly' }));
});

app.put('/api/personality', (req, res) => {
    writeJSON('personality.json', req.body);
    res.json(req.body);
});

// SPA fallback - servir index.html para rutas del dashboard
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    const indexPath = path.join(dashboardPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.send(`
            <html>
            <head><title>Smart Sales Bot</title></head>
            <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #1a472a;">
                <div style="text-align: center; color: white;">
                    <h1>🤖 Smart Sales Bot</h1>
                    <p>Dashboard no compilado. Ejecuta:</p>
                    <code style="background: rgba(255,255,255,0.1); padding: 10px 20px; border-radius: 8px; display: block; margin: 20px 0;">cd dashboard && npm run build</code>
                    <p>API funcionando en /api</p>
                </div>
            </body>
            </html>
        `);
    }
});

// ============ INICIALIZAR SERVICIOS ============
const db = new DatabaseService();
const memory = new MemoryService(db);
const ai = new AIService();
const salesAgent = new SalesAgent(ai, memory);

// ============ CLIENTE WHATSAPP ============
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: process.env.WHATSAPP_SESSION_PATH || './auth_sessions',
        clientId: 'joyama-megacomputer'
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ],
        executablePath: process.env.CHROME_PATH || undefined
    }
});

// Evento: QR
client.on('qr', (qr) => {
    botState.status = 'connecting';
    botState.qr = qr;
    
    console.log('\n📱 ESCANEA ESTE CÓDIGO QR CON WHATSAPP:\n');
    qrcode.generate(qr, { small: true });
    console.log('\n📋 O abre el dashboard en http://localhost:' + API_PORT);
});

// Evento: Autenticado
client.on('authenticated', () => {
    console.log('🔐 Autenticación exitosa...');
    botState.status = 'connecting';
    botState.qr = null;
});

// Evento: Listo
client.on('ready', async () => {
    botState.status = 'connected';
    botState.connectedAt = new Date().toISOString();
    botState.qr = null;
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ BOT CONECTADO Y LISTO PARA VENDER                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n🌐 Dashboard: http://localhost:${API_PORT}`);
    console.log(`📊 API: http://localhost:${API_PORT}/api`);
    console.log(`📦 Productos: ${ai.products.length}`);
    console.log('\n═══════════════════════════════════════════════════════════\n');
    
    try {
        await db.initialize();
    } catch (error) {
        console.warn('⚠️ DB no disponible, continuando sin persistencia');
    }
});

// Evento: Mensaje
client.on('message', async (message) => {
    try {
        const from = message.from;
        const text = message.body;
        
        if (message.from.includes('@g.us') || message.fromMe) return;
        if (!text || text.trim() === '' || text.length > 1000) return;
        
        const timestamp = new Date().toLocaleTimeString('es-CO');
        console.log(`\n📨 [${timestamp}] ${from}: "${text.substring(0, 50)}..."`);
        
        // Guardar cliente
        updateClient(from, text);
        
        // Obtener contexto
        let userContext = { userInfo: null, conversationHistory: [], hasHistory: false };
        try {
            userContext = await memory.getUserContext(from);
        } catch {}
        
        // Procesar mensaje
        const response = await salesAgent.processMessage(text, from, userContext);
        
        // Guardar conversación
        saveConversation(from, 'client', text);
        saveConversation(from, 'bot', response.text);
        
        try {
            await memory.saveConversation(from, text, response.text);
        } catch {}
        
        // Enviar respuesta
        if (response.sendPhotos && response.photos?.length > 0) {
            for (const photoUrl of response.photos) {
                try {
                    const media = await MessageMedia.fromUrl(photoUrl, { unsafeMime: true });
                    await client.sendMessage(from, media, { caption: response.text });
                } catch {
                    await message.reply(response.text);
                }
            }
        } else {
            await message.reply(response.text);
        }
        
        console.log(`✅ Respuesta enviada | ${response.intent}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        try {
            await message.reply('Disculpa, tuve un problema. Contacta al +57 313 617 4267 🙏');
        } catch {}
    }
});

// Evento: Desconexión
client.on('disconnected', (reason) => {
    console.log('⚠️ Desconectado:', reason);
    botState.status = 'disconnected';
});

// ============ FUNCIONES AUXILIARES ============
function updateClient(phone, message) {
    let clients = readJSON('clients.json', []);
    const existing = clients.find(c => c.phone === phone);
    
    if (existing) {
        existing.lastMessage = message.substring(0, 100);
        existing.lastSeen = 'Ahora';
        existing.messages++;
        existing.unread++;
    } else {
        clients.push({
            id: Date.now(),
            phone,
            lastMessage: message.substring(0, 100),
            lastSeen: 'Ahora',
            messages: 1,
            status: 'active',
            unread: 1
        });
    }
    writeJSON('clients.json', clients);
}

function saveConversation(phone, from, text) {
    let conversations = readJSON('conversations.json', {});
    if (!conversations[phone]) conversations[phone] = [];
    
    conversations[phone].push({
        from,
        text,
        time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    });
    
    // Mantener solo últimos 50 mensajes por conversación
    if (conversations[phone].length > 50) {
        conversations[phone] = conversations[phone].slice(-50);
    }
    
    writeJSON('conversations.json', conversations);
}

// ============ INICIAR TODO ============
app.listen(API_PORT, () => {
    console.log(`\n📊 Dashboard + API: http://localhost:${API_PORT}`);
    console.log('🔄 Iniciando WhatsApp...\n');
});

client.initialize().catch(error => {
    console.error('❌ Error inicializando WhatsApp:', error);
});

// ============ MANEJO DE ERRORES ============
process.on('unhandledRejection', (error) => {
    console.error('❌ Error no manejado:', error.message);
});

process.on('SIGINT', async () => {
    console.log('\n🛑 Deteniendo...');
    await client.destroy();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Deteniendo...');
    await client.destroy();
    process.exit(0);
});
