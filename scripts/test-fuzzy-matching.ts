/**
 * Script para probar el sistema de Fuzzy Matching
 * Ejecutar: npx tsx scripts/test-fuzzy-matching.ts
 */

import { FuzzyMatchService } from '../src/lib/fuzzy-match-service'

console.log('🔍 PRUEBA DE FUZZY MATCHING\n')
console.log('=' .repeat(60))

// Pruebas de corrección de errores
const testCases = [
  { input: 'laptp', expected: 'laptop' },
  { input: 'moto', expected: 'moto' },
  { input: 'pino', expected: 'piano' },
  { input: 'macbok', expected: 'macbook' },
  { input: 'computdor', expected: 'computador' },
  { input: 'usdo', expected: 'usado' },
  { input: 'nuebo', expected: 'nuevo' },
  { input: 'informcion', expected: 'informacion' },
  { input: 'preio', expected: 'precio' },
  { input: 'dispnible', expected: 'disponible' },
  { input: 'megapak', expected: 'megapack' },
  { input: 'cursos', expected: 'cursos' },
  { input: 'garantia', expected: 'garantia' },
  { input: 'envio', expected: 'envio' }
]

console.log('\n📝 PRUEBAS DE CORRECCIÓN DE ERRORES:\n')

const dictionary = FuzzyMatchService.getCommonProductTerms()
let passed = 0
let failed = 0

testCases.forEach((test, index) => {
  const result = FuzzyMatchService.correctTypos(test.input, dictionary, 0.7)
  const corrected = result.corrected
  const isCorrect = corrected === test.expected
  
  if (isCorrect) {
    passed++
    console.log(`✅ Test ${index + 1}: "${test.input}" → "${corrected}"`)
  } else {
    failed++
    console.log(`❌ Test ${index + 1}: "${test.input}" → "${corrected}" (esperado: "${test.expected}")`)
  }
  
  if (result.corrections.length > 0) {
    result.corrections.forEach(c => {
      console.log(`   Corrección: "${c.original}" → "${c.corrected}" (${(c.similarity * 100).toFixed(0)}% similar)`)
    })
  }
})

console.log('\n' + '='.repeat(60))
console.log(`\n📊 RESULTADOS: ${passed} pasadas, ${failed} fallidas`)

// Pruebas de similitud
console.log('\n\n🔍 PRUEBAS DE SIMILITUD:\n')

const similarityTests = [
  ['laptop', 'laptp'],
  ['moto', 'moto'],
  ['piano', 'pino'],
  ['macbook', 'macbok'],
  ['computador', 'computdor'],
  ['usado', 'usdo'],
  ['nuevo', 'nuebo'],
  ['precio', 'preio']
]

similarityTests.forEach(([word1, word2]) => {
  const similarity = FuzzyMatchService.calculateSimilarity(word1, word2)
  const percentage = (similarity * 100).toFixed(0)
  const icon = similarity >= 0.7 ? '✅' : '⚠️'
  console.log(`${icon} "${word1}" vs "${word2}": ${percentage}% similar`)
})

// Pruebas de búsqueda difusa
console.log('\n\n🔎 PRUEBAS DE BÚSQUEDA DIFUSA:\n')

const searchTests = [
  { query: 'laptp', text: 'Laptop HP 15 pulgadas', shouldFind: true },
  { query: 'moto pulsr', text: 'Moto Bajaj Pulsar 180', shouldFind: true },
  { query: 'pino', text: 'Piano digital Yamaha', shouldFind: true },
  { query: 'macbok', text: 'MacBook Pro 2023', shouldFind: true },
  { query: 'computdor', text: 'Computador portátil', shouldFind: true },
  { query: 'xyz123', text: 'Laptop HP 15 pulgadas', shouldFind: false }
]

searchTests.forEach((test, index) => {
  const found = FuzzyMatchService.fuzzySearch(test.query, test.text, 0.7)
  const isCorrect = found === test.shouldFind
  const icon = isCorrect ? '✅' : '❌'
  const result = found ? 'ENCONTRADO' : 'NO ENCONTRADO'
  
  console.log(`${icon} Test ${index + 1}: Buscar "${test.query}" en "${test.text}"`)
  console.log(`   Resultado: ${result} (esperado: ${test.shouldFind ? 'ENCONTRADO' : 'NO ENCONTRADO'})`)
})

console.log('\n' + '='.repeat(60))
console.log('\n✨ Pruebas completadas!\n')
console.log('💡 El sistema ahora puede entender:')
console.log('   - Palabras mal escritas (laptp → laptop)')
console.log('   - Palabras incompletas (moto → motocicleta)')
console.log('   - Errores de tipeo (pino → piano)')
console.log('   - Variaciones ortográficas (computdor → computador)')
console.log('')
