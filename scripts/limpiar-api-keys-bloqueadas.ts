import Groq from 'groq-sdk';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * 🧹 LIMPIAR API KEYS BLOQUEADAS
 * Prueba todas las keys de Groq y elimina las que no funcionan
 */

async function limpiarApiKeys() {
  console.log('🧹 LIMPIANDO API KEYS DE GROQ\n');
  console.log('='.repeat(60));

  // Leer .env
  const envPath = join(process.cwd(), '.env');
  let envContent = readFileSync(envPath, 'utf-8');

  // Extraer todas las keys
  const keys: { name: string; value: string; line: string }[] = [];
  
  for (let i = 1; i <= 8; i++) {
    const keyName = i === 1 ? 'GROQ_API_KEY' : `GROQ_API_KEY_${i}`;
    const regex = new RegExp(`^${keyName}=(.+)$`, 'm');
    const match = envContent.match(regex);
    
    if (match) {
      keys.push({
        name: keyName,
        value: match[1].trim(),
        line: match[0]
      });
    }
  }

  console.log(`📋 ${keys.length} API keys encontradas\n`);

  const keysValidas: typeof keys = [];
  const keysBloqueadas: typeof keys = [];

  // Probar cada key
  for (const key of keys) {
    process.stdout.write(`🔍 Probando ${key.name}... `);

    try {
      const groq = new Groq({ apiKey: key.value });
      
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'user', content: 'Hola' }
        ],
        max_tokens: 10,
        temperature: 0.5
      });

      if (completion.choices[0]?.message?.content) {
        console.log('✅ FUNCIONA');
        keysValidas.push(key);
      } else {
        console.log('❌ Sin respuesta');
        keysBloqueadas.push(key);
      }

    } catch (error: any) {
      if (error.status === 401) {
        console.log('❌ BLOQUEADA (401 Unauthorized)');
        keysBloqueadas.push(key);
      } else if (error.status === 400 && error.message?.includes('organization_restricted')) {
        console.log('❌ ORGANIZACIÓN RESTRINGIDA');
        keysBloqueadas.push(key);
      } else if (error.status === 429) {
        console.log('⚠️  Rate limit (pero funciona)');
        keysValidas.push(key); // Rate limit significa que la key funciona
      } else {
        console.log(`❌ ERROR: ${error.message}`);
        keysBloqueadas.push(key); // Cualquier otro error, eliminar
      }
    }

    // Esperar un poco entre requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Resumen
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN\n');
  console.log(`✅ Keys válidas: ${keysValidas.length}`);
  console.log(`❌ Keys bloqueadas: ${keysBloqueadas.length}`);

  if (keysBloqueadas.length === 0) {
    console.log('\n🎉 Todas las keys funcionan correctamente\n');
    return;
  }

  // Eliminar keys bloqueadas del .env
  console.log('\n🗑️  Eliminando keys bloqueadas del .env...\n');

  for (const key of keysBloqueadas) {
    console.log(`   ❌ Eliminando ${key.name}`);
    envContent = envContent.replace(key.line + '\n', '');
  }

  // Guardar .env actualizado
  writeFileSync(envPath, envContent);

  console.log('\n✅ .env actualizado');
  console.log(`\n📝 Keys restantes: ${keysValidas.length}`);
  
  if (keysValidas.length > 0) {
    console.log('\n✅ Tienes suficientes keys para continuar');
  } else {
    console.log('\n⚠️  NO QUEDAN KEYS VÁLIDAS');
    console.log('   Necesitas agregar nuevas API keys de Groq');
    console.log('   Obtén keys en: https://console.groq.com/keys');
  }

  console.log('\n🔄 Reinicia el bot para aplicar cambios\n');
}

limpiarApiKeys().catch(console.error);
