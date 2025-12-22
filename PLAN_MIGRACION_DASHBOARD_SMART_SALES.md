# Plan de Migración: Dashboard de botexperimento → smart-sales

## 📋 Objetivo
Implementar el dashboard completo de Next.js del proyecto `botexperimento` en el proyecto `smart-sales`, manteniendo el bot-whatsapp-estable.js como base de la lógica de WhatsApp.

## 🎯 Alcance

### Componentes a Migrar
1. **Dashboard Next.js completo** (`src/app/`, `src/components/`)
2. **Sistema de autenticación** (JWT, middleware)
3. **API Routes** (productos, conversaciones, WhatsApp, pagos, etc.)
4. **Servicios de backend** (`src/lib/`)
5. **Base de datos Prisma** (schema, migraciones)
6. **Configuración Next.js** (next.config.ts, tailwind, etc.)

### Componentes a Mantener de smart-sales
1. **bot-whatsapp-estable.js** (lógica principal del bot)
2. **Servicios específicos** que no existan en botexperimento
3. **Configuraciones personalizadas**

## 📁 Estructura Objetivo

```
smart-sales/
├── bot-whatsapp-estable.js          # ✅ Mantener (base del bot)
├── server.ts                         # 🆕 Migrar (Express + Next.js)
├── package.json                      # 🔄 Fusionar dependencias
├── next.config.ts                    # 🆕 Migrar
├── tailwind.config.ts                # 🆕 Migrar
├── tsconfig.json                     # 🔄 Actualizar
├── prisma/
│   └── schema.prisma                 # 🆕 Migrar (completo)
├── src/
│   ├── app/                          # 🆕 Migrar (todo el dashboard)
│   │   ├── api/                      # API routes
│   │   ├── catalogo/                 # Catálogo público
│   │   ├── membresias/               # Membresías
│   │   └── page.tsx                  # Dashboard principal
│   ├── components/                   # 🆕 Migrar (todos los componentes)
│   │   ├── dashboard/
│   │   ├── ui/                       # shadcn/ui
│   │   └── ...
│   ├── lib/                          # 🔄 Fusionar servicios
│   │   ├── baileys-service.ts        # 🆕 Migrar
│   │   ├── ai-service.ts             # 🆕 Migrar
│   │   ├── product-intelligence-service.ts
│   │   ├── db.ts                     # 🆕 Migrar (Prisma client)
│   │   └── ... (mantener existentes de smart-sales)
│   ├── hooks/                        # 🆕 Migrar
│   └── middleware.ts                 # 🆕 Migrar (auth)
├── public/                           # 🔄 Fusionar assets
└── scripts/                          # 🔄 Fusionar scripts útiles
```

## 🔧 Pasos de Migración

### Fase 1: Preparación (30 min)
1. ✅ Crear backup completo de smart-sales
2. ✅ Documentar dependencias actuales
3. ✅ Identificar conflictos potenciales
4. ✅ Crear rama de migración en Git

### Fase 2: Configuración Base (1 hora)
1. 🔄 Fusionar package.json (dependencias de ambos proyectos)
2. 🆕 Copiar archivos de configuración:
   - next.config.ts
   - tailwind.config.ts
   - tsconfig.json (actualizar)
   - components.json (shadcn/ui)
   - eslint.config.mjs
3. 🆕 Instalar dependencias nuevas
4. 🆕 Configurar Prisma

### Fase 3: Base de Datos (45 min)
1. 🆕 Copiar schema.prisma completo
2. 🆕 Generar cliente Prisma
3. 🆕 Crear migraciones iniciales
4. 🆕 Configurar DATABASE_URL en .env

### Fase 4: Servicios Backend (2 horas)
1. 🆕 Migrar servicios core de `src/lib/`:
   - db.ts (Prisma client)
   - auth.ts
   - baileys-service.ts (integrar con bot-whatsapp-estable.js)
   - ai-service.ts
   - product-intelligence-service.ts
   - conversation-context-service.ts
   - media-service.ts
   - email-service.ts
   - payment-methods.ts
2. 🔄 Adaptar servicios existentes de smart-sales
3. 🔄 Resolver conflictos de nombres

### Fase 5: API Routes (2 horas)
1. 🆕 Copiar toda la carpeta `src/app/api/`
2. 🔄 Adaptar rutas que dependan de servicios específicos
3. 🔄 Integrar con bot-whatsapp-estable.js
4. ✅ Probar endpoints críticos

### Fase 6: Componentes UI (2 horas)
1. 🆕 Copiar `src/components/` completo
2. 🆕 Copiar `src/app/` (páginas del dashboard)
3. 🆕 Copiar `src/hooks/`
4. 🔄 Ajustar imports y rutas
5. ✅ Verificar que compile

### Fase 7: Servidor Custom (1 hora)
1. 🆕 Migrar server.ts (Express + Next.js + Socket.io)
2. 🔄 Integrar con bot-whatsapp-estable.js
3. 🔄 Configurar WebSocket para actualizaciones en tiempo real
4. ✅ Probar servidor completo

### Fase 8: Integración Bot (2 horas)
1. 🔄 Adaptar bot-whatsapp-estable.js para usar servicios de Prisma
2. 🔄 Conectar bot con API routes del dashboard
3. 🔄 Implementar sincronización de estado (QR, conexión, mensajes)
4. 🔄 Integrar sistema de conversaciones con dashboard
5. ✅ Probar flujo completo

### Fase 9: Assets y Públicos (30 min)
1. 🔄 Fusionar carpeta `public/`
2. 🆕 Copiar logos, favicons, imágenes
3. 🆕 Copiar manifest.json (PWA)
4. ✅ Verificar rutas de assets

### Fase 10: Scripts y Utilidades (30 min)
1. 🔄 Fusionar scripts útiles de ambos proyectos
2. 🆕 Actualizar scripts de package.json
3. 🆕 Crear scripts de migración de datos
4. ✅ Documentar scripts disponibles

### Fase 11: Variables de Entorno (30 min)
1. 🔄 Fusionar .env.example
2. 🆕 Documentar nuevas variables requeridas
3. 🔄 Actualizar .env local
4. ✅ Verificar todas las variables

### Fase 12: Testing y Ajustes (2 horas)
1. ✅ Probar autenticación
2. ✅ Probar gestión de productos
3. ✅ Probar conexión WhatsApp
4. ✅ Probar envío de mensajes
5. ✅ Probar dashboard completo
6. 🔧 Corregir errores encontrados

### Fase 13: Optimización (1 hora)
1. 🔧 Eliminar código duplicado
2. 🔧 Optimizar imports
3. 🔧 Limpiar archivos no utilizados
4. 📝 Actualizar documentación

## 🔑 Puntos Críticos de Integración

### 1. Bot WhatsApp ↔ Dashboard
```typescript
// bot-whatsapp-estable.js debe comunicarse con:
- API /api/whatsapp/status (estado de conexión)
- API /api/conversations (guardar mensajes)
- API /api/products (consultar productos)
- Socket.io (actualizaciones en tiempo real)
```

### 2. Autenticación
```typescript
// Middleware de Next.js debe proteger:
- Dashboard principal
- API routes privadas
- Gestión de productos
- Configuración del bot
```

### 3. Base de Datos
```typescript
// Prisma debe manejar:
- Usuarios y autenticación
- Productos y categorías
- Conversaciones y mensajes
- Configuración del bot
- Métricas y analytics
```

### 4. Servicios Compartidos
```typescript
// Servicios que ambos sistemas usan:
- AI Service (Groq, OpenAI, etc.)
- Product Intelligence
- Media Service (audio, imágenes)
- Email Service
```

## 📦 Dependencias Nuevas a Instalar

```json
{
  "@prisma/client": "^5.x",
  "@radix-ui/react-*": "latest",
  "next": "15.x",
  "react": "19.x",
  "socket.io": "^4.x",
  "socket.io-client": "^4.x",
  "framer-motion": "^11.x",
  "zustand": "^4.x",
  "react-hook-form": "^7.x",
  "zod": "^3.x",
  "bcryptjs": "^2.x",
  "jsonwebtoken": "^9.x",
  "sharp": "^0.33.x"
}
```

## ⚠️ Consideraciones Importantes

1. **Compatibilidad de Versiones**
   - Next.js 15 requiere React 19
   - Verificar compatibilidad de whatsapp-web.js con el nuevo setup

2. **Estructura de Archivos**
   - bot-whatsapp-estable.js permanece en la raíz
   - Dashboard en src/app/ (App Router de Next.js)

3. **Estado Compartido**
   - Socket.io para sincronización en tiempo real
   - Prisma como fuente única de verdad

4. **Performance**
   - El bot y el dashboard corren en el mismo proceso
   - Considerar separación futura si es necesario

## 🚀 Comandos de Migración

```bash
# 1. Backup
cd C:\davey\smart-sales
git init (si no existe)
git add .
git commit -m "Backup antes de migración"

# 2. Copiar archivos de configuración
# (se hará con scripts automatizados)

# 3. Instalar dependencias
npm install

# 4. Setup Prisma
npx prisma generate
npx prisma db push

# 5. Iniciar desarrollo
npm run dev
```

## 📝 Checklist Final

- [ ] Dashboard accesible en http://localhost:3000
- [ ] Bot WhatsApp conecta correctamente
- [ ] Autenticación funciona
- [ ] Productos se gestionan desde dashboard
- [ ] Conversaciones se guardan en BD
- [ ] Métricas se actualizan en tiempo real
- [ ] Socket.io sincroniza estado
- [ ] API routes responden correctamente
- [ ] Build de producción funciona
- [ ] Documentación actualizada

## 🎯 Resultado Esperado

Un sistema unificado donde:
- **bot-whatsapp-estable.js** maneja la lógica de WhatsApp
- **Dashboard Next.js** proporciona interfaz de administración
- **Prisma** gestiona toda la persistencia
- **Socket.io** mantiene sincronización en tiempo real
- **API Routes** conectan ambos sistemas

## 📞 Soporte

Si encuentras problemas durante la migración:
1. Revisar logs del servidor
2. Verificar variables de entorno
3. Comprobar conexión a base de datos
4. Validar que todas las dependencias estén instaladas

---

**Tiempo Estimado Total**: 12-15 horas
**Complejidad**: Alta
**Riesgo**: Medio (con backups adecuados)
