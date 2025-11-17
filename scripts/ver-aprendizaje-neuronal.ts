#!/usr/bin/env tsx
/**
 * 📊 VER ESTADÍSTICAS DE APRENDIZAJE NEURONAL
 * 
 * Muestra cuántas "neuronas" ha aprendido el bot de las conversaciones con Groq
 */

import { NeuralLearningService } from '../src/lib/neural-learning-service'
import fs from 'fs'
import path from 'path'

async function main() {
  console.log('🧠 ESTADÍSTICAS DE APRENDIZAJE NEURONAL\n')
  console.log('═'.repeat(60))

  // Obtener estadísticas
  const stats = await NeuralLearningService.getStats()

  console.log(`\n📊 Resumen:`)
  console.log(`   Total de neuronas aprendidas: ${stats.totalLearned}`)
  console.log(`   Última actualización: ${stats.lastUpdate || 'Nunca'}`)
  console.log(`   En cola para procesar: ${stats.queueSize}`)

  // Leer archivo de aprendizaje si existe
  const filePath = path.join(process.cwd(), 'data/neural-learning.json')
  
  if (fs.existsSync(filePath)) {
    const content = await fs.promises.readFile(filePath, 'utf-8')
    const data = JSON.parse(content)

    console.log(`\n📚 Detalles:`)
    console.log(`   Versión: ${data.version}`)
    console.log(`   Total de ejemplos: ${data.ejemplos?.length || 0}`)

    if (data.ejemplos && data.ejemplos.length > 0) {
      console.log(`\n🎯 Últimas 5 neuronas aprendidas:\n`)

      const ultimas = data.ejemplos.slice(-5).reverse()
      
      ultimas.forEach((ejemplo: any, index: number) => {
        console.log(`   ${index + 1}. Entrada: "${ejemplo.entrada.substring(0, 50)}..."`)
        console.log(`      Salida: "${ejemplo.salida.substring(0, 80)}..."`)
        console.log(`      Intención: ${ejemplo.intencion}`)
        console.log(`      Producto: ${ejemplo.producto_nombre || 'N/A'}`)
        console.log(`      Confianza: ${(ejemplo.confianza * 100).toFixed(0)}%`)
        console.log(`      Fecha: ${new Date(ejemplo.fecha_aprendizaje).toLocaleString('es-CO')}`)
        console.log()
      })

      // Estadísticas por intención
      const intenciones = new Map<string, number>()
      data.ejemplos.forEach((ej: any) => {
        const count = intenciones.get(ej.intencion) || 0
        intenciones.set(ej.intencion, count + 1)
      })

      console.log(`\n📋 Neuronas por intención:`)
      for (const [intencion, count] of intenciones) {
        console.log(`   - ${intencion}: ${count} neuronas`)
      }
    }
  } else {
    console.log(`\n⚠️  Aún no hay neuronas aprendidas.`)
    console.log(`   El bot aprenderá automáticamente de las conversaciones exitosas con Groq.`)
  }

  console.log('\n' + '═'.repeat(60))
  console.log('\n💡 Tip: El bot aprende automáticamente de cada conversación exitosa con Groq')
  console.log('   y actualiza su base de conocimiento cada 50 interacciones.\n')
}

main().catch(console.error)
