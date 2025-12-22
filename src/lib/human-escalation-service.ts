/**
 * 👨‍💼 SERVICIO DE ESCALAMIENTO A HUMANO
 * Notifica al administrador cuando se necesita atención personalizada
 */

import { WhatsAppWebService } from './whatsapp-web-service'
import { db } from './db'

export class HumanEscalationService {
    private static ADMIN_PHONE = '573136174267' // Tu número

    /**
     * Detectar si necesita escalamiento a humano
     */
    static needsHumanEscalation(message: string): {
        needs: boolean
        reason: string
        category: string
    } {
        const lowerMessage = message.toLowerCase()

        // SERVICIOS TÉCNICOS
        if (
            /reparaci[oó]n|reparar|arreglar|arreglo|da[ñn]ado|no funciona|problema|falla|error/i.test(lowerMessage) &&
            /computador|pc|laptop|portatil|port[aá]til|equipo/i.test(lowerMessage)
        ) {
            return {
                needs: true,
                reason: 'Servicio técnico de reparación',
                category: 'REPARACION'
            }
        }

        // MANTENIMIENTO
        if (
            /mantenimiento|limpieza|formatear|formateo|instalar|instalaci[oó]n/i.test(lowerMessage) &&
            /computador|pc|laptop|portatil|port[aá]til|equipo/i.test(lowerMessage)
        ) {
            return {
                needs: true,
                reason: 'Servicio de mantenimiento',
                category: 'MANTENIMIENTO'
            }
        }

        // COTIZACIÓN PERSONALIZADA
        if (
            /cotizaci[oó]n|cotizar|presupuesto|cu[aá]nto cuesta|precio de/i.test(lowerMessage) &&
            /reparaci[oó]n|mantenimiento|servicio/i.test(lowerMessage)
        ) {
            return {
                needs: true,
                reason: 'Cotización de servicio',
                category: 'COTIZACION'
            }
        }

        // ASESORÍA TÉCNICA
        if (
            /asesor[ií]a|recomendar|recomienda|qu[eé] me conviene|cu[aá]l es mejor/i.test(lowerMessage) &&
            /comprar|adquirir/i.test(lowerMessage)
        ) {
            return {
                needs: true,
                reason: 'Asesoría técnica personalizada',
                category: 'ASESORIA'
            }
        }

        // AGENDAMIENTO DE CITAS
        // IMPORTANTE: NO confundir "ver foto" con "ver producto"
        if (
            /agendar|cita|agenda|reservar|visita/i.test(lowerMessage) ||
            (/\b(ver|ir a ver|quiero ver)\b/i.test(lowerMessage) && 
             /\b(moto|producto|local|tienda|negocio|laptop|computador)\b/i.test(lowerMessage) &&
             !/\b(foto|imagen|picture|pic)\b/i.test(lowerMessage))
        ) {
            return {
                needs: true,
                reason: 'Solicitud de cita',
                category: 'CITA'
            }
        }

        return {
            needs: false,
            reason: '',
            category: ''
        }
    }

    /**
     * Recopilar información del cliente
     */
    static async collectCustomerInfo(
        customerPhone: string,
        customerMessage: string,
        category: string
    ): Promise<string[]> {
        const questions: string[] = []

        if (category === 'REPARACION' || category === 'MANTENIMIENTO') {
            questions.push('¿Qué marca y modelo es tu computador?')
            questions.push('¿Qué problema presenta exactamente?')
            questions.push('¿Cuándo comenzó el problema?')
        } else if (category === 'COTIZACION') {
            questions.push('¿Qué servicio necesitas exactamente?')
            questions.push('¿Es para computador de escritorio o portátil?')
        } else if (category === 'ASESORIA') {
            questions.push('¿Para qué vas a usar el equipo principalmente?')
            questions.push('¿Cuál es tu presupuesto aproximado?')
        } else if (category === 'CITA') {
            questions.push('¿Qué producto o servicio quieres ver?')
            questions.push('¿Qué día te gustaría venir?')
            questions.push('¿En qué horario prefieres? (mañana/tarde)')
        }

        return questions
    }

    /**
     * Notificar al administrador
     */
    static async notifyAdmin(
        userId: string,
        customerPhone: string,
        customerName: string,
        category: string,
        customerMessage: string,
        collectedInfo?: string[]
    ): Promise<boolean> {
        try {
            console.log(`[Escalation] 📢 Notificando al admin sobre caso: ${category}`)

            // Construir mensaje de notificación
            let notification = `🔔 *NUEVO CASO - ${category}*\n\n`
            notification += `👤 *Cliente:* ${customerName}\n`
            notification += `📱 *Teléfono:* ${customerPhone}\n`
            notification += `📝 *Mensaje:* ${customerMessage}\n`

            if (collectedInfo && collectedInfo.length > 0) {
                notification += `\n📋 *Información recopilada:*\n`
                collectedInfo.forEach((info, index) => {
                    notification += `${index + 1}. ${info}\n`
                })
            }

            notification += `\n⏰ *Hora:* ${new Date().toLocaleString('es-ES')}\n`
            notification += `\n💬 *Responde directamente al cliente:*\n`
            notification += `https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}`

            // Enviar notificación al admin
            const sent = await WhatsAppWebService.sendMessage(
                userId,
                this.ADMIN_PHONE + '@s.whatsapp.net',
                notification
            )

            if (sent) {
                console.log(`[Escalation] ✅ Notificación enviada al admin`)

                // Guardar en DB
                await this.saveEscalation(userId, customerPhone, category, customerMessage)
            }

            return sent

        } catch (error) {
            console.error('[Escalation] ❌ Error notificando al admin:', error)
            return false
        }
    }

    /**
     * Guardar escalamiento en DB
     */
    private static async saveEscalation(
        userId: string,
        customerPhone: string,
        category: string,
        message: string
    ) {
        try {
            // Buscar conversación
            const conversation = await db.conversation.findFirst({
                where: {
                    userId,
                    customerPhone
                }
            })

            if (conversation) {
                // Agregar nota en la conversación
                await db.message.create({
                    data: {
                        conversationId: conversation.id,
                        content: `[ESCALADO A HUMANO - ${category}] ${message}`,
                        direction: 'INCOMING',
                        type: 'TEXT'
                    }
                })
            }
        } catch (error) {
            console.error('[Escalation] Error guardando escalamiento:', error)
        }
    }

    /**
     * Generar respuesta de escalamiento
     */
    static generateEscalationResponse(category: string): string {
        const responses = {
            REPARACION: `¡Claro! Sí ofrecemos servicio de reparación de computadores. 🔧

Para darte un diagnóstico preciso y cotización, necesito algunos datos:

1️⃣ ¿Qué marca y modelo es tu computador?
2️⃣ ¿Qué problema presenta exactamente?
3️⃣ ¿Cuándo comenzó el problema?

📞 También puedes llamarme directamente al:
*313 617 4267*

Te responderé personalmente para ayudarte mejor. 😊`,

            MANTENIMIENTO: `¡Por supuesto! Ofrecemos servicio de mantenimiento de computadores. 🛠️

Para darte información precisa, cuéntame:

1️⃣ ¿Qué marca y modelo es tu computador?
2️⃣ ¿Qué tipo de mantenimiento necesitas? (limpieza, formateo, instalación, etc.)
3️⃣ ¿Es portátil o de escritorio?

📞 Contáctame directamente al:
*313 617 4267*

Te atenderé personalmente. 😊`,

            COTIZACION: `¡Con gusto! Te puedo dar una cotización personalizada. 💰

Para darte un precio exacto, necesito saber:

1️⃣ ¿Qué servicio necesitas exactamente?
2️⃣ ¿Marca y modelo del equipo?
3️⃣ ¿Algún detalle adicional?

📞 Llámame o escríbeme al:
*313 617 4267*

Te responderé con la cotización precisa. 😊`,

            ASESORIA: `¡Perfecto! Te puedo asesorar para que elijas el mejor equipo. 💻

Para recomendarte lo ideal, cuéntame:

1️⃣ ¿Para qué lo vas a usar principalmente?
2️⃣ ¿Cuál es tu presupuesto aproximado?
3️⃣ ¿Prefieres portátil o de escritorio?

📞 Contáctame al:
*313 617 4267*

Te ayudaré a elegir lo mejor para ti. 😊`,

            CITA: `¡Claro! Con gusto agendamos una cita para que vengas. 📅

Para coordinar mejor, cuéntame:

1️⃣ ¿Qué producto o servicio quieres ver?
2️⃣ ¿Qué día te gustaría venir?
3️⃣ ¿Prefieres en la mañana o en la tarde?

📍 *Ubicación:*
Centro Comercial El Diamante 2, San Nicolás, Cali

📞 Confirma tu cita al:
*313 617 4267*

Te esperamos! 😊`
        }

        return responses[category as keyof typeof responses] || responses.ASESORIA
    }
}
