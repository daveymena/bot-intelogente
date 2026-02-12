const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const router = require('../core/router');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

const logger = pino({ level: 'silent' }); // Silent internal logger for Baileys to reduce noise

class WhatsAppManager {
    constructor() {
        this.sock = null;
        this.authDir = './auth_info_baileys';
        if (!fs.existsSync(this.authDir)) {
            fs.mkdirSync(this.authDir, { recursive: true });
        }
    }

    async connect() {
        const { state, saveCreds } = await useMultiFileAuthState(this.authDir);

        this.sock = makeWASocket({
            logger,
            printQRInTerminal: true,
            auth: state,
            browser: ['Bot-Inteligente', 'Chrome', '1.0.0'] 
        });

        this.sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;
            if (qr) {
                console.log('QR RECEIVED', qr);
                qrcode.generate(qr, { small: true });
            }
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect);
                if (shouldReconnect) {
                    this.connect();
                }
            } else if (connection === 'open') {
                console.log('opened connection');
            }
        });

        this.sock.ev.on('creds.update', saveCreds);

        this.sock.ev.on('messages.upsert', async (m) => {
            const msg = m.messages[0];
            if (!msg.key.fromMe && m.type === 'notify') {
                const phone = msg.key.remoteJid.split('@')[0];
                const content = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

                if (content) {
                    console.log(`Received message from ${phone}: ${content}`);
                    // Call Router
                    const response = await router.handleMessage(phone, content);
                    
                    // Reply
                    if (response) {
                        await this.sock.sendMessage(msg.key.remoteJid, { text: response });
                    }
                }
            }
        });
    }
}

module.exports = new WhatsAppManager();
