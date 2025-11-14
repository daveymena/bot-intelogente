/**
 * Agregar comandos de entrenamiento al package.json
 */

const fs = require('fs');
const path = require('path');

const packagePath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

// Agregar nuevos comandos
const newCommands = {
  "train:quick": "npx tsx scripts/entrenar-rapido.ts",
  "train:full": "npx tsx scripts/entrenar-conversaciones-completas.ts",
  "train:test": "npx tsx scripts/test-sin-tokens.ts",
  "knowledge:export": "npx tsx scripts/exportar-conocimiento.ts",
  "knowledge:import": "IMPORT_MODE=add npx tsx scripts/importar-conocimiento.ts",
  "knowledge:replace": "IMPORT_MODE=replace npx tsx scripts/importar-conocimiento.ts"
};

// Agregar comandos si no existen
let added = 0;
for (const [key, value] of Object.entries(newCommands)) {
  if (!packageJson.scripts[key]) {
    packageJson.scripts[key] = value;
    added++;
    console.log(`✅ Agregado: ${key}`);
  } else {
    console.log(`⏭️  Ya existe: ${key}`);
  }
}

if (added > 0) {
  // Guardar package.json
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
  console.log(`\n✅ ${added} comandos agregados a package.json\n`);
  
  console.log('📝 Nuevos comandos disponibles:');
  console.log('  npm run train:quick  - Entrenamiento rápido (10 productos)');
  console.log('  npm run train:full   - Entrenamiento completo (todos los productos)');
  console.log('  npm run train:test   - Test sin tokens de IA\n');
} else {
  console.log('\n✅ Todos los comandos ya están en package.json\n');
}
