import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 🚀 INICIAR DEV LIMPIO
 * Cierra puerto 4000 y luego inicia el bot
 */

async function devLimpio() {
  console.log('🚀 INICIANDO BOT (MODO LIMPIO)\n');
  console.log('='.repeat(60));

  // 1. Cerrar puerto 4000
  console.log('1️⃣ Cerrando puerto 4000...');
  
  try {
    const { stdout } = await execAsync('netstat -ano | findstr :4000');
    const lines = stdout.split('\n').filter(line => line.includes('LISTENING'));
    const pids = new Set<string>();

    for (const line of lines) {
      const match = line.match(/\s+(\d+)\s*$/);
      if (match) {
        pids.add(match[1]);
      }
    }

    if (pids.size > 0) {
      console.log(`   Cerrando ${pids.size} proceso(s)...`);
      
      for (const pid of pids) {
        try {
          await execAsync(`taskkill /F /PID ${pid}`);
          console.log(`   ✅ Proceso ${pid} cerrado`);
        } catch (error: any) {
          console.log(`   ⚠️  Error cerrando ${pid}`);
        }
      }

      // Esperar que se libere
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log('   ✅ Puerto ya está libre');
    }
  } catch {
    console.log('   ✅ Puerto ya está libre');
  }

  // 2. Iniciar bot
  console.log('\n2️⃣ Iniciando bot...');
  console.log('='.repeat(60));
  console.log('');

  // Ejecutar npm run dev
  const child = exec('npm run dev', {
    cwd: process.cwd()
  });

  // Mostrar output en tiempo real
  child.stdout?.on('data', (data) => {
    process.stdout.write(data);
  });

  child.stderr?.on('data', (data) => {
    process.stderr.write(data);
  });

  child.on('exit', (code) => {
    console.log(`\n\n🛑 Bot detenido (código: ${code})`);
    process.exit(code || 0);
  });

  // Manejar Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Deteniendo bot...');
    child.kill('SIGINT');
  });
}

devLimpio().catch(console.error);
