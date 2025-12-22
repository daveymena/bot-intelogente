import LicenseService from '../src/lib/license-service';

async function main() {
  console.log('\n🔐 VERIFICACIÓN DE LICENCIA\n');
  console.log('='.repeat(60));

  try {
    const licenseService = LicenseService.getInstance();
    const licenseCheck = await licenseService.checkLicense();
    const licenseInfo = licenseService.getLicenseInfo();
    const machineId = LicenseService.getMachineId();

    console.log('\n📊 ESTADO ACTUAL:\n');
    
    if (licenseCheck.valid) {
      console.log('✅ Estado: VÁLIDA');
      console.log(`📦 Tipo: ${licenseCheck.type?.toUpperCase()}`);
      
      if (licenseCheck.daysRemaining) {
        console.log(`⏱️  Días restantes: ${licenseCheck.daysRemaining}`);
      }

      if (licenseInfo) {
        console.log(`📧 Email: ${licenseInfo.email}`);
        console.log(`🔑 Clave: ${licenseInfo.key}`);
        console.log(`📅 Expira: ${new Date(licenseInfo.expiresAt).toLocaleString('es-CO')}`);
        console.log(`🎯 Características:`);
        licenseInfo.features.forEach(feature => {
          console.log(`   - ${feature}`);
        });
      }
    } else {
      console.log('❌ Estado: INVÁLIDA O EXPIRADA');
      console.log(`📝 Mensaje: ${licenseCheck.message}`);
    }

    console.log(`\n🖥️  Machine ID: ${machineId}`);
    console.log('\n' + '='.repeat(60));

    if (!licenseCheck.valid) {
      console.log('\n💡 ACCIONES DISPONIBLES:\n');
      console.log('1. Iniciar período de prueba:');
      console.log('   npm run dev');
      console.log('   Visita: http://localhost:3000/activate-license');
      console.log('   Clic en "Iniciar Prueba Gratuita"\n');
      console.log('2. Activar licencia:');
      console.log('   npm run dev');
      console.log('   Visita: http://localhost:3000/activate-license');
      console.log('   Ingresa tu código de licencia\n');
      console.log('3. Generar nueva licencia (admin):');
      console.log('   npm run license:generate\n');
    } else if (licenseCheck.daysRemaining && licenseCheck.daysRemaining <= 7) {
      console.log('\n⚠️  ADVERTENCIA: Tu licencia expira pronto!');
      console.log('   Renueva tu suscripción para continuar usando el sistema.\n');
    }

  } catch (error) {
    console.error('\n❌ Error al verificar licencia:', error);
  }
}

main();
