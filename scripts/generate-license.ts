import LicenseService from '../src/lib/license-service';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log('\n🔐 GENERADOR DE LICENCIAS - Smart Sales Bot Pro\n');
  console.log('='.repeat(60));

  try {
    // Solicitar datos
    const email = await question('\n📧 Email del cliente: ');
    
    console.log('\n📦 Tipos de licencia disponibles:');
    console.log('  1. trial    - 10 días de prueba');
    console.log('  2. monthly  - 1 mes');
    console.log('  3. yearly   - 1 año');
    console.log('  4. lifetime - Permanente');
    
    const typeInput = await question('\nSelecciona tipo (1-4): ');
    const types = ['trial', 'monthly', 'yearly', 'lifetime'];
    const type = types[parseInt(typeInput) - 1] as 'trial' | 'monthly' | 'yearly' | 'lifetime';

    if (!type) {
      console.error('❌ Tipo de licencia inválido');
      rl.close();
      return;
    }

    const bindToMachine = await question('\n🖥️  ¿Vincular a una máquina específica? (s/n): ');
    let machineId: string | undefined;

    if (bindToMachine.toLowerCase() === 's') {
      machineId = await question('   ID de máquina: ');
    }

    // Generar licencia
    console.log('\n⏳ Generando licencia...\n');
    
    const licenseKey = LicenseService.generateLicenseKey(email, type, machineId);

    // Mostrar resultado
    console.log('='.repeat(60));
    console.log('\n✅ LICENCIA GENERADA EXITOSAMENTE\n');
    console.log('='.repeat(60));
    console.log(`\n📧 Email:        ${email}`);
    console.log(`📦 Tipo:         ${type.toUpperCase()}`);
    console.log(`🔑 Clave:        ${licenseKey}`);
    
    if (machineId) {
      console.log(`🖥️  Machine ID:   ${machineId}`);
      console.log('   (Vinculada a máquina específica)');
    } else {
      console.log('🖥️  Machine ID:   ANY (Cualquier máquina)');
    }

    // Calcular duración
    let duration = '';
    switch (type) {
      case 'trial':
        duration = '10 días';
        break;
      case 'monthly':
        duration = '1 mes';
        break;
      case 'yearly':
        duration = '1 año';
        break;
      case 'lifetime':
        duration = 'Permanente';
        break;
    }
    console.log(`⏱️  Duración:     ${duration}`);

    console.log('\n' + '='.repeat(60));
    console.log('\n📋 INSTRUCCIONES PARA EL CLIENTE:\n');
    console.log('1. Abre la aplicación Smart Sales Bot Pro');
    console.log('2. Ve a la sección "Activar Licencia"');
    console.log('3. Ingresa la clave de licencia y tu email');
    console.log('4. Haz clic en "Activar Licencia"');
    console.log('\n' + '='.repeat(60) + '\n');

    // Guardar en archivo
    const saveToFile = await question('💾 ¿Guardar en archivo? (s/n): ');
    
    if (saveToFile.toLowerCase() === 's') {
      const fs = await import('fs');
      const path = await import('path');
      
      const licensesDir = path.join(process.cwd(), 'licenses');
      if (!fs.existsSync(licensesDir)) {
        fs.mkdirSync(licensesDir);
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `license_${email.replace('@', '_at_')}_${timestamp}.txt`;
      const filepath = path.join(licensesDir, filename);

      const content = `
LICENCIA - Smart Sales Bot Pro
================================

Email:        ${email}
Tipo:         ${type.toUpperCase()}
Clave:        ${licenseKey}
Machine ID:   ${machineId || 'ANY'}
Duración:     ${duration}
Generada:     ${new Date().toLocaleString()}

================================

INSTRUCCIONES:
1. Abre la aplicación Smart Sales Bot Pro
2. Ve a la sección "Activar Licencia"
3. Ingresa la clave de licencia y tu email
4. Haz clic en "Activar Licencia"

Soporte: soporte@tecnovariedades.com
`;

      fs.writeFileSync(filepath, content, 'utf8');
      console.log(`\n✅ Guardado en: ${filepath}\n`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    rl.close();
  }
}

main();
