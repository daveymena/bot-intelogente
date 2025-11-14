import * as fs from 'fs'
import * as path from 'path'

// Leer el archivo backup
const backupPath = path.join(process.cwd(), 'src/lib/product-intelligence-service.ts.backup')
const outputPath = path.join(process.cwd(), 'src/lib/product-intelligence-service.ts')

const content = fs.readFileSync(backupPath, 'utf-8')

// Encontrar donde termina la clase (el primer } después de generateStaticResponse)
const lines = content.split('\n')
let classEndIndex = -1
let braceCount = 0
let inClass = false

for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    if (line.includes('export class ProductIntelligenceService')) {
        inClass = true
        braceCount = 0
    }
    
    if (inClass) {
        // Contar llaves
        for (const char of line) {
            if (char === '{') braceCount++
            if (char === '}') braceCount--
        }
        
        // Si llegamos a 0, encontramos el cierre de la clase
        if (braceCount === 0 && line.trim() === '}') {
            classEndIndex = i
            break
        }
    }
}

console.log(`Clase termina en línea: ${classEndIndex + 1}`)

// Extraer métodos que están fuera de la clase
const methodsOutside = lines.slice(classEndIndex + 1).join('\n')

// Insertar los métodos DENTRO de la clase (antes del cierre)
const beforeClass = lines.slice(0, classEndIndex).join('\n')
const fixedContent = beforeClass + '\n' + methodsOutside.trim() + '\n}\n'

// Escribir el archivo corregido
fs.writeFileSync(outputPath, fixedContent, 'utf-8')

console.log('✅ Archivo corregido exitosamente')
console.log(`📝 Total de líneas: ${fixedContent.split('\n').length}`)
