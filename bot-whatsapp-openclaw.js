/*
 * 🚀 SCRIPT PRINCIPAL: OpenClaw WhatsApp Bot
 * Implementación basada en la Guía Maestra de TecnoVariedades D&S
 * V2.0 - Dynamic Product Loading + OpenClaw Architect
 */

import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Importar el Orquestador Arquitecto OpenClaw (v2.0)
import { openClawOrchestrator } from './src/lib/bot/openclaw-orchestrator.js';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// Inicialización del Cliente WhatsApp
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "openclaw-session"
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
    }
});

// Función para obtener contexto dinámico de la DB
async function getDynamicContext() {
    try {
        const products = await prisma.product.findMany({
            take: 50, // Limitamos para no sobrecargar el prompt
            select: {
                id: true,
                name: true,
                price: true,
                description: true
            }
        });

        // Intentar obtener info del negocio del primer usuario o env
        const businessInfo = {
            name: process.env.BUSINESS_NAME || 'TecnoVariedades D&S',
            phone: process.env.BUSINESS_PHONE || '+57 300 000 0000',
            address: 'Colombia'
        };

        return {
            products: products.map(p => ({
                ...p,
                currency: 'COP'
            })),
            business: businessInfo
        };
    } catch (error) {
        console.error('❌ Error cargando contexto dinámico:', error);
        return { products: [], business: { name: 'TecnoVariedades D&S' } };
    }
}

// --- EVENTOS DE WHATSAPP ---

client.on('qr', (qr) => {
    console.log('-------------------------------------------------------');
    console.log('🤖 OPENCLAW: ESCANEA EL CÓDIGO QR PARA CONECTAR');
    console.log('-------------------------------------------------------');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ ¡CONEXIÓN EXITOSA! OpenClaw está operando dinámicamente.');
    console.log(`🤖 Bot vinculado: ${client.info.pushname} (${client.info.wid.user})`);
});

client.on('message', async (message) => {
    // Ignorar mensajes de grupos
    if (message.from.includes('@g.us')) return;

    try {
        const chat = await message.getChat();
        await chat.sendStateTyping();

        // Obtener productos reales de la DB para cada mensaje (fresco)
        const currentContext = await getDynamicContext();

        // El Agente OpenClaw (Arquitecto) procesa el mensaje
        const response = await openClawOrchestrator.processMessage(
            message.body, 
            message.from, 
            currentContext
        );

        if (response && response.text) {
            await message.reply(response.text);
        }
    } catch (err) {
        console.error('❌ Error en el flujo de mensaje:', err);
    }
});

// Inicialización
console.log('🚀 Iniciando sistema OpenClaw Dinámico...');
client.initialize();

// API REST para el Dashboard
const PORT = process.env.API_PORT || 4001;
app.get('/status', (req, res) => {
    res.json({ 
        status: 'running', 
        client: client.info ? 'connected' : 'initializing',
        version: '2.0-dynamic'
    });
});

app.listen(PORT, () => {
    console.log(`🌐 Servidor API (Bot) corriendo en puerto ${PORT}`);
});
