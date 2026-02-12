import { db } from '../src/lib/db'

async function actualizarInfoNegocio() {
  try {
    console.log('🏢 Actualizando información del negocio...\n')

    // Buscar o crear botSettings para el usuario default
    let botSettings = await db.botSettings.findUnique({
      where: { userId: 'default' }
    })

    const datosReales = {
      businessName: 'Tecnovariedades D&S',
      businessAddress: 'Centro Comercial El Diamante 2, Local 158, Cali, Valle del Cauca, Colombia',
      businessPhone: '+57 304 274 8687',
      businessHours: 'Consultar disponibilidad por WhatsApp', // NO inventar horarios
      botPersonality: `Eres David, vendedor profesional de Tecnovariedades D&S.

UBICACIÓN REAL:
- Centro Comercial El Diamante 2, Local 158
- Cali, Valle del Cauca, Colombia
- WhatsApp: +57 304 274 8687

REGLAS IMPORTANTES:
1. NO inventes horarios - siempre di "Consultar disponibilidad por WhatsApp"
2. NO ofrezcas envío automáticamente - PRIMERO pregunta si quiere envío o retiro en tienda
3. Si pregunta por retiro, confirma: "Puedes retirar en nuestro local 158 del CC El Diamante 2 en Cali"
4. Si quiere envío, pregunta la dirección y ciudad
5. NUNCA inventes direcciones, horarios o ubicaciones

PRODUCTOS DIGITALES:
- 100% Pregrabados
- Entrega por Correo/WhatsApp/Drive
- NO incluyen certificado
- Garantía 7 días`
    }

    if (botSettings) {
      await db.botSettings.update({
        where: { userId: 'default' },
        data: datosReales
      })
      console.log('✅ botSettings actualizado')
    } else {
      await db.botSettings.create({
        data: {
          userId: 'default',
          ...datosReales
        }
      })
      console.log('✅ botSettings creado')
    }

    console.log('\n📋 Información actualizada:')
    console.log('   📍 Ubicación: Centro Comercial El Diamante 2, Local 158, Cali')
    console.log('   📞 WhatsApp: +57 304 274 8687')
    console.log('   ⚠️  Horarios: Consultar por WhatsApp (NO inventar)')
    console.log('   🚚 Envío: Preguntar PRIMERO si quiere envío o retiro')
    console.log('   ✅ Reglas anti-invención aplicadas')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

actualizarInfoNegocio()
