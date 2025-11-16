import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 🔌 CERRAR PUERTO 4000
 * Cierra cualquier proceso usando el puerto 4000
 */

async function cerrarPuerto() {
  console.log('🔌 CERRANDO PUERTO 4000\n');
  console.log('='.repeat(60));

  try {
    // Buscar procesos en el puerto 4000
    const { stdout } = await execAsync('netstat -ano | findstr :4000');
    
    if (!stdout) {
      console.log('✅ Puerto 4000 ya está libre');
      return;
    }

    console.log('📋 Procesos encontrados:');
    console.log(stdout);

    // Extraer PIDs únicos
    const lines = stdout.split('\n').filter(line => line.includes('LISTENING'));
    const pids = new Set<string>();

    for (const line of lines) {
      const match = line.match(/\s+(\d+)\s*$/);
      if (match) {
        pids.add(match[1]);
      }
    }

    if (pids.size === 0) {
      console.log('✅ No hay procesos LISTENING en puerto 4000');
      return;
    }

    console.log(`\n🔪 Cerrando ${pids.size} proceso(s)...`);

    // Cerrar cada proceso
    for (const pid of pids) {
      try {
        await execAsync(`taskkill /F /PID ${pid}`);
        console.log(`✅ Proceso ${pid} cerrado`);
      } catch (error: any) {
        console.log(`⚠️  No se pudo cerrar proceso ${pid}: ${error.message}`);
      }
    }

    // Esperar un momento para que se libere el puerto
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verificar que el puerto esté libre
    try {
      const { stdout: checkStdout } = await execAsync('netstat -ano | findstr :4000');
      const stillListening = checkStdout.split('\n').filter(line => line.includes('LISTENING'));
      
      if (stillListening.length === 0) {
        console.log('\n✅ Puerto 4000 liberado exitosamente');
      } else {
        console.log('\n⚠️  Aún hay procesos en el puerto (pueden ser TIME_WAIT)');
        console.log('   Espera 30 segundos o reinicia el sistema');
      }
    } catch {
      console.log('\n✅ Puerto 4000 liberado exitosamente');
    }

  } catch (error: any) {
    if (error.message.includes('Command failed')) {
      console.log('✅ Puerto 4000 ya está libre');
    } else {
      console.error('❌ Error:', error.message);
    }
  }

  console.log('\n✅ Listo para iniciar el bot\n');
}

cerrarPuerto().catch(console.error);
