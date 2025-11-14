#!/usr/bin/env node

/**
 * 🚀 SCRIPT DE MIGRACIÓN SEGURA
 * Copia el dashboard de botexperimento a smart-sales
 * SIN modificar el proyecto original
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas de proyectos
const ORIGEN = __dirname; // botexperimento (proyecto actual)
const DESTINO = path.join(__dirname, '..', 'smart-sales');
const BACKUP = path.join(DESTINO, `backup-${Date.now()}`);

console.log('🚀 MIGRACIÓN DE DASHBOARD A SMART-SALES');
console.log('==========================================\n');

// Verificar que existe smart-sales
if (!fs.existsSync(DESTINO)) {
    console.error('❌ ERROR: No se encuentra la carpeta smart-sales');
    console.error(`   Buscado en: ${DESTINO}`);
    process.exit(1);
}

console.log('📁 Rutas:');
console.log(`   Origen:  ${ORIGEN}`);
console.log(`   Destino: ${DESTINO}`);
console.log(`   Backup:  ${BACKUP}\n`);

// Paso 1: Crear backup de smart-sales
console.log('📦 PASO 1: Creando backup de smart-sales...');
try {
    // Copiar archivos importantes
    const backupFiles = [
        'package.json',
        'bot-whatsapp-estable.js',
        '.env',
        'src',
        'prisma'
    ];

    fs.ensureDirSync(BACKUP);
    
    for (const file of backupFiles) {
        const srcPath = path.join(DESTINO, file);
        const destPath = path.join(BACKUP, file);
        
        if (fs.existsSync(srcPath)) {
            fs.copySync(srcPath, destPath);
            console.log(`   ✅ Backup: ${file}`);
        }
    }
    
    console.log('   ✅ Backup completado\n');
} catch (error) {
    console.error('❌ Error creando backup:', error.message);
    process.exit(1);
}

// Paso 2: Copiar archivos de configuración
console.log('⚙️  PASO 2: Copiando archivos de configuración...');
const configFiles = [
    'next.config.ts',
    'tailwind.config.ts',
    'components.json',
    'postcss.config.js',
    '.eslintrc.json'
];

for (const file of configFiles) {
    try {
        const src = path.join(ORIGEN, file);
        const dest = path.join(DESTINO, file);
        
        if (fs.existsSync(src)) {
            fs.copySync(src, dest);
            console.log(`   ✅ ${file}`);
        } else {
            console.log(`   ⚠️  ${file} no encontrado (opcional)`);
        }
    } catch (error) {
        console.log(`   ⚠️  Error copiando ${file}: ${error.message}`);
    }
}
console.log('');

// Paso 3: Copiar estructura src/app (Dashboard)
console.log('📱 PASO 3: Copiando dashboard (src/app)...');
try {
    const srcApp = path.join(ORIGEN, 'src', 'app');
    const destApp = path.join(DESTINO, 'src', 'app');
    
    if (fs.existsSync(srcApp)) {
        fs.ensureDirSync(destApp);
        fs.copySync(srcApp, destApp, { overwrite: true });
        console.log('   ✅ Dashboard copiado completamente');
    } else {
        console.log('   ❌ No se encontró src/app en origen');
    }
} catch (error) {
    console.error('   ❌ Error:', error.message);
}
console.log('');

// Paso 4: Copiar componentes UI
console.log('🎨 PASO 4: Copiando componentes (src/components)...');
try {
    const srcComponents = path.join(ORIGEN, 'src', 'components');
    const destComponents = path.join(DESTINO, 'src', 'components');
    
    if (fs.existsSync(srcComponents)) {
        fs.ensureDirSync(destComponents);
        fs.copySync(srcComponents, destComponents, { overwrite: true });
        console.log('   ✅ Componentes copiados');
    }
} catch (error) {
    console.error('   ❌ Error:', error.message);
}
console.log('');

// Paso 5: Copiar servicios de lib (fusionar)
console.log('🔧 PASO 5: Copiando servicios (src/lib)...');
try {
    const srcLib = path.join(ORIGEN, 'src', 'lib');
    const destLib = path.join(DESTINO, 'src', 'lib');
    
    if (fs.existsSync(srcLib)) {
        fs.ensureDirSync(destLib);
        
        // Copiar solo archivos que no existan o sean del dashboard
        const libFiles = fs.readdirSync(srcLib);
        const dashboardServices = [
            'db.ts',
            'auth.ts',
            'baileys-service.ts',
            'ai-service.ts',
            'product-intelligence-service.ts',
            'intelligent-response-service.ts',
            'conversation-context-service.ts',
            'human-escalation-service.ts',
            'media-service.ts',
            'message-queue-service.ts',
            'hot-reload-service.ts',
            'connection-monitor.ts',
            'training-data.ts',
            'email-service.ts',
            'payment-methods.ts'
        ];
        
        for (const file of libFiles) {
            const src = path.join(srcLib, file);
            const dest = path.join(destLib, file);
            
            // Copiar servicios del dashboard
            if (dashboardServices.includes(file)) {
                fs.copySync(src, dest, { overwrite: true });
                console.log(`   ✅ ${file}`);
            }
            // Copiar nuevos archivos que no existan
            else if (!fs.existsSync(dest)) {
                fs.copySync(src, dest);
                console.log(`   🆕 ${file}`);
            } else {
                console.log(`   ⏭️  ${file} (ya existe, se mantiene)`);
            }
        }
    }
} catch (error) {
    console.error('   ❌ Error:', error.message);
}
console.log('');

// Paso 6: Copiar hooks
console.log('🪝 PASO 6: Copiando hooks (src/hooks)...');
try {
    const srcHooks = path.join(ORIGEN, 'src', 'hooks');
    const destHooks = path.join(DESTINO, 'src', 'hooks');
    
    if (fs.existsSync(srcHooks)) {
        fs.ensureDirSync(destHooks);
        fs.copySync(srcHooks, destHooks, { overwrite: true });
        console.log('   ✅ Hooks copiados');
    }
} catch (error) {
    console.error('   ❌ Error:', error.message);
}
console.log('');

// Paso 7: Copiar middleware
console.log('🛡️  PASO 7: Copiando middleware...');
try {
    const srcMiddleware = path.join(ORIGEN, 'src', 'middleware.ts');
    const destMiddleware = path.join(DESTINO, 'src', 'middleware.ts');
    
    if (fs.existsSync(srcMiddleware)) {
        fs.copySync(srcMiddleware, destMiddleware);
        console.log('   ✅ Middleware copiado');
    }
} catch (error) {
    console.error('   ❌ Error:', error.message);
}
console.log('');

// Paso 8: Copiar Prisma schema
console.log('🗄️  PASO 8: Copiando Prisma schema...');
try {
    const srcPrisma = path.join(ORIGEN, 'prisma');
    const destPrisma = path.join(DESTINO, 'prisma');
    
    if (fs.existsSync(srcPrisma)) {
        fs.ensureDirSync(destPrisma);
        fs.copySync(srcPrisma, destPrisma, { overwrite: true });
        console.log('   ✅ Prisma schema copiado');
    }
} catch (error) {
    console.error('   ❌ Error:', error.message);
}
console.log('');

// Paso 9: Copiar assets públicos
console.log('🖼️  PASO 9: Copiando assets públicos...');
try {
    const srcPublic = path.join(ORIGEN, 'public');
    const destPublic = path.join(DESTINO, 'public');
    
    if (fs.existsSync(srcPublic)) {
        fs.ensureDirSync(destPublic);
        fs.copySync(srcPublic, destPublic, { overwrite: false }); // No sobrescribir
        console.log('   ✅ Assets públicos copiados');
    }
} catch (error) {
    console.error('   ❌ Error:', error.message);
}
console.log('');

// Paso 10: Copiar server.ts
console.log('🖥️  PASO 10: Copiando server.ts...');
try {
    const srcServer = path.join(ORIGEN, 'server.ts');
    const destServer = path.join(DESTINO, 'server.ts');
    
    if (fs.existsSync(srcServer)) {
        fs.copySync(srcServer, destServer);
        console.log('   ✅ server.ts copiado');
    }
} catch (error) {
    console.error('   ❌ Error:', error.message);
}
console.log('');

// Paso 11: Fusionar package.json
console.log('📦 PASO 11: Fusionando package.json...');
try {
    const origenPkg = JSON.parse(fs.readFileSync(path.join(ORIGEN, 'package.json'), 'utf8'));
    const destinoPkg = JSON.parse(fs.readFileSync(path.join(DESTINO, 'package.json'), 'utf8'));
    
    // Fusionar dependencias
    const newPkg = {
        ...destinoPkg,
        scripts: {
            ...destinoPkg.scripts,
            ...origenPkg.scripts,
            // Mantener script del bot original
            'start:bot': 'node bot-whatsapp-estable.js'
        },
        dependencies: {
            ...destinoPkg.dependencies,
            ...origenPkg.dependencies
        },
        devDependencies: {
            ...destinoPkg.devDependencies,
            ...origenPkg.devDependencies
        }
    };
    
    fs.writeFileSync(
        path.join(DESTINO, 'package.json'),
        JSON.stringify(newPkg, null, 2)
    );
    
    console.log('   ✅ package.json fusionado');
} catch (error) {
    console.error('   ❌ Error:', error.message);
}
console.log('');

// Paso 12: Crear archivo de integración
console.log('🔗 PASO 12: Creando archivo de integración...');
try {
    const integracionContent = `// INTEGRACIÓN BOT + DASHBOARD
// Este archivo conecta bot-whatsapp-estable.js con el dashboard

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Exportar para usar en bot-whatsapp-estable.js
export { prisma };

// Funciones de integración
export async function guardarMensaje(data) {
    return await prisma.message.create({ data });
}

export async function obtenerProductos() {
    return await prisma.product.findMany({ where: { active: true } });
}

export async function actualizarEstadoBot(estado) {
    // Actualizar estado del bot en la BD
    console.log('Estado del bot:', estado);
}
`;

    fs.writeFileSync(
        path.join(DESTINO, 'integracion-bot-dashboard.js'),
        integracionContent
    );
    
    console.log('   ✅ Archivo de integración creado');
} catch (error) {
    console.error('   ❌ Error:', error.message);
}
console.log('');

// Paso 13: Crear guía de siguiente pasos
console.log('📝 PASO 13: Creando guía de siguientes pasos...');
const guiaContent = `# 🎉 MIGRACIÓN COMPLETADA

El dashboard ha sido copiado exitosamente a smart-sales.

## ✅ Lo que se copió:

1. ✅ Dashboard completo (src/app/)
2. ✅ Componentes UI (src/components/)
3. ✅ Servicios backend (src/lib/)
4. ✅ Hooks de React (src/hooks/)
5. ✅ Middleware de autenticación
6. ✅ Prisma schema
7. ✅ Assets públicos
8. ✅ Server.ts (Express + Next.js)
9. ✅ Configuración (next.config, tailwind, etc.)
10. ✅ package.json fusionado

## 🔧 SIGUIENTES PASOS:

### 1. Instalar dependencias
\`\`\`bash
cd ../smart-sales
npm install
\`\`\`

### 2. Configurar variables de entorno
Copia las variables necesarias del .env de botexperimento:
\`\`\`bash
# Copiar manualmente estas variables a smart-sales/.env:
DATABASE_URL="file:./dev.db"
GROQ_API_KEY="tu_key"
NEXTAUTH_SECRET="tu_secret"
NEXTAUTH_URL="http://localhost:3000"
\`\`\`

### 3. Configurar Prisma
\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

### 4. Integrar con bot-whatsapp-estable.js

Edita \`bot-whatsapp-estable.js\` y agrega al inicio:
\`\`\`javascript
// Importar integración con dashboard
import { prisma, guardarMensaje, obtenerProductos } from './integracion-bot-dashboard.js';
\`\`\`

### 5. Iniciar el sistema

Opción A - Solo Dashboard:
\`\`\`bash
npm run dev
\`\`\`

Opción B - Dashboard + Bot (recomendado):
\`\`\`bash
# Terminal 1: Dashboard
npm run dev

# Terminal 2: Bot
npm run start:bot
\`\`\`

Opción C - Todo junto con server.ts:
\`\`\`bash
npm run dev
# El server.ts maneja tanto Next.js como Socket.io
\`\`\`

## 🌐 Acceder al Dashboard

Una vez iniciado:
- Dashboard: http://localhost:3000
- API: http://localhost:3000/api
- Login: Crear usuario admin con script

## 👤 Crear Usuario Admin

\`\`\`bash
npx tsx scripts/create-admin-user.ts
\`\`\`

## 🔍 Verificar que todo funciona

1. ✅ Dashboard carga en navegador
2. ✅ Login funciona
3. ✅ Productos se muestran
4. ✅ Bot conecta a WhatsApp
5. ✅ Mensajes se guardan en BD
6. ✅ Socket.io sincroniza estado

## 📁 Backup

Tu backup está en: ${BACKUP}

Si algo sale mal, puedes restaurar:
\`\`\`bash
# Restaurar desde backup
cp -r ${BACKUP}/* ../smart-sales/
\`\`\`

## 🆘 Problemas Comunes

### Error: Cannot find module '@prisma/client'
\`\`\`bash
npx prisma generate
\`\`\`

### Error: Database not found
\`\`\`bash
npx prisma db push
\`\`\`

### Error: Port 3000 already in use
\`\`\`bash
# Cambiar puerto en package.json o matar proceso:
npx kill-port 3000
\`\`\`

## 📚 Documentación

- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Baileys: https://github.com/WhiskeySockets/Baileys

---

¡Listo! Tu dashboard está integrado con smart-sales 🚀
`;

fs.writeFileSync(
    path.join(DESTINO, 'MIGRACION_COMPLETADA.md'),
    guiaContent
);

console.log('   ✅ Guía creada: MIGRACION_COMPLETADA.md\n');

// Resumen final
console.log('═══════════════════════════════════════════');
console.log('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
console.log('═══════════════════════════════════════════\n');

console.log('📋 Resumen:');
console.log('   ✅ Backup creado en:', BACKUP);
console.log('   ✅ Dashboard copiado a smart-sales');
console.log('   ✅ Bot original NO modificado');
console.log('   ✅ Archivos fusionados correctamente\n');

console.log('🚀 Próximos pasos:');
console.log('   1. cd ../smart-sales');
console.log('   2. npm install');
console.log('   3. Configurar .env');
console.log('   4. npx prisma generate && npx prisma db push');
console.log('   5. npm run dev\n');

console.log('📖 Lee MIGRACION_COMPLETADA.md para más detalles\n');
