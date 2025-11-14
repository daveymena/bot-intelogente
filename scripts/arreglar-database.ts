import * as fs from 'fs'
import * as path from 'path'

async function arreglarDatabase() {
  console.log('\n🔧 ARREGLAR CONFIGURACIÓN DE BASE DE DATOS\n')
  console.log('═'.repeat(60))

  const envPath = path.join(process.cwd(), '.env')

  if (!fs.existsSync(envPath)) {
    console.log('❌ No se encontró el archivo .env')
    console.log('\n💡 Crea un archivo .env en la raíz del proyecto')
    process.exit(1)
  }

  console.log('\n1️⃣ Leyendo archivo .env...')
  let envContent = fs.readFileSync(envPath, 'utf-8')

  // Verificar si DATABASE_URL existe
  const hasDbUrl = envContent.includes('DATABASE_URL=')
  
  if (!hasDbUrl) {
    console.log('⚠️  DATABASE_URL no encontrada')
    console.log('\n2️⃣ Agregando DATABASE_URL...')
    
    // Agregar DATABASE_URL al final de la sección de base de datos
    if (envContent.includes('# ===== BASE DE DATOS =====')) {
      envContent = envContent.replace(
        '# ===== BASE DE DATOS =====',
        '# ===== BASE DE DATOS =====\nDATABASE_URL="file:./dev.db"'
      )
    } else {
      // Agregar al final del archivo
      envContent += '\n\n# ===== BASE DE DATOS =====\nDATABASE_URL="file:./dev.db"\n'
    }
    
    fs.writeFileSync(envPath, envContent)
    console.log('✅ DATABASE_URL agregada: file:./dev.db')
  } else {
    console.log('✅ DATABASE_URL ya existe')
    
    // Verificar si está comentada
    const lines = envContent.split('\n')
    const dbUrlLine = lines.find(line => line.includes('DATABASE_URL='))
    
    if (dbUrlLine?.trim().startsWith('#')) {
      console.log('⚠️  DATABASE_URL está comentada')
      console.log('\n2️⃣ Descomentando DATABASE_URL...')
      
      envContent = envContent.replace(
        /# DATABASE_URL="file:\.\/dev\.db"/,
        'DATABASE_URL="file:./dev.db"'
      )
      
      fs.writeFileSync(envPath, envContent)
      console.log('✅ DATABASE_URL descomentada')
    }
  }

  console.log('\n3️⃣ Verificando schema de Prisma...')
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma')
  
  if (!fs.existsSync(schemaPath)) {
    console.log('❌ No se encontró prisma/schema.prisma')
    process.exit(1)
  }

  const schemaContent = fs.readFileSync(schemaPath, 'utf-8')
  
  if (schemaContent.includes('provider = "postgresql"')) {
    console.log('⚠️  Schema configurado para PostgreSQL')
    console.log('\n💡 Para usar SQLite en desarrollo:')
    console.log('   1. Cambia en prisma/schema.prisma:')
    console.log('      provider = "sqlite"')
    console.log('   2. Ejecuta: npm run db:push')
    console.log('\n💡 Para usar PostgreSQL:')
    console.log('   1. Instala PostgreSQL')
    console.log('   2. Cambia DATABASE_URL en .env:')
    console.log('      DATABASE_URL="postgresql://user:pass@localhost:5432/db"')
  } else if (schemaContent.includes('provider = "sqlite"')) {
    console.log('✅ Schema configurado para SQLite')
  }

  console.log('\n4️⃣ Verificando archivo de base de datos...')
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
  
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath)
    console.log(`✅ Base de datos existe (${(stats.size / 1024).toFixed(2)} KB)`)
  } else {
    console.log('⚠️  Base de datos no existe')
    console.log('\n💡 Para crear la base de datos:')
    console.log('   npm run db:push')
  }

  console.log('\n' + '═'.repeat(60))
  console.log('\n✅ CONFIGURACIÓN VERIFICADA\n')
  console.log('🎯 Próximos pasos:')
  console.log('\n   1. Si usas SQLite (desarrollo):')
  console.log('      npm run db:push')
  console.log('\n   2. Si usas PostgreSQL (producción):')
  console.log('      - Asegúrate de que PostgreSQL esté corriendo')
  console.log('      - Configura DATABASE_URL en .env')
  console.log('      - Ejecuta: npm run db:push')
  console.log('\n   3. Verificar que funcione:')
  console.log('      npx tsx scripts/verificar-database.ts')
  console.log('')
}

arreglarDatabase()
