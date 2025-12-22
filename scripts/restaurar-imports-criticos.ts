/**
 * Script de Emergencia: Restaurar Imports Críticos
 * Usa este script si el autofix elimina los imports del sistema híbrido
 */

import fs from 'fs';
import path from 'path';

const ENGINE_FILE = path.join(process.cwd(), 'src/lib/intelligent-conversation-engine.ts');

const CRITICAL_IMPORTS = `
// ⚠️ CRITICAL IMPORTS - DO NOT REMOVE BY AUTOFIX
// Sistema híbrido local/IA - Permite funcionar sin tokens en 80% de casos
import { ProductScorer } from './product-scorer';
import { DynamicProductIntelligence } from './dynamic-product-intelligence';
import { ResponseValidator } from './response-validator';
// ⚠️ END CRITICAL IMPORTS
`;

async function restaurarImports() {
  console.log('🔧 Restaurando imports críticos...\n');

  try {
    // Leer archivo actual
    let content = fs.readFileSync(ENGINE_FILE, 'utf-8');

    // Verificar si ya están presentes
    if (content.includes('ProductScorer') && 
        content.includes('DynamicProductIntelligence') && 
        content.includes('ResponseValidator')) {
      console.log('✅ Los imports ya están presentes');
      console.log('✅ No se necesita restauración');
      return;
    }

    console.log('⚠️  Imports faltantes detectados');
    console.log('📝 Restaurando...\n');

    // Buscar la línea después de los imports existentes
    const ollamaImportLine = "import { OllamaService } from './ollama-service';";
    
    if (!content.includes(ollamaImportLine)) {
      console.error('❌ No se encontró la línea de referencia');
      console.error('❌ El archivo puede estar corrupto');
      return;
    }

    // Insertar los imports críticos después de OllamaService
    content = content.replace(
      ollamaImportLine,
      ollamaImportLine + CRITICAL_IMPORTS
    );

    // Guardar archivo
    fs.writeFileSync(ENGINE_FILE, content, 'utf-8');

    console.log('✅ Imports restaurados exitosamente');
    console.log('\n📋 Imports agregados:');
    console.log('   - ProductScorer');
    console.log('   - DynamicProductIntelligence');
    console.log('   - ResponseValidator');
    console.log('\n🚀 Reinicia el bot con: npm run dev');

  } catch (error) {
    console.error('❌ Error al restaurar imports:', error);
    console.error('\n💡 Solución manual:');
    console.error('   1. Abre: src/lib/intelligent-conversation-engine.ts');
    console.error('   2. Después de la línea: import { OllamaService } from \'./ollama-service\';');
    console.error('   3. Agrega estos imports:');
    console.error(CRITICAL_IMPORTS);
  }
}

// Ejecutar
restaurarImports();
