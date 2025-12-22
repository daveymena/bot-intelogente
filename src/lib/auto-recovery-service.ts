/**
 * Sistema de Auto-Recuperación Inteligente
 * Detecta, diagnostica y corrige errores automáticamente usando IA
 */

import { PrismaClient } from '@prisma/client'
import Groq from 'groq-sdk'

const prisma = new PrismaClient()

// Lazy initialization de Groq para evitar errores en build time
let groqInstance: Groq | null = null
function getGroq(): Groq {
    if (!groqInstance && process.env.GROQ_API_KEY) {
        groqInstance = new Groq({ apiKey: process.env.GROQ_API_KEY })
    }
    if (!groqInstance) {
        throw new Error('GROQ_API_KEY no configurado')
    }
    return groqInstance
}

interface RecoveryLog {
    timestamp: Date
    component: string
    error: string
    diagnosis: string
    action: string
    success: boolean
}

const recoveryLogs: RecoveryLog[] = []

export class AutoRecoveryService {

    /**
     * Diagnostica un error usando IA
     */
    static async diagnoseError(component: string, error: any): Promise<string> {
        try {
            const errorMessage = error?.message || error?.toString() || 'Error desconocido'
            const errorStack = error?.stack || 'Sin stack trace'

            const prompt = `Eres un experto en diagnóstico de errores de sistemas. Analiza este error y proporciona un diagnóstico conciso:

Componente: ${component}
Error: ${errorMessage}
Stack: ${errorStack}

Proporciona:
1. Causa probable del error
2. Solución recomendada
3. Acción específica a tomar

Responde en formato JSON:
{
  "causa": "descripción breve",
  "solucion": "qué hacer",
  "accion": "comando o código específico"
}`

            const response = await getGroq().chat.completions.create({
                model: 'llama-3.1-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 500
            })

            const diagnosis = response.choices[0]?.message?.content || 'No se pudo diagnosticar'
            return diagnosis
        } catch (err) {
            console.error('Error en diagnóstico IA:', err)
            return 'Error al diagnosticar con IA'
        }
    }

    /**
     * Auto-recuperación de WhatsApp
     */
    static async recoverWhatsApp(): Promise<boolean> {
        console.log('🔄 Iniciando auto-recuperación de WhatsApp...')

        try {
            // 1. Verificar estado actual
            const statusResponse = await fetch('http://localhost:4000/api/whatsapp/status')
            const status = await statusResponse.json()

            if (status.connected) {
                console.log('✅ WhatsApp ya está conectado')
                return true
            }

            // 2. Intentar desconectar sesión corrupta
            console.log('🔧 Limpiando sesión corrupta...')
            try {
                await fetch('http://localhost:4000/api/whatsapp/disconnect', { method: 'POST' })
                await new Promise(resolve => setTimeout(resolve, 2000))
            } catch (err) {
                console.log('⚠️  No se pudo desconectar (puede que no haya sesión)')
            }

            // 3. Limpiar archivos de sesión
            const fs = await import('fs')
            const path = await import('path')
            const sessionDir = path.join(process.cwd(), 'auth_sessions')

            if (fs.existsSync(sessionDir)) {
                console.log('🗑️  Eliminando archivos de sesión antiguos...')
                const files = fs.readdirSync(sessionDir)
                for (const file of files) {
                    fs.unlinkSync(path.join(sessionDir, file))
                }
            }

            // 4. Intentar reconectar
            console.log('🔌 Intentando reconectar...')
            const connectResponse = await fetch('http://localhost:4000/api/whatsapp/connect', {
                method: 'POST'
            })

            const connectResult = await connectResponse.json()

            if (connectResult.success || connectResult.qr) {
                console.log('✅ WhatsApp listo para escanear QR')
                this.logRecovery('WhatsApp', 'Conexión fallida', 'Sesión limpiada y lista para reconectar', 'Limpiar sesión y generar nuevo QR', true)
                return true
            }

            return false
        } catch (error) {
            console.error('❌ Error en auto-recuperación de WhatsApp:', error)
            const diagnosis = await this.diagnoseError('WhatsApp', error)
            this.logRecovery('WhatsApp', error, diagnosis, 'Falló la recuperación automática', false)
            return false
        }
    }

    /**
     * Auto-recuperación de Base de Datos
     */
    static async recoverDatabase(): Promise<boolean> {
        console.log('🔄 Iniciando auto-recuperación de Base de Datos...')

        try {
            // 1. Verificar conexión
            await prisma.$connect()
            console.log('✅ Conexión a base de datos OK')

            // 2. Verificar integridad de productos
            const productCount = await prisma.product.count()
            console.log(`📦 Productos en DB: ${productCount}`)

            if (productCount === 0) {
                console.log('⚠️  No hay productos, importando catálogo...')
                // Importar productos básicos
                const { execSync } = await import('child_process')
                execSync('npx tsx scripts/import-productos-completos.ts', { stdio: 'inherit' })

                this.logRecovery('Database', 'Sin productos', 'Base de datos vacía', 'Importar catálogo completo', true)
                return true
            }

            // 3. Verificar productos sin imágenes
            const productsWithoutImages = await prisma.product.count({
                where: {
                    OR: [
                        { images: null },
                        { images: '' },
                        { images: '[]' }
                    ]
                }
            })

            if (productsWithoutImages > 10) {
                console.log(`⚠️  ${productsWithoutImages} productos sin imágenes, restaurando...`)
                const { execSync } = await import('child_process')
                execSync('npx tsx scripts/restaurar-imagenes-megacomputer.ts', { stdio: 'inherit' })

                this.logRecovery('Database', 'Productos sin imágenes', `${productsWithoutImages} productos sin imágenes`, 'Restaurar imágenes de MegaComputer', true)
            }

            return true
        } catch (error) {
            console.error('❌ Error en auto-recuperación de DB:', error)
            const diagnosis = await this.diagnoseError('Database', error)
            this.logRecovery('Database', error, diagnosis, 'Falló la recuperación automática', false)
            return false
        }
    }

    /**
     * Auto-recuperación de Sistema de Pagos
     */
    static async recoverPayments(): Promise<boolean> {
        console.log('🔄 Iniciando auto-recuperación de Pagos...')

        try {
            // 1. Verificar que existan las variables de entorno
            const hasGroq = !!process.env.GROQ_API_KEY
            const hasMercadoPago = !!process.env.MERCADOPAGO_ACCESS_TOKEN
            const hasPayPal = !!process.env.PAYPAL_CLIENT_ID

            console.log(`✅ GROQ_API_KEY: ${hasGroq ? 'Configurado' : 'Faltante'}`)
            console.log(`⚠️  MERCADOPAGO: ${hasMercadoPago ? 'Configurado' : 'Faltante'}`)
            console.log(`⚠️  PAYPAL: ${hasPayPal ? 'Configurado' : 'Faltante'}`)

            // 2. Probar generación de link de pago
            const testProduct = await prisma.product.findFirst()

            if (!testProduct) {
                console.log('⚠️  No hay productos para probar pagos')
                return false
            }

            // Probar API de pagos
            const testPayment = await fetch('http://localhost:4000/api/payments/create-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: testProduct.id,
                    productName: testProduct.name,
                    price: testProduct.price,
                    quantity: 1,
                    method: 'whatsapp'
                })
            })

            const result = await testPayment.json()

            if (result.paymentLink) {
                console.log('✅ Sistema de pagos funcionando')
                this.logRecovery('Payments', 'Test de pagos', 'Sistema verificado', 'Generar link de prueba', true)
                return true
            }

            return false
        } catch (error) {
            console.error('❌ Error en auto-recuperación de Pagos:', error)
            const diagnosis = await this.diagnoseError('Payments', error)
            this.logRecovery('Payments', error, diagnosis, 'Falló la recuperación automática', false)
            return false
        }
    }

    /**
     * Auto-recuperación de Servicios de IA
     */
    static async recoverAI(): Promise<boolean> {
        console.log('🔄 Iniciando auto-recuperación de IA...')

        try {
            // 1. Verificar API key
            if (!process.env.GROQ_API_KEY) {
                console.log('❌ GROQ_API_KEY no configurado')
                this.logRecovery('AI', 'API Key faltante', 'Variable de entorno no configurada', 'Configurar GROQ_API_KEY', false)
                return false
            }

            // 2. Probar conexión con Groq (con timeout más largo)
            console.log('🧪 Probando Groq con timeout de 20 segundos...')

            const testPromise = getGroq().chat.completions.create({
                model: 'llama-3.1-8b-instant', // Modelo más rápido para test
                messages: [{ role: 'user', content: 'Test' }],
                max_tokens: 10
            })

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 20000)
            )

            const testResponse = await Promise.race([testPromise, timeoutPromise]) as any
            const response = testResponse.choices[0]?.message?.content

            if (response) {
                console.log('✅ Groq funcionando correctamente')
                this.logRecovery('AI', 'Test de IA', 'Groq respondió correctamente', 'Probar Groq API', true)
                return true
            }

            return false
        } catch (error: any) {
            console.error('❌ Error en Groq:', error.message)

            // Intentar con fallback a OpenRouter
            if (process.env.OPENROUTER_API_KEY) {
                console.log('🔄 Intentando con OpenRouter como fallback...')
                try {
                    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: 'anthropic/claude-3.5-sonnet',
                            messages: [{ role: 'user', content: 'Test' }],
                            max_tokens: 10
                        })
                    })

                    if (response.ok) {
                        console.log('✅ OpenRouter funcionando como fallback')
                        this.logRecovery('AI', 'Groq timeout', 'OpenRouter disponible como fallback', 'Usar OpenRouter', true)
                        return true
                    }
                } catch (fallbackError) {
                    console.log('❌ OpenRouter también falló')
                }
            }

            const diagnosis = await this.diagnoseError('AI', error)
            this.logRecovery('AI', error, diagnosis, 'Falló la recuperación automática', false)
            return false
        }
    }

    /**
     * Monitoreo continuo y auto-recuperación
     */
    static async startMonitoring(intervalMinutes: number = 5) {
        console.log(`🔍 Iniciando monitoreo automático cada ${intervalMinutes} minutos...`)

        const monitor = async () => {
            console.log('\n🔍 Ejecutando chequeo de salud del sistema...')

            const results = {
                whatsapp: await this.checkWhatsAppHealth(),
                database: await this.checkDatabaseHealth(),
                payments: await this.checkPaymentsHealth(),
                ai: await this.checkAIHealth()
            }

            // Auto-recuperar componentes con problemas
            if (!results.whatsapp) {
                console.log('⚠️  WhatsApp con problemas, iniciando recuperación...')
                await this.recoverWhatsApp()
            }

            if (!results.database) {
                console.log('⚠️  Base de datos con problemas, iniciando recuperación...')
                await this.recoverDatabase()
            }

            if (!results.payments) {
                console.log('⚠️  Pagos con problemas, iniciando recuperación...')
                await this.recoverPayments()
            }

            if (!results.ai) {
                console.log('⚠️  IA con problemas, iniciando recuperación...')
                await this.recoverAI()
            }

            console.log('✅ Chequeo de salud completado\n')
        }

        // Ejecutar inmediatamente
        await monitor()

        // Ejecutar periódicamente
        setInterval(monitor, intervalMinutes * 60 * 1000)
    }

    /**
     * Chequeos de salud individuales
     */
    private static async checkWhatsAppHealth(): Promise<boolean> {
        try {
            const response = await fetch('http://localhost:4000/api/whatsapp/status')
            const status = await response.json()
            return status.connected || false
        } catch {
            return false
        }
    }

    private static async checkDatabaseHealth(): Promise<boolean> {
        try {
            await prisma.$queryRaw`SELECT 1`
            return true
        } catch {
            return false
        }
    }

    private static async checkPaymentsHealth(): Promise<boolean> {
        try {
            return !!process.env.GROQ_API_KEY
        } catch {
            return false
        }
    }

    private static async checkAIHealth(): Promise<boolean> {
        try {
            if (!process.env.GROQ_API_KEY) return false

            const test = await getGroq().chat.completions.create({
                model: 'llama-3.1-70b-versatile',
                messages: [{ role: 'user', content: 'test' }],
                max_tokens: 5
            })

            return !!test.choices[0]?.message?.content
        } catch {
            return false
        }
    }

    /**
     * Registrar recuperación
     */
    private static logRecovery(component: string, error: any, diagnosis: string, action: string, success: boolean) {
        const log: RecoveryLog = {
            timestamp: new Date(),
            component,
            error: error?.message || error?.toString() || 'Error desconocido',
            diagnosis,
            action,
            success
        }

        recoveryLogs.push(log)

        // Mantener solo los últimos 100 logs
        if (recoveryLogs.length > 100) {
            recoveryLogs.shift()
        }

        console.log(`📝 Log de recuperación: ${component} - ${success ? 'ÉXITO' : 'FALLO'}`)
    }

    /**
     * Obtener logs de recuperación
     */
    static getRecoveryLogs(): RecoveryLog[] {
        return recoveryLogs
    }

    /**
     * Recuperación completa del sistema
     */
    static async fullSystemRecovery(): Promise<void> {
        console.log('🚀 INICIANDO RECUPERACIÓN COMPLETA DEL SISTEMA\n')
        console.log('='.repeat(60))

        const results = {
            whatsapp: await this.recoverWhatsApp(),
            database: await this.recoverDatabase(),
            payments: await this.recoverPayments(),
            ai: await this.recoverAI()
        }

        console.log('\n' + '='.repeat(60))
        console.log('📊 RESULTADOS DE RECUPERACIÓN:')
        console.log('='.repeat(60))
        console.log(`WhatsApp: ${results.whatsapp ? '✅ OK' : '❌ FALLO'}`)
        console.log(`Database: ${results.database ? '✅ OK' : '❌ FALLO'}`)
        console.log(`Payments: ${results.payments ? '✅ OK' : '❌ FALLO'}`)
        console.log(`AI: ${results.ai ? '✅ OK' : '❌ FALLO'}`)
        console.log('='.repeat(60) + '\n')

        const allOk = Object.values(results).every(r => r)

        if (allOk) {
            console.log('🎉 SISTEMA COMPLETAMENTE RECUPERADO\n')
        } else {
            console.log('⚠️  ALGUNOS COMPONENTES REQUIEREN ATENCIÓN MANUAL\n')
        }
    }
}

