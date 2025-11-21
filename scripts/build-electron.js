const { build } = require('electron-builder');
const fs = require('fs-extra');
const path = require('path');

async function buildElectronApp() {
  console.log('🚀 Construyendo Smart Sales Bot Pro para escritorio...\n');

  try {
    // 1. Limpiar directorios anteriores
    console.log('🧹 Limpiando builds anteriores...');
    await fs.remove('dist-electron');
    
    // 2. Construir Next.js
    console.log('📦 Construyendo aplicación Next.js...');
    const { execSync } = require('child_process');
    execSync('npm run build', { stdio: 'inherit' });
    
    // 3. Construir servidor
    console.log('🔧 Compilando servidor TypeScript...');
    execSync('npm run build:server', { stdio: 'inherit' });
    
    // 4. Copiar archivos necesarios
    console.log('📋 Copiando archivos...');
    await fs.copy('.env.example', 'dist/.env.example');
    await fs.copy('prisma', 'dist/prisma');
    
    // 5. Construir con electron-builder
    console.log('🔨 Construyendo ejecutables...');
    
    const platform = process.platform;
    let targets;
    
    if (platform === 'win32') {
      targets = ['nsis', 'portable'];
    } else if (platform === 'darwin') {
      targets = ['dmg', 'zip'];
    } else {
      targets = ['AppImage', 'deb'];
    }
    
    await build({
      targets: require('electron-builder').Platform.current().createTarget(targets),
      config: require('../electron-builder.json')
    });
    
    console.log('\n✅ Build completado exitosamente!');
    console.log('📁 Los instaladores están en: dist-electron/');
    
    // Mostrar archivos generados
    const files = await fs.readdir('dist-electron');
    console.log('\n📦 Archivos generados:');
    files.forEach(file => {
      const stats = fs.statSync(path.join('dist-electron', file));
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`   - ${file} (${sizeMB} MB)`);
    });
    
  } catch (error) {
    console.error('❌ Error durante el build:', error);
    process.exit(1);
  }
}

buildElectronApp();
