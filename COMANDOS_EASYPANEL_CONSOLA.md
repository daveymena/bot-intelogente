# 🖥️ Comandos para Consola de Easypanel

## � DiIAGNÓSTICO DE QR (EJECUTAR PRIMERO)

### Test de Generación de QR por Consola
```bash
npx tsx scripts/test-qr-console.ts
```
**Qué hace:**
- ✅ Genera QR directamente en la terminal
- ✅ Muestra el QR como ASCII art
- ✅ Detecta errores específicos de Baileys
- ✅ Verifica conectividad con WhatsApp

**Resultado esperado:**
```
✅ QR GENERADO EXITOSAMENTE
📱 ESCANEA ESTE QR CON WHATSAPP:
[QR CODE ASCII ART]
```

### Verificar Estado en Base de Datos
```bash
npx tsx scripts/verificar-estado-whatsapp.ts
```
**Qué hace:**
- 📊 Muestra todas las conexiones registradas
- 📱 Estado actual (CONNECTED, QR_PENDING, etc.)
- ⏰ Si hay QR y si está expirado
- 💡 Recomendaciones específicas

---

## 🔧 Limpiar Sesiones de WhatsApp

### Opción 1: Limpiar Sesión de un Usuario Específico

```bash
# Conectar a la consola de Easypanel
# Luego ejecutar:

npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function limpiar() {
  // Cambiar este email por el tuyo
  const email = 'tu@email.com';
  
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log('Usuario no encontrado');
    return;
  }
  
  console.log('Limpiando sesión de:', user.email);
  
  // Eliminar conexión de WhatsApp
  await prisma.whatsAppConnection.deleteMany({
    where: { userId: user.id }
  });
  
  console.log('✅ Sesión limpiada');
  await prisma.\$disconnect();
}

limpiar();
"
```

### Opción 2: Limpiar TODAS las Sesiones

```bash
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function limpiarTodo() {
  console.log('Limpiando todas las sesiones...');
  
  const result = await prisma.whatsAppConnection.deleteMany({});
  
  console.log(\`✅ \${result.count} sesiones eliminadas\`);
  await prisma.\$disconnect();
}

limpiarTodo();
"
```

### Opción 3: Solo Desconectar (Mantener Registro)

```bash
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function desconectar() {
  const result = await prisma.whatsAppConnection.updateMany({
    data: {
      status: 'DISCONNECTED',
      isConnected: false,
      qrCode: null,
      qrExpiresAt: null
    }
  });
  
  console.log(\`✅ \${result.count} sesiones desconectadas\`);
  await prisma.\$disconnect();
}

desconectar();
"
```

## 🗑️ Limpiar Archivos de Sesión

```bash
# Eliminar archivos de sesión de WhatsApp
rm -rf auth_sessions/*

# O para un usuario específico
rm -rf auth_sessions/[USER_ID]
```

## 🔄 Reiniciar Aplicación

```bash
# Forzar reinicio de la aplicación
# (Esto se hace desde el panel de Easypanel)
# Settings → Restart
```

## 📊 Ver Estado Actual

```bash
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verEstado() {
  const conexiones = await prisma.whatsAppConnection.findMany({
    include: { user: { select: { email: true } } }
  });
  
  console.log('Conexiones actuales:');
  conexiones.forEach(c => {
    console.log(\`- \${c.user.email}: \${c.status} (\${c.phoneNumber})\`);
  });
  
  await prisma.\$disconnect();
}

verEstado();
"
```

## 🚀 Comando Rápido Todo-en-Uno

```bash
# Limpiar todo y reiniciar
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function resetCompleto() {
  console.log('🔄 Iniciando reset completo...');
  
  // 1. Limpiar base de datos
  const result = await prisma.whatsAppConnection.deleteMany({});
  console.log(\`✅ \${result.count} sesiones eliminadas de DB\`);
  
  // 2. Limpiar archivos (necesitas ejecutar por separado)
  console.log('⚠️  Ejecuta manualmente: rm -rf auth_sessions/*');
  
  await prisma.\$disconnect();
  console.log('✅ Reset completo');
}

resetCompleto();
" && echo "Ahora ejecuta: rm -rf auth_sessions/*"
```

## 📝 Pasos Completos

### Para Limpiar Sesión de WhatsApp en Easypanel:

1. **Ir a Easypanel**
   - Abre https://easypanel.io
   - Selecciona tu proyecto

2. **Abrir Terminal**
   - Ve a la pestaña "Terminal" o "Console"
   - Se abrirá una terminal dentro del contenedor

3. **Ejecutar Comando**
   ```bash
   # Opción simple - Desconectar todo
   npx tsx -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); p.whatsAppConnection.updateMany({ data: { status: 'DISCONNECTED', isConnected: false, qrCode: null } }).then(r => console.log('✅', r.count, 'desconectadas')).finally(() => p.\$disconnect())"
   ```

4. **Limpiar Archivos**
   ```bash
   rm -rf auth_sessions/*
   ```

5. **Reiniciar App** (Opcional)
   - Desde el panel: Settings → Restart

## ⚡ Comando Ultra Corto

```bash
# Copiar y pegar esto en la consola de Easypanel:
npx tsx -e "import{PrismaClient as P}from'@prisma/client';const p=new P();p.whatsAppConnection.deleteMany().then(r=>console.log('✅',r.count)).finally(()=>p.\$disconnect())" && rm -rf auth_sessions/*
```

## 🎯 Resultado Esperado

Después de ejecutar los comandos verás:

```
✅ 1 sesiones eliminadas
✅ Archivos de sesión eliminados
```

Ahora puedes conectar WhatsApp desde cero sin problemas.

## 🔍 Verificar que Funcionó

```bash
# Ver si hay sesiones
npx tsx -e "import{PrismaClient as P}from'@prisma/client';const p=new P();p.whatsAppConnection.count().then(c=>console.log('Sesiones:',c)).finally(()=>p.\$disconnect())"

# Ver archivos
ls -la auth_sessions/
```

Debería mostrar:
- `Sesiones: 0`
- Carpeta `auth_sessions/` vacía

---

**Nota**: Estos comandos se ejecutan directamente en la terminal de Easypanel, no en tu computadora local.
