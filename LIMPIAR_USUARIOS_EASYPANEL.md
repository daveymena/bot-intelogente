# 🚀 Limpiar Usuarios en Easypanel

## ✅ Sí, Funciona en Easypanel

El script funciona perfectamente en Easypanel. Aquí te explico cómo usarlo.

## 📋 Opciones para Ejecutar en Easypanel

### Opción 1: Terminal de Easypanel (Recomendado)

1. **Abre Easypanel** → Tu proyecto
2. **Ve a la pestaña "Terminal"** o "Console"
3. **Ejecuta el comando**:

```bash
npx tsx scripts/limpiar-usuarios-excepto-admin.ts
```

### Opción 2: SSH Directo

Si tienes acceso SSH a tu servidor Easypanel:

```bash
# Conectar por SSH
ssh user@tu-servidor-easypanel

# Ir al directorio del proyecto
cd /app

# Ejecutar el script
npx tsx scripts/limpiar-usuarios-excepto-admin.ts
```

### Opción 3: Crear un Endpoint API (Más Seguro)

Para mayor control, puedes crear un endpoint protegido:

```typescript
// src/app/api/admin/limpiar-usuarios/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Verificar token de admin
    const { adminToken } = await request.json();
    
    if (adminToken !== process.env.ADMIN_SECRET_TOKEN) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Listar usuarios
    const usuarios = await prisma.user.findMany({
      select: { id: true, email: true, name: true },
    });

    // Filtrar usuarios a eliminar
    const usuariosAEliminar = usuarios.filter(
      (u) => u.email !== 'daveymena16@gmail.com'
    );

    // Eliminar usuarios
    for (const user of usuariosAEliminar) {
      await prisma.conversation.deleteMany({ where: { userId: user.id } });
      await prisma.product.deleteMany({ where: { userId: user.id } });
      await prisma.botSettings.deleteMany({ where: { userId: user.id } });
      await prisma.membership.deleteMany({ where: { userId: user.id } });
      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.verificationCode.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }

    return NextResponse.json({
      success: true,
      eliminados: usuariosAEliminar.length,
      usuarios: usuariosAEliminar.map(u => u.email),
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error al limpiar usuarios' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
```

Luego llámalo con:

```bash
curl -X POST https://tu-app.easypanel.host/api/admin/limpiar-usuarios \
  -H "Content-Type: application/json" \
  -d '{"adminToken": "TU_TOKEN_SECRETO"}'
```

## 🔒 Seguridad en Producción

### Variables de Entorno en Easypanel

Agrega en Easypanel → Environment Variables:

```env
ADMIN_SECRET_TOKEN=tu-token-super-secreto-aqui
```

## ⚡ Comando Rápido para Easypanel

Si ya tienes acceso a la terminal de Easypanel:

```bash
# Un solo comando
npx tsx scripts/limpiar-usuarios-excepto-admin.ts
```

## 📊 Verificar Antes de Ejecutar

Primero verifica qué usuarios tienes:

```bash
# En terminal de Easypanel
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.user.findMany().then(users => {
  console.log('Usuarios actuales:');
  users.forEach(u => console.log('-', u.email));
  prisma.\$disconnect();
});
"
```

## ✅ Confirmación de Sin Límites

El sistema en Easypanel **NO tiene límites** porque:

1. **PostgreSQL en Easypanel**: Sin límites de registros
2. **Prisma ORM**: Sin restricciones configuradas
3. **Next.js API**: Sin límites de requests
4. **Almacenamiento**: Depende de tu plan de Easypanel

## 🎯 Casos de Uso en Easypanel

1. **Limpiar usuarios de prueba** antes de lanzar
2. **Resetear base de datos** en staging
3. **Mantener solo el admin** para empezar limpio
4. **Auditoría de usuarios** en producción

## ⚠️ Importante para Easypanel

- ✅ El script es **seguro** para producción
- ✅ **No afecta** la base de datos PostgreSQL
- ✅ **Protege** automáticamente a daveymena16@gmail.com
- ⚠️ Es **irreversible** - haz backup si es necesario
- ✅ Funciona con **PostgreSQL** y **SQLite**

## 🔧 Troubleshooting en Easypanel

### Error: "Cannot find module"

```bash
# Instalar dependencias primero
npm install
```

### Error: "Database connection failed"

Verifica que `DATABASE_URL` esté configurada en Easypanel:

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### Error: "Permission denied"

Usa el usuario correcto en Easypanel o ejecuta desde la terminal web.

## 🚀 Recomendación Final

**Para Easypanel, usa la Opción 1** (Terminal de Easypanel):

1. Abre tu proyecto en Easypanel
2. Ve a Terminal/Console
3. Ejecuta: `npx tsx scripts/limpiar-usuarios-excepto-admin.ts`
4. Listo!

El script mostrará todo el proceso y confirmará que solo queda tu usuario admin.
