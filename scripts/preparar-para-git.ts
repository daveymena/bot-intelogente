/**
 * Script para preparar el proyecto antes de subir a Git
 * - Verifica archivos sensibles
 * - Limpia archivos temporales
 * - Genera reporte
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface PreparacionResult {
  archivosSensibles: string[];
  archivosTemporales: string[];
  gitignoreOk: boolean;
  warnings: string[];
  ready: boolean;
}

function verificarArchivosSensibles(): string[] {
  console.log('🔒 Verificando archivos sensibles...\n');

  const sensibles = [
    '.env',
    '.env.local',
    'auth_sessions/',
    'node_modules/',
  ];

  const encontrados: string[] = [];

  sensibles.forEach(archivo => {
    if (fs.existsSync(archivo)) {
      encontrados.push(archivo);
    }
  });

  console.log(`   Archivos sensibles encontrados: ${encontrados.length}`);
  encontrados.forEach(f => console.log(`   - ${f}`));
  console.log();

  return encontrados;
}

function verificarGitignore(): boolean {
  console.log('📝 Verificando .gitignore...\n');

  if (!fs.existsSync('.gitignore')) {
    console.log('   ❌ .gitignore no existe!\n');
    return false;
  }

  const gitignore = fs.readFileSync('.gitignore', 'utf-8');

  const requeridos = [
    '.env',
    '.env.local',
    'node_modules',
    'auth_sessions',
    '*.db',
    '*.db-journal',
  ];

  const faltantes: string[] = [];

  requeridos.forEach(req => {
    if (!gitignore.includes(req)) {
      faltantes.push(req);
    }
  });

  if (faltantes.length > 0) {
    console.log('   ⚠️  Faltan en .gitignore:');
    faltantes.forEach(f => console.log(`   - ${f}`));
    console.log();
    return false;
  }

  console.log('   ✅ .gitignore está completo\n');
  return true;
}

function limpiarArchivosTemporales(): string[] {
  console.log('🧹 Limpiando archivos temporales...\n');

  const temporales = [
    'auditoria-sistema.json',
    'scripts/reporte-fotos.json',
    'scripts/disyvar-productos.json',
    'scripts/smartjoys-productos.json',
    'scripts/dropi-productos.json',
  ];

  const eliminados: string[] = [];

  temporales.forEach(archivo => {
    if (fs.existsSync(archivo)) {
      try {
        fs.unlinkSync(archivo);
        eliminados.push(archivo);
        console.log(`   ✅ Eliminado: ${archivo}`);
      } catch (error) {
        console.log(`   ⚠️  No se pudo eliminar: ${archivo}`);
      }
    }
  });

  if (eliminados.length === 0) {
    console.log('   ✅ No hay archivos temporales');
  }

  console.log();
  return eliminados;
}

function verificarGitStatus(): string[] {
  console.log('📊 Verificando estado de Git...\n');

  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    const archivos = status.split('\n').filter(Boolean);

    console.log(`   Archivos modificados: ${archivos.length}`);

    if (archivos.length > 0) {
      console.log('\n   Cambios pendientes:');
      archivos.slice(0, 10).forEach(f => console.log(`   ${f}`));
      if (archivos.length > 10) {
        console.log(`   ... y ${archivos.length - 10} más`);
      }
    }

    console.log();
    return archivos;
  } catch (error) {
    console.log('   ⚠️  No es un repositorio Git o Git no está instalado\n');
    return [];
  }
}

function generarReporte(resultado: PreparacionResult) {
  const reporte = {
    fecha: new Date().toISOString(),
    ...resultado,
  };

  fs.writeFileSync('preparacion-git.json', JSON.stringify(reporte, null, 2));
  console.log('💾 Reporte guardado en: preparacion-git.json\n');
}

function main() {
  console.log('🚀 PREPARACIÓN PARA GIT\n');
  console.log('='.repeat(60) + '\n');

  const resultado: PreparacionResult = {
    archivosSensibles: verificarArchivosSensibles(),
    archivosTemporales: limpiarArchivosTemporales(),
    gitignoreOk: verificarGitignore(),
    warnings: [],
    ready: true,
  };

  const cambios = verificarGitStatus();

  // Generar warnings
  if (!resultado.gitignoreOk) {
    resultado.warnings.push('Actualizar .gitignore');
    resultado.ready = false;
  }

  if (resultado.archivosSensibles.some(f => !f.includes('node_modules'))) {
    resultado.warnings.push('Verificar que archivos sensibles estén en .gitignore');
  }

  console.log('='.repeat(60));
  console.log('\n📊 RESUMEN:\n');
  console.log(`   Archivos sensibles: ${resultado.archivosSensibles.length}`);
  console.log(`   Archivos temporales eliminados: ${resultado.archivosTemporales.length}`);
  console.log(`   .gitignore: ${resultado.gitignoreOk ? '✅' : '❌'}`);
  console.log(`   Cambios pendientes: ${cambios.length}`);

  if (resultado.warnings.length > 0) {
    console.log('\n⚠️  ADVERTENCIAS:\n');
    resultado.warnings.forEach((w, i) => {
      console.log(`   ${i + 1}. ${w}`);
    });
  }

  console.log();

  if (resultado.ready) {
    console.log('✅ ¡Listo para subir a Git!\n');
    console.log('Comandos sugeridos:\n');
    console.log('   git add .');
    console.log('   git commit -m "feat: Sistema completo con scraper de fotos"');
    console.log('   git push\n');
  } else {
    console.log('⚠️  Revisa las advertencias antes de subir a Git\n');
  }

  generarReporte(resultado);
}

main();
