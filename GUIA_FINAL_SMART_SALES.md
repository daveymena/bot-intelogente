# ✅ MIGRACIÓN COMPLETADA - Guía Final

## 🎉 Estado Actual

✅ Dashboard copiado exitosamente a `smart-sales`
✅ Dependencias instaladas
✅ Prisma Client generado
✅ Bot original (botexperimento) NO modificado
✅ Backup creado en: `smart-sales/backup-1762538356936`

## 🔧 PASOS FINALES PARA COMPLETAR

### 1. Configurar Base de Datos

Tienes dos opciones:

#### Opción A: SQLite (Desarrollo - Más Fácil)

Edita `smart-sales/.env` y agrega:
```env
DATABASE_URL="file:./dev.db"
```

Luego ejecuta:
```bash
cd ..\smart-sales
npx prisma db push
```

#### Opción B: PostgreSQL (Producción)

Edita `smart-sales/.env` y agrega:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/smart_sales"
```

Luego ejecuta:
```bash
cd ..\smart-sales
npx prisma db push
```

### 2. Configurar Variables de Entorno

Edita `smart-sales/.env` y asegúrate de tener:

```env
# Base de Datos
DATABASE_URL="file:./dev.db"

# Groq AI (Principal)
GROQ_API_KEY="tu_groq_api_key"

# Autenticación
NEXTAUTH_SECRET="genera_un_secret_aleatorio_aqui"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="otro_secret_aleatorio"

# WhatsApp (Baileys)
WHATSAPP_SESSION_PATH="./auth_sessions"

# Opcional: Otros proveedores de IA
OPENAI_API_KEY="tu_openai_key"
CLAUDE_API_KEY="tu_claude_key"
AI_FALLBACK_ENABLED="true"

# Email (opcional)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="tu_email@gmail.com"
EMAIL_PASSWORD="tu_password"

# Pagos (opcional)
MERCADOPAGO_ACCESS_TOKEN="tu_token"
PAYPAL_CLIENT_ID="tu_client_id"
```

### 3. Crear Usuario Admin

Una vez configurada la BD, crea un usuario administrador:

```bash
cd ..\smart-sales
npx tsx scripts/create-admin-user.ts
```

O crea el script manualmente si no existe:

```typescript
// scripts/create-admin-user.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@smart-sales.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });
  
  console.log('✅ Usuario admin creado:', admin.email);
  console.log('📧 Email: admin@smart-sales.com');
  console.log('🔑 Password: admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### 4. Integrar Bot con Dashboard

Edita `smart-sales/bot-whatsapp-estable.js` y agrega al inicio (después de los imports):

```javascript
// Importar integración con dashboard
import { prisma, guardarMensaje, obtenerProductos } from './integracion-bot-dashboard.js';

// Usar en el bot para guardar mensajes
async function handleMessage(msg) {
    // ... tu lógica actual ...
    
    // Guardar en BD
    await guardarMensaje({
        from: msg.from,
        body: msg.body,
        timestamp: new Date(),
        type: 'incoming'
    });
}

// Obtener productos desde la BD
async function getProducts() {
    return await obtenerProductos();
}
```

### 5. Iniciar el Sistema

Tienes 3 opciones:

#### Opción A: Solo Dashboard (Recomendado para empezar)
```bash
cd ..\smart-sales
npm run dev
```
Accede a: http://localhost:3000

#### Opción B: Dashboard + Bot (Dos terminales)
```bash
# Terminal 1: Dashboard
cd ..\smart-sales
npm run dev

# Terminal 2: Bot
cd ..\smart-sales
npm run start:bot
```

#### Opción C: Todo integrado con server.ts
```bash
cd ..\smart-sales
npm run dev
```
El server.ts maneja tanto Next.js como Socket.io para sincronización en tiempo real.

## 📱 Acceder al Dashboard

1. Abre tu navegador en: http://localhost:3000
2. Inicia sesión con:
   - Email: `admin@smart-sales.com`
   - Password: `admin123`
3. Explora las secciones:
   - 📊 Dashboard principal
   - 📦 Gestión de productos
   - 💬 Conversaciones
   - ⚙️ Configuración del bot
   - 📈 Métricas y analytics

## 🔗 Estructura del Proyecto

```
smart-sales/
├── bot-whatsapp-estable.js       # ✅ Tu bot original (mantiene su lógica)
├── server.ts                      # 🆕 Servidor Express + Next.js + Socket.io
├── integracion-bot-dashboard.js   # 🆕 Conecta bot con dashboard
├── src/
│   ├── app/                       # 🆕 Dashboard Next.js
│   │   ├── page.tsx              # Dashboard principal
│   │   ├── api/                  # API routes
│   │   ├── catalogo/             # Catálogo público
│   │   └── ...
│   ├── components/                # 🆕 Componentes UI
│   │   ├── dashboard/
│   │   ├── ProductsManagement.tsx
│   │   └── ui/                   # shadcn/ui
│   ├── lib/                       # 🆕 Servicios backend
│   │   ├── db.ts                 # Prisma client
│   │   ├── auth.ts               # Autenticación
│   │   ├── baileys-service.ts    # WhatsApp
│   │   ├── ai-service.ts         # IA
│   │   └── ...
│   └── middleware.ts              # 🆕 Auth middleware
├── prisma/
│   └── schema.prisma              # 🆕 Schema de BD
└── public/                        # Assets estáticos
```

## 🎯 Funcionalidades del Dashboard

### ✅ Ya Implementadas:
- 🔐 Sistema de autenticación (JWT)
- 📦 Gestión completa de productos (CRUD)
- 💬 Visualización de conversaciones
- 📊 Dashboard con métricas
- ⚙️ Configuración del bot
- 🎨 UI moderna con Tailwind + shadcn/ui
- 📱 Responsive design
- 🔄 Hot reload de configuración
- 📸 Gestión de imágenes de productos
- 💳 Integración de pagos (MercadoPago, PayPal)
- 📧 Sistema de emails
- 🤖 Múltiples proveedores de IA con fallback

### 🔗 Integraciones Disponibles:
- WhatsApp (Baileys)
- Groq AI (Llama 3.1)
- OpenAI GPT-4
- Claude
- Gemini
- MercadoPago
- PayPal
- Email (SMTP)

## 🐛 Solución de Problemas

### Error: Cannot find module '@prisma/client'
```bash
cd ..\smart-sales
npx prisma generate
```

### Error: Database not found
```bash
cd ..\smart-sales
npx prisma db push
```

### Error: Port 3000 already in use
```bash
# Opción 1: Matar el proceso
npx kill-port 3000

# Opción 2: Cambiar puerto en package.json
"dev": "next dev -p 3001"
```

### Error: GROQ_API_KEY not found
Asegúrate de tener el archivo `.env` en `smart-sales/` con:
```env
GROQ_API_KEY="tu_key_aqui"
```

### Dashboard no carga
1. Verifica que Next.js esté corriendo: `npm run dev`
2. Revisa la consola por errores
3. Verifica que la BD esté configurada: `npx prisma db push`

### Bot no conecta a WhatsApp
1. Verifica que el bot esté corriendo: `npm run start:bot`
2. Escanea el código QR que aparece en consola
3. Revisa que la carpeta `auth_sessions/` exista

## 📚 Comandos Útiles

```bash
# Desarrollo
npm run dev                    # Iniciar dashboard
npm run start:bot              # Iniciar bot

# Base de Datos
npx prisma studio              # Abrir interfaz visual de BD
npx prisma db push             # Aplicar cambios de schema
npx prisma generate            # Regenerar cliente Prisma
npx prisma migrate dev         # Crear migración

# Build
npm run build                  # Build para producción
npm start                      # Iniciar en producción

# Utilidades
npm run lint                   # Linter
npx kill-port 3000            # Liberar puerto
```

## 🔄 Sincronización Bot ↔ Dashboard

El sistema está diseñado para que:

1. **Bot guarda mensajes** → Se reflejan en dashboard
2. **Dashboard actualiza productos** → Bot los ve inmediatamente
3. **Socket.io sincroniza** → Cambios en tiempo real
4. **Prisma es la fuente única** → Todos consultan la misma BD

## 📖 Documentación Adicional

- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **Baileys**: https://github.com/WhiskeySockets/Baileys
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs

## 🎉 ¡Listo!

Tu dashboard está completamente integrado con smart-sales. Ahora puedes:

1. ✅ Gestionar productos desde el dashboard
2. ✅ Ver conversaciones en tiempo real
3. ✅ Configurar el bot visualmente
4. ✅ Monitorear métricas
5. ✅ El bot sigue funcionando con su lógica original

## 🔐 Seguridad

Recuerda cambiar:
- ✅ Passwords por defecto
- ✅ JWT_SECRET y NEXTAUTH_SECRET
- ✅ Credenciales de API
- ✅ Configuración de CORS en producción

## 🚀 Próximos Pasos

1. Personaliza el dashboard con tu marca
2. Agrega más productos
3. Configura los métodos de pago
4. Prueba el flujo completo de ventas
5. Despliega a producción (Vercel, Railway, etc.)

---

**¿Necesitas ayuda?** Revisa los logs en consola o la documentación de cada tecnología.

**Backup disponible en**: `smart-sales/backup-1762538356936`
