# 🏢 Sistema de Entrenamiento Multi-Tenant

## 📋 Descripción

Sistema de entrenamiento que se adapta automáticamente a cada cliente del SaaS. Cada usuario entrena con sus propios productos y servicios, creando una base de conocimiento personalizada.

## 🎯 Características

### 1. Entrenamiento Personalizado por Usuario
- ✅ Cada cliente entrena solo con sus productos
- ✅ Respuestas adaptadas a su negocio
- ✅ Información de pago/envío personalizada
- ✅ Tono y estilo según configuración

### 2. Catálogo Compartido de Dropshipping
- ✅ Productos de SmartJoys disponibles para todos
- ✅ Los usuarios pueden activarlos en su tienda
- ✅ Información actualizada automáticamente
- ✅ Sin necesidad de agregar productos manualmente

### 3. Adaptable a Cualquier Tipo de Negocio
- ✅ E-commerce (productos físicos)
- ✅ Servicios profesionales
- ✅ Tienda física
- ✅ Dropshipping
- ✅ Productos digitales
- ✅ Citas y reservas

## 🏗️ Arquitectura Multi-Tenant

```
┌─────────────────────────────────────────────────────────┐
│              SISTEMA DE ENTRENAMIENTO                   │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
    ┌────────┐  ┌────────┐  ┌────────┐
    │Usuario1│  │Usuario2│  │Usuario3│
    └────┬───┘  └────┬───┘  └────┬───┘
         │           │           │
         ▼           ▼           ▼
    ┌─────────────────────────────────┐
    │  Productos Propios del Usuario  │
    └─────────────────────────────────┘
         │           │           │
         └───────────┼───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ Catálogo Compartido   │
         │ (Dropshipping)        │
         └───────────────────────┘
```

## 🚀 Uso

### 1. Entrenamiento Automático (Todos los Usuarios)

```bash
# Inicia entrenamiento para todos los usuarios activos
npm run train:24-7
```

El sistema:
1. Obtiene usuarios con suscripción activa
2. Para cada usuario:
   - Entrena preguntas generales (saludo, pago, envío)
   - Entrena con sus productos específicos
   - Guarda respuestas en su base de conocimiento
3. Repite cada 30 minutos

### 2. Entrenamiento Manual (Un Usuario)

```typescript
import { multiTenantTraining } from './src/lib/multi-tenant-training-system';

// Entrenar usuario específico
await multiTenantTraining.trainUser('user_id_aqui');
```

### 3. Catálogo Compartido de Dropshipping

```bash
# Scrapear productos de SmartJoys
npm run scrape:smartjoys

# Importar a catálogo compartido
npm run import:smartjoys

# O hacer ambos
npm run dropship:smartjoys
```

## 📊 Cómo Funciona

### Preguntas Generales (Aplican a Todos)

El sistema genera preguntas universales adaptadas a cada negocio:

```typescript
// Ejemplo: Pregunta de pago
Usuario: "Cómo puedo pagar"

// Para Usuario 1 (E-commerce)
Respuesta: "En [Tienda A] aceptamos Nequi (3001234567), 
Daviplata, MercadoPago y contraentrega."

// Para Usuario 2 (Servicios)
Respuesta: "En [Consultorio B] puedes pagar con transferencia 
bancaria o efectivo en la cita."
```

### Preguntas de Productos (Específicas)

```typescript
// Usuario 1 tiene: "Laptop HP 15"
Usuario: "Busco laptop hp"
Respuesta: "¡Claro! Tenemos la Laptop HP 15 a $1,200,000 COP. 
Ideal para trabajo y estudio. 💻"

// Usuario 2 tiene: "Laptop Dell Inspiron"
Usuario: "Busco laptop"
Respuesta: "¡Perfecto! La Laptop Dell Inspiron está a $1,500,000 COP. 
Excelente rendimiento y garantía. 💻"
```

### Catálogo Compartido

```typescript
// Productos de SmartJoys disponibles para todos
Usuario: "Busco audífonos bluetooth"

// Si el usuario activó productos de SmartJoys:
Respuesta: "¡Tenemos audífonos bluetooth desde $45,000 COP! 
Entrega en 4-5 días hábiles. 🎧"
```

## 🔧 Configuración por Usuario

El sistema lee la configuración de cada usuario:

### 1. Información del Negocio

```typescript
// De User model
businessName: "Mi Tienda"
businessPhone: "3001234567"
businessAddress: "Calle 123, Cali"
businessHours: "Lunes a Viernes 9am-6pm"
```

### 2. Configuración del Bot

```typescript
// De BotSettings model
businessName: "Tecnovariedades D&S"
shippingInfo: "Envíos a toda Colombia, 4-5 días"
warrantyInfo: "Garantía de 30 días"
```

### 3. Métodos de Pago

```typescript
// De PaymentConfig model
nequiEnabled: true
nequiPhone: "3001234567"
daviplataEnabled: true
mercadoPagoEnabled: true
bankTransferEnabled: true
```

### 4. Tipo de Negocio

```typescript
// De SalesFlowConfig model
businessType: "ECOMMERCE" | "DROPSHIPPING" | "SERVICES" | "PHYSICAL_STORE"
dropshippingEnabled: true
deliveryDays: "4-5 días hábiles"
paymentOnDelivery: true
```

## 📦 Catálogo Compartido de Dropshipping

### Productos de SmartJoys

**Categorías disponibles:**
- Tecnología
- Hogar
- Belleza
- Deportes
- Juguetes
- Accesorios

**Características:**
- ✅ Fotos de alta calidad
- ✅ Descripciones completas
- ✅ Precios actualizados
- ✅ Stock en tiempo real
- ✅ Información de envío

### Cómo Activar para un Usuario

```typescript
// Opción 1: Copiar producto a usuario
const sharedProduct = await prisma.product.findFirst({
  where: {
    userId: 'system@smartsalesbot.com',
    name: 'Audífonos Bluetooth'
  }
});

await prisma.product.create({
  data: {
    ...sharedProduct,
    userId: 'user_real_id',
    // Personalizar si es necesario
    price: sharedProduct.price * 1.2 // Agregar margen
  }
});

// Opción 2: Referencia compartida (futuro)
// Agregar campo sharedProductId en schema
```

## 🎯 Ejemplos de Uso

### E-commerce

```typescript
// Usuario vende laptops y celulares
Productos: [
  { name: "Laptop HP 15", price: 1200000 },
  { name: "iPhone 13", price: 2500000 }
]

// Entrenamiento genera:
"Busco laptop" → "Tenemos Laptop HP 15 a $1,200,000..."
"Cuánto cuesta iphone" → "El iPhone 13 está a $2,500,000..."
"Cómo puedo pagar" → "Aceptamos Nequi, Daviplata, MercadoPago..."
```

### Servicios Profesionales

```typescript
// Usuario ofrece consultoría
Productos: [
  { name: "Consultoría 1 hora", price: 150000, category: "SERVICE" },
  { name: "Paquete 5 sesiones", price: 600000, category: "SERVICE" }
]

// Entrenamiento genera:
"Cuánto cuesta consultoría" → "La consultoría de 1 hora cuesta $150,000..."
"Puedo agendar" → "¡Claro! Tenemos disponibilidad de lunes a viernes..."
"Cómo puedo pagar" → "Puedes pagar con transferencia o efectivo..."
```

### Dropshipping

```typescript
// Usuario activa productos de SmartJoys
Productos: [
  { name: "Audífonos Bluetooth", price: 45000, store: "SmartJoys" },
  { name: "Reloj Inteligente", price: 89000, store: "SmartJoys" }
]

// Entrenamiento genera:
"Busco audífonos" → "Tenemos audífonos bluetooth a $45,000. Entrega en 4-5 días..."
"Tienen contraentrega" → "Sí, contraentrega disponible en tu ciudad..."
```

## 📈 Estadísticas por Usuario

```bash
# Ver estadísticas de un usuario
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
p.conversationKnowledge.count({
  where: { userId: 'user_id_aqui' }
}).then(console.log);
"

# Ver respuestas más usadas por usuario
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
p.conversationKnowledge.findMany({
  where: { userId: 'user_id_aqui' },
  orderBy: { usageCount: 'desc' },
  take: 10
}).then(r => console.log(JSON.stringify(r, null, 2)));
"
```

## 🔄 Migración de Base de Datos

```bash
# Generar migración para agregar userId
npx prisma migrate dev --name add_userid_to_knowledge

# Aplicar en producción
npx prisma migrate deploy
```

## 🚀 Deploy en Easypanel

El sistema multi-tenant funciona igual que el sistema básico, pero entrena automáticamente a todos los usuarios activos.

**Variables de entorno adicionales:**

```env
# Filtrar usuarios por plan
TRAIN_ONLY_PAID=false  # true = solo usuarios de pago

# Intervalo de entrenamiento por usuario
TRAIN_USER_INTERVAL=1800000  # 30 minutos

# Máximo de usuarios por ciclo
MAX_USERS_PER_CYCLE=50
```

## 💡 Ventajas del Sistema Multi-Tenant

### Para el SaaS
- ✅ Cada cliente tiene su propia IA entrenada
- ✅ No hay mezcla de datos entre clientes
- ✅ Escalable a miles de usuarios
- ✅ Catálogo compartido reduce trabajo

### Para los Clientes
- ✅ Respuestas personalizadas a su negocio
- ✅ No necesitan entrenar manualmente
- ✅ Acceso a catálogo de dropshipping
- ✅ Mejora continua automática

## 📚 Próximos Pasos

1. **Migrar base de datos:**
   ```bash
   npx prisma migrate dev --name add_userid_to_knowledge
   ```

2. **Scrapear catálogo compartido:**
   ```bash
   npm run dropship:smartjoys
   ```

3. **Iniciar entrenamiento multi-tenant:**
   ```bash
   npm run train:24-7
   ```

4. **Monitorear progreso:**
   ```bash
   npm run train:stats
   ```

---

**Sistema multi-tenant listo para entrenar a todos tus clientes automáticamente! 🏢✨**
