/**
 * 🔍 VERIFICACIÓN DEL SISTEMA PARA EASYPANEL
 * 
 * Verifica que todo esté listo para deploy en Easypanel
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO SISTEMA PARA EASYPANEL\n');
console.log('='.repeat(60));

let todoBien = true;
const problemas = [];
const advertencias = [];

// 1. Verificar archivos críticos
console.log('\n1️⃣ Verificando archivos críticos...');

const archivosCriticos = [
    'src/lib/groq-api-rotator.ts',
    'src/lib/intelligent-product-search.ts',
    'src/lib/baileys-stable-service.ts',
    'src/lib/media-service.ts',
    'package.json',
    'next.config.ts',
    'prisma/schema.prisma'
];

archivosCriticos.forEach(archivo => {
    const existe = fs.existsSync(path.join(process.cwd(), archivo));
    if (existe) {
        console.log(`   ✅ ${archivo}`);
    } else {
        console.log(`   ❌ ${archivo} - NO ENCONTRADO`);
        problemas.push(`Archivo faltante: ${archivo}`);
        todoBien = false;
    }
});

// 2. Verificar que el rotador esté configurado
console.log('\n2️⃣ Verificando configuración del rotador...');

try {
    const rotatorPath = path.join(process.cwd(), 'src/lib/groq-api-rotator.ts');
    const rotatorContent = fs.readFileSync(rotatorPath, 'utf8');
    
    // Contar APIs configuradas
    const apiMatches = rotatorContent.match(/apiKey: 'gsk_/g);
    const numApis = apiMatches ? apiMatches.length : 0;
    
    console.log(`   📊 APIs configuradas: ${numApis}`);
    
    if (numApis >= 8) {
        console.log(`   ✅ ${numApis} APIs configuradas (óptimo)`);
    } else if (numApis >= 4) {
        console.log(`   ⚠️  ${numApis} APIs configuradas (funcional, pero recomendado 8+)`);
        advertencias.push(`Solo ${numApis} APIs configuradas. Recomendado: 8+`);
    } else {
        console.log(`   ❌ Solo ${numApis} APIs configuradas (insuficiente)`);
        problemas.push(`Insuficientes APIs: ${numApis}. Mínimo recomendado: 4`);
        todoBien = false;
    }
    
    // Verificar modelos
    const modelMatches = rotatorContent.match(/name: 'llama-|name: 'mixtral-|name: 'gemma/g);
    const numModels = modelMatches ? modelMatches.length : 0;
    
    console.log(`   📊 Modelos configurados: ${numModels}`);
    
    if (numModels >= 4) {
        console.log(`   ✅ ${numModels} modelos configurados`);
    } else {
        console.log(`   ⚠️  Solo ${numModels} modelos configurados`);
        advertencias.push(`Solo ${numModels} modelos. Recomendado: 4+`);
    }
    
} catch (error) {
    console.log(`   ❌ Error leyendo rotador: ${error.message}`);
    problemas.push('No se pudo verificar configuración del rotador');
    todoBien = false;
}

// 3. Verificar integración
console.log('\n3️⃣ Verificando integración...');

try {
    const searchPath = path.join(process.cwd(), 'src/lib/intelligent-product-search.ts');
    const searchContent = fs.readFileSync(searchPath, 'utf8');
    
    if (searchContent.includes('GroqAPIRotator')) {
        console.log('   ✅ Búsqueda inteligente usa el rotador');
    } else {
        console.log('   ❌ Búsqueda inteligente NO usa el rotador');
        problemas.push('intelligent-product-search.ts no está usando GroqAPIRotator');
        todoBien = false;
    }
    
    if (searchContent.includes('makeRequest')) {
        console.log('   ✅ Método makeRequest implementado');
    } else {
        console.log('   ⚠️  Método makeRequest no encontrado');
        advertencias.push('Verificar implementación de makeRequest');
    }
    
} catch (error) {
    console.log(`   ❌ Error verificando integración: ${error.message}`);
    problemas.push('No se pudo verificar integración');
    todoBien = false;
}

// 4. Verificar package.json
console.log('\n4️⃣ Verificando package.json...');

try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Scripts necesarios
    const scriptsNecesarios = ['build', 'start', 'dev'];
    scriptsNecesarios.forEach(script => {
        if (packageJson.scripts && packageJson.scripts[script]) {
            console.log(`   ✅ Script "${script}" configurado`);
        } else {
            console.log(`   ❌ Script "${script}" faltante`);
            problemas.push(`Script faltante en package.json: ${script}`);
            todoBien = false;
        }
    });
    
    // Dependencias críticas
    const depsNecesarias = ['groq-sdk', '@prisma/client', 'next'];
    depsNecesarias.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
            console.log(`   ✅ Dependencia "${dep}" instalada`);
        } else {
            console.log(`   ❌ Dependencia "${dep}" faltante`);
            problemas.push(`Dependencia faltante: ${dep}`);
            todoBien = false;
        }
    });
    
} catch (error) {
    console.log(`   ❌ Error leyendo package.json: ${error.message}`);
    problemas.push('No se pudo verificar package.json');
    todoBien = false;
}

// 5. Verificar variables de entorno
console.log('\n5️⃣ Verificando variables de entorno...');

const varsRequeridas = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
const varsOpcionales = ['VOICE_ENABLED', 'MERCADOPAGO_ACCESS_TOKEN'];

varsRequeridas.forEach(varName => {
    if (process.env[varName]) {
        console.log(`   ✅ ${varName} configurada`);
    } else {
        console.log(`   ⚠️  ${varName} NO configurada (requerida en Easypanel)`);
        advertencias.push(`Variable faltante: ${varName} (configúrala en Easypanel)`);
    }
});

// Verificar que NO esté usando GROQ_API_KEY
if (process.env.GROQ_API_KEY) {
    console.log('   ⚠️  GROQ_API_KEY encontrada (ya no es necesaria)');
    advertencias.push('GROQ_API_KEY ya no es necesaria. El sistema usa 8 APIs internas.');
} else {
    console.log('   ✅ GROQ_API_KEY no configurada (correcto - usa rotador)');
}

// Resumen final
console.log('\n' + '='.repeat(60));

if (todoBien && problemas.length === 0) {
    console.log('\n✅ SISTEMA LISTO PARA EASYPANEL\n');
    console.log('Todo está configurado correctamente.');
    console.log('Puedes hacer deploy sin problemas.\n');
    
    if (advertencias.length > 0) {
        console.log('⚠️  Advertencias (no críticas):');
        advertencias.forEach((adv, idx) => {
            console.log(`   ${idx + 1}. ${adv}`);
        });
        console.log('');
    }
    
    console.log('📋 Próximos pasos:');
    console.log('   1. Commit y push a GitHub');
    console.log('   2. Conecta repo en Easypanel');
    console.log('   3. Configura variables de entorno');
    console.log('   4. Deploy automático\n');
    
} else {
    console.log('\n❌ HAY PROBLEMAS QUE RESOLVER\n');
    
    if (problemas.length > 0) {
        console.log('🚨 Problemas críticos:');
        problemas.forEach((prob, idx) => {
            console.log(`   ${idx + 1}. ${prob}`);
        });
        console.log('');
    }
    
    if (advertencias.length > 0) {
        console.log('⚠️  Advertencias:');
        advertencias.forEach((adv, idx) => {
            console.log(`   ${idx + 1}. ${adv}`);
        });
        console.log('');
    }
    
    console.log('Resuelve los problemas antes de hacer deploy.\n');
}

// Información adicional
console.log('═'.repeat(60));
console.log('\n📚 Documentación:');
console.log('   • DEPLOY_EASYPANEL_ROTACION.md - Guía completa de deploy');
console.log('   • VARIABLES_EASYPANEL_ACTUALIZADAS.txt - Variables requeridas');
console.log('   • SISTEMA_ROTACION_APIS.md - Documentación del sistema\n');

console.log('═'.repeat(60));

process.exit(todoBien ? 0 : 1);
