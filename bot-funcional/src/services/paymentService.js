import axios from 'axios';
import dotenv from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

export class PaymentService {
    constructor() {
        this.mercadoPagoToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;
        this.paypalClientId = process.env.PAYPAL_CLIENT_ID;
        this.paypalSecret = process.env.PAYPAL_CLIENT_SECRET;
        this.paypalMode = process.env.PAYPAL_MODE || 'live';
        this.paypalApiUrl = process.env.PAYPAL_API_URL || 'https://api-m.paypal.com';
        this.productsPath = join(__dirname, '../data/products.json');
        this.paypalAccessToken = null;
        this.paypalTokenExpiry = null;
    }

    // ========== MERCADO PAGO ==========
    async createMercadoPagoLink(product) {
        try {
            if (!this.mercadoPagoToken) {
                console.log('⚠️ Token de Mercado Pago no configurado');
                return null;
            }

            const preference = {
                items: [{
                    title: product.name,
                    description: product.description?.substring(0, 250) || product.name,
                    quantity: 1,
                    currency_id: 'COP',
                    unit_price: product.price
                }],
                back_urls: {
                    success: 'https://tecnovariedades.com/success',
                    failure: 'https://tecnovariedades.com/failure',
                    pending: 'https://tecnovariedades.com/pending'
                },
                auto_return: 'approved',
                external_reference: `PROD-${product.name.replace(/\s+/g, '-').substring(0, 30)}`
            };

            const response = await axios.post(
                'https://api.mercadopago.com/checkout/preferences',
                preference,
                {
                    headers: {
                        'Authorization': `Bearer ${this.mercadoPagoToken}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                }
            );

            console.log(`✅ Link MercadoPago creado: ${product.name}`);
            return response.data.init_point;
        } catch (error) {
            console.error(`❌ Error MercadoPago (${product.name}):`, error.response?.data?.message || error.message);
            return null;
        }
    }

    // ========== PAYPAL ==========
    async getPayPalAccessToken() {
        // Reutilizar token si aún es válido
        if (this.paypalAccessToken && this.paypalTokenExpiry && Date.now() < this.paypalTokenExpiry) {
            return this.paypalAccessToken;
        }

        try {
            const auth = Buffer.from(`${this.paypalClientId}:${this.paypalSecret}`).toString('base64');
            
            const response = await axios.post(
                `${this.paypalApiUrl}/v1/oauth2/token`,
                'grant_type=client_credentials',
                {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    timeout: 15000
                }
            );

            this.paypalAccessToken = response.data.access_token;
            this.paypalTokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // 1 min antes
            return this.paypalAccessToken;
        } catch (error) {
            console.error('❌ Error obteniendo token PayPal:', error.response?.data || error.message);
            return null;
        }
    }

    async createPayPalLink(product) {
        try {
            if (!this.paypalClientId || !this.paypalSecret) {
                console.log('⚠️ Credenciales PayPal no configuradas');
                return null;
            }

            const accessToken = await this.getPayPalAccessToken();
            if (!accessToken) return null;

            // Convertir COP a USD (tasa aproximada)
            const priceUSD = Math.ceil(product.price / 4200);

            const orderData = {
                intent: 'CAPTURE',
                purchase_units: [{
                    reference_id: `PROD-${Date.now()}`,
                    description: product.name.substring(0, 127),
                    amount: {
                        currency_code: 'USD',
                        value: priceUSD.toFixed(2)
                    }
                }],
                application_context: {
                    brand_name: 'Tecnovariedades D&S',
                    landing_page: 'BILLING',
                    user_action: 'PAY_NOW',
                    return_url: 'https://tecnovariedades.com/success',
                    cancel_url: 'https://tecnovariedades.com/cancel'
                }
            };

            const response = await axios.post(
                `${this.paypalApiUrl}/v2/checkout/orders`,
                orderData,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                }
            );

            const approveLink = response.data.links?.find(link => link.rel === 'approve');
            if (approveLink) {
                console.log(`✅ Link PayPal creado: ${product.name}`);
                return approveLink.href;
            }
            return null;
        } catch (error) {
            console.error(`❌ Error PayPal (${product.name}):`, error.response?.data || error.message);
            return null;
        }
    }

    // ========== GENERAR LINKS PARA PRODUCTO ==========
    async generatePaymentLinks(product) {
        console.log(`💳 Generando links de pago para: ${product.name}`);
        
        const links = {};
        
        // Generar link de Mercado Pago
        const mpLink = await this.createMercadoPagoLink(product);
        if (mpLink) links.mercadoPago = mpLink;
        
        // Generar link de PayPal
        const ppLink = await this.createPayPalLink(product);
        if (ppLink) links.paypal = ppLink;
        
        return links;
    }

    // ========== OBTENER O CREAR LINKS ==========
    async getOrCreatePaymentLinks(product) {
        // Si ya tiene links guardados, retornarlos
        if (product.paymentLinks?.mercadoPago || product.paymentLinks?.paypal) {
            console.log(`📎 Links existentes para: ${product.name}`);
            return product.paymentLinks;
        }
        
        // Generar nuevos links
        const links = await this.generatePaymentLinks(product);
        
        // Guardar en el JSON si se generaron links
        if (Object.keys(links).length > 0) {
            await this.savePaymentLinksToProduct(product.name, links);
        }
        
        return links;
    }

    // ========== GUARDAR LINKS EN JSON ==========
    async savePaymentLinksToProduct(productName, links) {
        try {
            const productsData = readFileSync(this.productsPath, 'utf-8');
            const products = JSON.parse(productsData);
            
            const productIndex = products.findIndex(p => p.name === productName);
            if (productIndex !== -1) {
                products[productIndex].paymentLinks = links;
                writeFileSync(this.productsPath, JSON.stringify(products, null, 2), 'utf-8');
                console.log(`💾 Links guardados para: ${productName}`);
            }
        } catch (error) {
            console.error('❌ Error guardando links:', error.message);
        }
    }

    // ========== GENERAR LINKS PARA TODOS LOS PRODUCTOS ==========
    async generateAllPaymentLinks() {
        try {
            const productsData = readFileSync(this.productsPath, 'utf-8');
            const products = JSON.parse(productsData);
            
            console.log(`\n💳 Generando links de pago para ${products.length} productos...\n`);
            
            let generated = 0;
            let skipped = 0;
            
            for (const product of products) {
                // Saltar si ya tiene links
                if (product.paymentLinks?.mercadoPago && product.paymentLinks?.paypal) {
                    skipped++;
                    continue;
                }
                
                const links = await this.generatePaymentLinks(product);
                if (Object.keys(links).length > 0) {
                    product.paymentLinks = { ...product.paymentLinks, ...links };
                    generated++;
                }
                
                // Esperar un poco entre requests para no saturar las APIs
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // Guardar todos los productos actualizados
            writeFileSync(this.productsPath, JSON.stringify(products, null, 2), 'utf-8');
            
            console.log(`\n✅ Links generados: ${generated}`);
            console.log(`⏭️ Productos con links existentes: ${skipped}`);
            console.log(`💾 Archivo products.json actualizado\n`);
            
            return { generated, skipped };
        } catch (error) {
            console.error('❌ Error generando links:', error.message);
            return { generated: 0, skipped: 0, error: error.message };
        }
    }
}
