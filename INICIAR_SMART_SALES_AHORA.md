# 🚀 INICIAR SMART-SALES AHORA

## ⚡ Configuración Rápida (2 minutos)

### Opción 1: Script Automático (Recomendado)
```bash
# Ejecuta este archivo:
configurar-smart-sales-rapido.bat
```

### Opción 2: Manual (Paso a Paso)

#### 1️⃣ Ir a smart-sales
```bash
cd ..\smart-sales
```

#### 2️⃣ Configurar base de datos
```bash
# Crear archivo .env con:
echo DATABASE_URL="file:./dev.db" > .env
echo GROQ_API_KEY="tu_groq_key_aqui" >> .env
echo NEXTAUTH_SECRET="secret-2024" >> .env
echo NEXTAUTH_URL="http://localhost:3000" >> .env
```

#### 3️⃣ Aplicar schema de base de datos
```bash
npx prisma db push
```

#### 4️⃣ Iniciar dashboard
```bash
npm run dev
```

#### 5️⃣ Abrir navegador
```
http://localhost:3000
```

---

## 🎯 Comandos Esenciales

### Iniciar Dashboard
```bash
cd ..\smart-sales
npm run dev
```
📱 Abre: http://localhost:3000

### Iniciar Bot
```bash
cd ..\smart-sales
npm run start:bot
```
📱 Escanea el QR que aparece

### Ver Base de Datos
```bash
cd ..\smart-sales
npx prisma studio
```
📱 Abre: http://localhost:5555

---

## 📋 Checklist Rápido

Antes de iniciar, verifica:

- [ ] Estás en la carpeta `smart-sales`
- [ ] Existe el archivo `.env`
- [ ] Tienes `DATABASE_URL` configurado
- [ ] Ejecutaste `npx prisma db push`
- [ ] Las dependencias están instaladas

---

## 🎨 Estructura del Dashboard

Una vez iniciado, verás:

```
http://localhost:3000
├── / (Dashboard principal)
├── /catalogo (Catálogo público)
├── /membresias (Planes)
└── /api/* (API endpoints)
```

---

## 🔑 Acceso Inicial

Por defecto, el sistema no tiene usuarios. Tienes 2 opciones:

### Opción A: Crear usuario desde código
Crea `smart-sales/scripts/create-admin.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'admin@smart-sales.com',
      name: 'Admin',
      password,
      role: 'ADMIN'
    }
  });
  console.log('✅ Usuario creado:', user.email);
}

main().finally(() => prisma.$disconnect());
```

Ejecuta:
```bash
npx tsx scripts/create-admin.ts
```

### Opción B: Usar Prisma Studio
```bash
npx prisma studio
```
1. Ve a la tabla `User`
2. Crea un nuevo registro manualmente
3. Password debe estar hasheado con bcrypt

---

## 🐛 Solución Rápida de Problemas

### ❌ Error: Cannot find module '@prisma/client'
```bash
npx prisma generate
```

### ❌ Error: Database not found
```bash
npx prisma db push
```

### ❌ Error: Port 3000 in use
```bash
npx kill-port 3000
# O cambia el puerto:
npm run dev -- -p 3001
```

### ❌ Error: GROQ_API_KEY not found
Edita `.env` y agrega:
```env
GROQ_API_KEY="tu_key_aqui"
```

---

## 📊 Verificar que Todo Funciona

### 1. Dashboard carga
✅ http://localhost:3000 muestra la página

### 2. API responde
✅ http://localhost:3000/api/health devuelve OK

### 3. Base de datos conecta
✅ `npx prisma studio` abre sin errores

### 4. Bot puede iniciar
✅ `npm run start:bot` muestra QR code

---

## 🎯 Flujo Completo de Uso

```
1. Iniciar Dashboard
   ↓
2. Crear usuario admin
   ↓
3. Login en dashboard
   ↓
4. Agregar productos
   ↓
5. Iniciar bot
   ↓
6. Escanear QR
   ↓
7. Bot conectado ✅
   ↓
8. Conversaciones aparecen en dashboard
```

---

## 📱 URLs Importantes

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Dashboard | http://localhost:3000 | Interfaz principal |
| API | http://localhost:3000/api | Endpoints REST |
| Prisma Studio | http://localhost:5555 | Admin de BD |
| Catálogo | http://localhost:3000/catalogo | Vista pública |

---

## 🔄 Comandos de Desarrollo

```bash
# Desarrollo
npm run dev              # Iniciar dashboard
npm run start:bot        # Iniciar bot

# Base de datos
npx prisma studio        # Interfaz visual
npx prisma db push       # Aplicar cambios
npx prisma generate      # Regenerar cliente

# Utilidades
npm run build            # Build producción
npm run lint             # Linter
npx kill-port 3000      # Liberar puerto
```

---

## 🎉 ¡Listo para Empezar!

Tu dashboard está completamente configurado y listo para usar.

**Siguiente paso**: Ejecuta uno de estos comandos:

```bash
# Opción 1: Configuración automática
configurar-smart-sales-rapido.bat

# Opción 2: Iniciar directamente
cd ..\smart-sales
npm run dev
```

---

## 📚 Documentación Adicional

- `GUIA_FINAL_SMART_SALES.md` - Guía completa
- `MIGRACION_COMPLETADA.md` - Detalles de migración
- `RESUMEN_MIGRACION_EXITOSA.md` - Resumen ejecutivo

---

**¿Problemas?** Revisa los archivos de documentación o los logs en consola.

**Backup disponible**: `smart-sales/backup-1762538356936/`
