# 🏢 ARQUITECTURA SAAS MULTI-TENANT

## 🎯 DISEÑO DEL SISTEMA

El sistema está diseñado como una plataforma SaaS donde **cada empresa tiene su propia información aislada** y el bot la carga dinámicamente desde la base de datos.

## 📊 SEPARACIÓN DE DATOS POR USUARIO

### Modelo de Datos:

Todos los modelos principales tienen `userId` para aislar datos:

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  businessName String?
  // ... más campos
  
  // Relaciones (cada empresa tiene sus propios datos)
  products              Product[]
  conversations         Conversation[]
  settings              BotSettings?
  paymentConfig         PaymentConfig?
  storeSettings         StoreSettings?
  // ... más relaciones
}

model Product {
  id       String  @id @default(cuid())
  name     String
  price    Float
  userId   String  // ← Aislamiento por usuario
  user     User    @relation(fields: [userId], references: [id])
}

model Conversation {
  id            String  @id @default(cuid())
  customerPhone String
  userId        String  // ← Aislamiento por usuario
  user          User    @relation(fields: [userId], references: [id])
}

model BotSettings {
  id           String  @id @default(cuid())
  userId       String  @unique  // ← Aislamiento por usuario
  businessName String
  businessPhone String
  user         User    @relation(fields: [userId], references: [id])
}
```

## 🧠 CARGA DINÁMICA DE CONOCIMIENTO

### BusinessKnowledgeService

El bot carga la información de cada empresa dinámicamente:

```typescript
// src/lib/business-knowledge-service.ts
export class BusinessKnowledgeService {
  static async getKnowledge(userId: string): Promise<BusinessKnowledge> {
    // 1. Información del negocio (desde BotSettings)
    const botSettings = await db.botSettings.findUnique({
      where: { userId }
    });
    
    // 2. Métodos de pago (desde PaymentConfig)
    const paymentConfig = await db.paymentConfig.findUnique({
      where: { userId }
    });
    
    // 3. Productos (filtrados por userId)
    const products = await db.product.findMany({
      where: { userId, status: 'AVAILABLE' }
    });
    
    // 4. Configuración de tienda (desde StoreSettings)
    const storeSettings = await db.storeSettings.findUnique({
      where: { userId }
    });
    
    return {
      businessInfo: { ... },
      paymentMethods: { ... },
      products: { ... },
      shippingPolicies: { ... }
    };
  }
}
```

### Uso en OpenClaw:

```typescript
// src/lib/bot/openclaw-orchestrator.ts
async processMessage(messageText: string, from: string, context: any) {
  // Cargar conocimiento específico del usuario
  const { BusinessKnowledgeService } = await import('../business-knowledge-service');
  const knowledge = await BusinessKnowledgeService.getKnowledge(context.userId);
  const brainContext = BusinessKnowledgeService.formatForPrompt(knowledge);
  
  // El bot ahora tiene acceso a:
  // - Nombre del negocio
  // - Métodos de pago configurados
  // - Productos disponibles
  // - Políticas de envío
  // - Horarios de atención
  // - etc.
}
```

## 🔄 FLUJO DE DATOS

### 1. Usuario Configura su Negocio (Dashboard):

```
Usuario → Dashboard → API → Base de Datos
                              ↓
                        [BotSettings]
                        [PaymentConfig]
                        [StoreSettings]
                        [Products]
```

### 2. Cliente Envía Mensaje por WhatsApp:

```
Cliente → WhatsApp → Bot → OpenClaw
                            ↓
                    BusinessKnowledgeService.getKnowledge(userId)
                            ↓
                    Carga datos desde BD
                            ↓
                    Genera respuesta personalizada
                            ↓
                    Cliente recibe respuesta
```

## 📋 DATOS QUE SE CARGAN DINÁMICAMENTE

### 1. Información del Negocio:
- ✅ Nombre de la empresa
- ✅ Descripción
- ✅ Teléfono
- ✅ Dirección
- ✅ Horarios de atención

### 2. Métodos de Pago:
- ✅ MercadoPago (habilitado/deshabilitado)
- ✅ PayPal (habilitado/deshabilitado)
- ✅ Nequi (número)
- ✅ Daviplata (número)
- ✅ Transferencia bancaria (banco, cuenta)

### 3. Productos:
- ✅ Catálogo completo
- ✅ Precios
- ✅ Categorías
- ✅ Stock
- ✅ Imágenes
- ✅ Descripciones

### 4. Políticas:
- ✅ Envíos (costo, tiempo)
- ✅ Devoluciones
- ✅ Garantías

### 5. Personalidad del Bot:
- ✅ Tono (desde SOUL.md o configuración)
- ✅ Estilo de comunicación
- ✅ Instrucciones especiales

## 🔐 AISLAMIENTO Y SEGURIDAD

### Queries Siempre Filtradas por userId:

```typescript
// ✅ CORRECTO - Siempre filtrar por userId
const products = await db.product.findMany({
  where: { 
    userId: currentUserId,  // ← Filtro obligatorio
    status: 'AVAILABLE' 
  }
});

// ❌ INCORRECTO - Sin filtro de userId
const products = await db.product.findMany({
  where: { status: 'AVAILABLE' }
});
```

### Middleware de Autenticación:

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // El userId está disponible en todas las rutas protegidas
  request.headers.set('x-user-id', token.sub);
}
```

## 🎨 CONFIGURACIÓN POR EMPRESA

### Dashboard de Configuración:

Cada empresa puede configurar:

1. **Información del Negocio** (`/dashboard/settings`)
   - Nombre
   - Descripción
   - Contacto
   - Horarios

2. **Métodos de Pago** (`/dashboard/payments`)
   - Habilitar/deshabilitar cada método
   - Configurar credenciales
   - Números de cuenta

3. **Productos** (`/dashboard/products`)
   - Agregar/editar/eliminar
   - Categorías
   - Precios
   - Stock

4. **Tienda Online** (`/dashboard/store`)
   - Colores
   - Logo
   - Diseño
   - Dominio

5. **Bot de WhatsApp** (`/dashboard/whatsapp`)
   - Conectar número
   - Personalidad
   - Respuestas automáticas

## 🔄 CACHÉ Y RENDIMIENTO

### Sistema de Caché:

```typescript
export class BusinessKnowledgeService {
  private static cache: BusinessKnowledge | null = null;
  private static lastUpdate: number = 0;
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  
  static async getKnowledge(userId: string): Promise<BusinessKnowledge> {
    // Usar caché si está fresco
    const now = Date.now();
    if (this.cache && (now - this.lastUpdate) < this.CACHE_DURATION) {
      return this.cache;
    }
    
    // Recargar desde BD
    const knowledge = await this.loadFromDatabase(userId);
    this.cache = knowledge;
    this.lastUpdate = now;
    
    return knowledge;
  }
  
  // Limpiar caché cuando se actualiza configuración
  static clearCache(): void {
    this.cache = null;
  }
}
```

### Hot Reload:

Cuando el usuario actualiza su configuración en el dashboard, el caché se limpia automáticamente:

```typescript
// API de actualización de settings
export async function POST(request: NextRequest) {
  // Actualizar en BD
  await db.botSettings.update({ ... });
  
  // Limpiar caché para que se recargue
  BusinessKnowledgeService.clearCache();
  
  return NextResponse.json({ success: true });
}
```

## 📊 EJEMPLO DE CONOCIMIENTO CARGADO

```typescript
{
  businessInfo: {
    name: "Tecnovariedades D&S",
    description: "Tienda de tecnología en Cali",
    phone: "3136174267",
    address: "CC El Diamante 2, Local 158, Cali",
    workingHours: "Lunes a Sábado, 9am - 7pm"
  },
  paymentMethods: {
    mercadoPago: true,
    paypal: true,
    nequi: true,
    daviplata: false,
    bankTransfer: true,
    details: {
      nequiPhone: "3136174267",
      bankName: "BBVA",
      bankAccount: "0616001940"
    }
  },
  products: {
    total: 150,
    byCategory: {
      "PHYSICAL": 80,
      "DIGITAL": 50,
      "SERVICE": 20
    },
    featured: [
      { id: "1", name: "Laptop ASUS", price: 2500000 },
      { id: "2", name: "Curso de Piano", price: 150000 },
      // ... más productos
    ]
  },
  shippingPolicies: {
    enabled: true,
    freeShippingThreshold: 100000,
    defaultCost: 15000,
    estimatedDays: "2-4 días hábiles"
  }
}
```

## ✅ VENTAJAS DEL DISEÑO

1. **Aislamiento Total**: Cada empresa solo ve sus datos
2. **Escalabilidad**: Agregar empresas no afecta el rendimiento
3. **Personalización**: Cada bot es único para cada empresa
4. **Seguridad**: Imposible acceder a datos de otras empresas
5. **Flexibilidad**: Cada empresa configura lo que necesita
6. **Mantenibilidad**: Un solo código para todas las empresas

## 🚀 DEPLOY MULTI-TENANT

### Variables de Entorno Compartidas:

```env
# Base de datos compartida (PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:5432/saas_db

# API Keys compartidas (todas las empresas usan las mismas)
GROQ_API_KEY=gsk_...
GROQ_API_KEY_2=gsk_...
# etc.

# Configuración global
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://tu-saas.com
```

### Datos por Empresa (en BD):

Cada empresa tiene su propia fila en:
- `users` (cuenta principal)
- `bot_settings` (configuración del bot)
- `payment_config` (métodos de pago)
- `store_settings` (tienda online)
- `products` (catálogo)
- `conversations` (historial)

## 📝 CHECKLIST DE MULTI-TENANCY

- [x] Todos los modelos tienen `userId`
- [x] Queries filtradas por `userId`
- [x] Middleware de autenticación
- [x] Caché por usuario
- [x] Dashboard de configuración
- [x] Bot carga datos dinámicamente
- [x] Aislamiento de datos
- [x] Hot reload de configuración
- [x] Logs por usuario
- [x] Métricas por usuario

---

**Estado:** ✅ SISTEMA COMPLETAMENTE MULTI-TENANT  
**Aislamiento:** 100% por userId  
**Configuración:** Dinámica desde dashboard  
**Escalabilidad:** Ilimitada
