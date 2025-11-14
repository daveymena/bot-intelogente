/**
 * 🧪 COMPARACIÓN: LOCAL vs IA vs HÍBRIDO
 * Demuestra las diferencias entre cada enfoque
 */

console.log('🔬 COMPARACIÓN DE SISTEMAS\n')
console.log('='.repeat(80))

// Simulación de base de datos
const mockProducts = [
  {
    id: 1,
    name: 'Portátil Acer Aspire 5 A15-51P-591E',
    description: 'Intel Core i5-1335U, 16GB RAM DDR4, 512GB SSD NVMe, Pantalla 15.6" FHD',
    price: 1899900,
    currency: 'COP',
    category: 'PHYSICAL'
  },
  {
    id: 2,
    name: 'Laptop Asus Vivobook 15',
    description: 'Intel i7-13620H, 16GB RAM, 1TB SSD, Pantalla 15.6" FHD IPS',
    price: 2499900,
    currency: 'COP',
    category: 'PHYSICAL'
  }
]

// ============ ENFOQUE 1: SOLO LOCAL (Sin IA) ============
function enfoqueLocal(mensaje) {
  console.log('\n📦 ENFOQUE 1: SOLO LOCAL (Sin IA)')
  console.log('-'.repeat(80))
  console.log(`Mensaje: "${mensaje}"`)
  console.log('\n✅ VENTAJAS:')
  console.log('  - Muy rápido (sin llamadas a API)')
  console.log('  - Sin costos de IA')
  console.log('  - Respuestas consistentes')
  console.log('  - Funciona offline')
  
  console.log('\n❌ DESVENTAJAS:')
  console.log('  - Respuestas rígidas y predefinidas')
  console.log('  - No entiende contexto complejo')
  console.log('  - No puede conversar naturalmente')
  console.log('  - Limitado a patrones programados')

  console.log('\n💬 RESPUESTA:')
  const respuesta = `💻 *Portátiles Disponibles*

¡Claro que sí! 😎 Tenemos opciones para diferentes presupuestos 👇

🔹 *Acer Aspire 5 A15-51P-591E*
⚙️ i5-1335U 💾 16GB / 512GB SSD 🖥️ 15.6" FHD
💰 *$1.899.900 COP*

🔹 *Asus Vivobook 15*
⚙️ i7-13620H 💾 16GB / 1TB SSD 🖥️ 15.6" FHD
💰 *$2.499.900 COP*

¿Te gustaría que te recomiende uno según tu uso? 🤔`
  
  console.log(respuesta)
}

// ============ ENFOQUE 2: SOLO IA (Sin BD estructurada) ============
function enfoqueIA(mensaje) {
  console.log('\n🤖 ENFOQUE 2: SOLO IA (Sin BD estructurada)')
  console.log('-'.repeat(80))
  console.log(`Mensaje: "${mensaje}"`)
  console.log('\n✅ VENTAJAS:')
  console.log('  - Conversación natural y fluida')
  console.log('  - Entiende contexto complejo')
  console.log('  - Puede responder preguntas variadas')
  console.log('  - Adaptable a cualquier situación')
  
  console.log('\n❌ DESVENTAJAS:')
  console.log('  - Puede inventar productos que no existen')
  console.log('  - Precios incorrectos o desactualizados')
  console.log('  - Lento (llamadas a API)')
  console.log('  - Costos por uso')
  console.log('  - Respuestas inconsistentes')

  console.log('\n💬 RESPUESTA (Simulada):')
  const respuesta = `¡Claro! Tenemos varios portátiles disponibles. 

Te recomiendo el Acer Aspire 5 que está alrededor de $1.800.000 COP, 
tiene buen procesador y es ideal para trabajo. También tenemos el 
Asus Vivobook que es un poco más potente.

¿Qué uso le darías al portátil?`
  
  console.log(respuesta)
  console.log('\n⚠️  PROBLEMA: Precio incorrecto ($1.800.000 vs $1.899.900)')
  console.log('⚠️  PROBLEMA: Falta formato visual')
  console.log('⚠️  PROBLEMA: Información incompleta')
}

// ============ ENFOQUE 3: HÍBRIDO (BD + IA) ============
function enfoqueHibrido(mensaje) {
  console.log('\n🧠 ENFOQUE 3: HÍBRIDO (BD + IA) ⭐ RECOMENDADO')
  console.log('-'.repeat(80))
  console.log(`Mensaje: "${mensaje}"`)
  console.log('\n✅ VENTAJAS:')
  console.log('  - Datos precisos de la BD')
  console.log('  - Conversación natural de la IA')
  console.log('  - Formato visual perfecto')
  console.log('  - Entiende contexto complejo')
  console.log('  - Precios siempre correctos')
  console.log('  - Respuestas contextuales')
  
  console.log('\n❌ DESVENTAJAS:')
  console.log('  - Requiere configuración inicial')
  console.log('  - Costos de IA (pero optimizados)')

  console.log('\n🔄 PROCESO:')
  console.log('  1. 🧠 IA analiza: "Cliente busca portátiles"')
  console.log('  2. 📦 BD busca: 2 portátiles encontrados')
  console.log('  3. 🤖 IA genera: Respuesta natural con datos reales')
  console.log('  4. 💬 Sistema formatea: Respuesta visual para WhatsApp')

  console.log('\n💬 RESPUESTA:')
  const respuesta = `¡Perfecto! 😊 Tengo justo lo que buscas.

💻 *Portátiles Disponibles*

🔹 *Acer Aspire 5 A15-51P-591E*
⚙️ i5-1335U 💾 16GB / 512GB SSD 🖥️ 15.6" FHD
💰 *$1.899.900 COP*
👉 Ideal para trabajo y estudios

🔹 *Asus Vivobook 15*
⚙️ i7-13620H 💾 16GB / 1TB SSD 🖥️ 15.6" FHD
💰 *$2.499.900 COP*
👉 Más potente, perfecto para diseño

¿Para qué lo usarías principalmente? 🤔
Así te recomiendo el mejor para ti 💡`
  
  console.log(respuesta)
  console.log('\n✅ PERFECTO: Precios correctos de la BD')
  console.log('✅ PERFECTO: Formato visual optimizado')
  console.log('✅ PERFECTO: Conversación natural de la IA')
  console.log('✅ PERFECTO: Contexto y recomendaciones personalizadas')
}

// ============ COMPARACIÓN LADO A LADO ============
function compararEnfoques() {
  console.log('\n\n📊 TABLA COMPARATIVA')
  console.log('='.repeat(80))
  console.log('┌─────────────────────┬──────────┬──────────┬──────────┐')
  console.log('│ Característica      │  LOCAL   │    IA    │ HÍBRIDO  │')
  console.log('├─────────────────────┼──────────┼──────────┼──────────┤')
  console.log('│ Velocidad           │    ⭐⭐⭐  │    ⭐     │    ⭐⭐   │')
  console.log('│ Precisión datos     │    ⭐⭐⭐  │    ⭐     │    ⭐⭐⭐  │')
  console.log('│ Conversación nat.   │    ⭐     │    ⭐⭐⭐  │    ⭐⭐⭐  │')
  console.log('│ Formato visual      │    ⭐⭐⭐  │    ⭐     │    ⭐⭐⭐  │')
  console.log('│ Contexto complejo   │    ⭐     │    ⭐⭐⭐  │    ⭐⭐⭐  │')
  console.log('│ Costo               │    ⭐⭐⭐  │    ⭐     │    ⭐⭐   │')
  console.log('│ Confiabilidad       │    ⭐⭐⭐  │    ⭐⭐   │    ⭐⭐⭐  │')
  console.log('└─────────────────────┴──────────┴──────────┴──────────┘')
}

// ============ CASOS DE USO ============
function casosDeUso() {
  console.log('\n\n💡 CASOS DE USO RECOMENDADOS')
  console.log('='.repeat(80))
  
  console.log('\n📦 USA SOLO LOCAL cuando:')
  console.log('  - Tienes presupuesto muy limitado')
  console.log('  - Las consultas son muy simples y predecibles')
  console.log('  - No necesitas conversación natural')
  console.log('  - Quieres máxima velocidad')
  
  console.log('\n🤖 USA SOLO IA cuando:')
  console.log('  - No tienes base de datos estructurada')
  console.log('  - Los productos cambian constantemente')
  console.log('  - Necesitas conversación muy natural')
  console.log('  - La precisión de precios no es crítica')
  
  console.log('\n🧠 USA HÍBRIDO cuando: ⭐ RECOMENDADO')
  console.log('  - Tienes base de datos de productos')
  console.log('  - Necesitas precios exactos')
  console.log('  - Quieres conversación natural')
  console.log('  - Buscas la mejor experiencia de usuario')
  console.log('  - Vendes productos con especificaciones técnicas')
}

// ============ EJEMPLO PRÁCTICO ============
function ejemploPractico() {
  console.log('\n\n🎯 EJEMPLO PRÁCTICO: "Necesito un portátil para diseño gráfico"')
  console.log('='.repeat(80))
  
  console.log('\n📦 RESPUESTA LOCAL:')
  console.log('  "Tenemos estos portátiles: [lista genérica]"')
  console.log('  ❌ No entiende "para diseño gráfico"')
  
  console.log('\n🤖 RESPUESTA SOLO IA:')
  console.log('  "Para diseño gráfico necesitas buena GPU y RAM..."')
  console.log('  ❌ Puede recomendar productos que no tienes')
  console.log('  ❌ Precios incorrectos')
  
  console.log('\n🧠 RESPUESTA HÍBRIDA:')
  console.log('  1. IA entiende: "Necesita GPU potente, 16GB+ RAM"')
  console.log('  2. BD busca: Productos con esas características')
  console.log('  3. IA responde: "Para diseño te recomiendo el Asus Vivobook"')
  console.log('  4. Formato: Respuesta visual con specs y precio real')
  console.log('  ✅ Entiende la necesidad')
  console.log('  ✅ Datos precisos')
  console.log('  ✅ Recomendación personalizada')
}

// ============ EJECUTAR COMPARACIÓN ============
const mensajePrueba = "Quiero ver portátiles disponibles"

enfoqueLocal(mensajePrueba)
enfoqueIA(mensajePrueba)
enfoqueHibrido(mensajePrueba)
compararEnfoques()
casosDeUso()
ejemploPractico()

console.log('\n\n' + '='.repeat(80))
console.log('✅ CONCLUSIÓN: El sistema HÍBRIDO es el mejor enfoque')
console.log('='.repeat(80))
console.log('\nCombina lo mejor de ambos mundos:')
console.log('  ✅ Datos precisos de la BD')
console.log('  ✅ Conversación natural de la IA')
console.log('  ✅ Formato visual perfecto')
console.log('  ✅ Experiencia de usuario superior')
console.log('\n💡 Implementa el sistema híbrido para obtener los mejores resultados!')
