# 🚀 Guía Completa: Probar Sistema Multi-Agente Localmente

## 📋 Requisitos Previos

1. ✅ Docker Desktop instalado y corriendo
2. ✅ Node.js instalado
3. ✅ Git instalado

## 🎯 Paso 1: Iniciar PostgreSQL Local

### Opción A: Con Docker (Recomendado)

```bash
# 1. Asegúrate de que Docker Desktop esté corriendo
# Verifica con:
docker --version

# 2. Inicia PostgreSQL
docker-compose -f docker-compose.local.yml up -d

# 3. Verifica que esté corriendo
docker ps

# Deberías ver: bot-whatsapp-postgres-local
```

### Opción B: PostgreSQL Instalado Localmente

Si ya tienes PostgreSQL instalado:

```bash
# Crear base de datos
psql -U postgres
CREATE DATABASE whatsappdb;
\q
```

## 🎯 Paso 2: Configurar Prisma

```bash
# 1. Generar cliente de Prisma
npx prisma generate

# 2. Aplicar esquema a la base de datos
npx prisma db push

# 3. Verificar que las tablas se crearon
npx prisma studio
# Esto abre un navegador con la interfaz de Prisma Studio
```

## 🎯 Paso 3: Cargar Productos de Prueba

```bash
# Ejecutar script de seed
npx tsx scripts/seed-products.ts
```

**Salida esperada:**
```
🌱 Iniciando seed de productos...
✅ Usuario encontrado: cmjg5dann0000km6ommqqk7x5
📦 Insertando 5 productos...
  ✅ MegaPack Golden - $60,000 COP
  ✅ MEGA PACK COMPLETO - 81 Cursos Profesionales - $60,000 COP
  ✅ Mega Pack 02: Cursos Microsoft Office - $20,000 COP
  ✅ Impresora Brother Multifuncional MFC-T4500DW - $3,049,900 COP
  ✅ Portátil Asus Vivobook Go - $1,899,900 COP

✅ Seed completado!
📊 Total de productos en BD: 5
```

## 🎯 Paso 4: Probar el Sistema Multi-Agente

### Crear Script de Prueba

```typescript
// test-agent-system.ts
import { routeMessage } from './src/lib/bot/core/agentRouter';

async function testAgentSystem() {
  // Reemplaza con tu userId real de la BD
  const userId = 'cmjg5dann0000km6ommqqk7x5';
  const customerPhone = '573001234567';
  
  const tests = [
    {
      message: 'Hola, buenos días',
      expected: 'Saludo'
    },
    {
      message: '¿Cuánto cuesta el MegaPack Golden?',
      expected: 'Consulta de precio'
    },
    {
      message: 'Quiero comprar cursos de programación',
      expected: 'Intención de compra'
    },
    {
      message: '¿Tienen laptops disponibles?',
      expected: 'Consulta de disponibilidad'
    },
    {
      message: 'Necesito una impresora',
      expected: 'Búsqueda de producto'
    }
  ];
  
  console.log('🤖 Probando Sistema Multi-Agente\n');
  console.log('='.repeat(60));
  
  for (const test of tests) {
    console.log(`\n📱 Cliente: "${test.message}"`);
    console.log(`🎯 Esperado: ${test.expected}`);
    console.log('-'.repeat(60));
    
    try {
      const response = await routeMessage(userId, customerPhone, test.message);
      console.log(`🤖 Bot: ${response}`);
    } catch (error: any) {
      console.error(`❌ Error: ${error.message}`);
    }
    
    console.log('='.repeat(60));
    
    // Esperar 2 segundos entre mensajes
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n✅ Pruebas completadas!');
}

testAgentSystem().catch(console.error);
```

### Ejecutar Pruebas

```bash
npx tsx test-agent-system.ts
```

## 🎯 Paso 5: Ver Resultados en Prisma Studio

```bash
npx prisma studio
```

Navega a:
- **conversations** - Ver conversaciones creadas
- **messages** - Ver mensajes entrantes y salientes
- **products** - Ver productos cargados

## 📊 Verificar Clasificación de Intenciones

El sistema debería detectar:

| Mensaje | Intención Detectada | Agente |
|---------|---------------------|--------|
| "Hola" | `saludo` | Sales |
| "¿Cuánto cuesta?" | `consulta_precio` | Sales |
| "Quiero comprar" | `compra` | Sales |
| "¿Tienen disponible?" | `consulta_disponibilidad` | Sales |
| "Tengo un problema" | `soporte` | Support |

## 🔍 Debugging

### Ver Logs Detallados

El sistema imprime logs en consola:

```
[AgentRouter] Procesando mensaje de 573001234567
[AgentRouter] Intención detectada: consulta_precio (95%)
[AgentRouter] Enrutando a agente: sales
```

### Verificar Conexión a BD

```bash
npx tsx scripts/test-prisma-connection.js
```

### Ver Productos en BD

```bash
npx prisma studio
# O con SQL directo:
docker exec -it bot-whatsapp-postgres-local psql -U postgres -d whatsappdb -c "SELECT name, price FROM products LIMIT 5;"
```

## 🎨 Ejemplos de Conversaciones Esperadas

### Ejemplo 1: Consulta de Precio

```
Cliente: ¿Cuánto cuesta el MegaPack Golden?

Bot: ¡Hola! 👋 El MegaPack Golden es una excelente opción.

Te incluye:
- MegaPack Golden: $60,000 COP
  💥 ¡Una colección ÉPICA con más de 1000 cursos de alto valor!

¿Te gustaría saber más detalles o proceder con la compra? 😊
```

### Ejemplo 2: Búsqueda de Producto

```
Cliente: Necesito una laptop

Bot: ¡Perfecto! Tengo estas laptops disponibles:

1. Portátil Asus Vivobook Go - $1,899,900 COP
   Ryzen 5-7520u, 16GB RAM, 512GB SSD, Pantalla 15.6" OLED

¿Cuál te interesa? También puedo darte más información sobre especificaciones técnicas. 💻
```

### Ejemplo 3: Intención de Compra

```
Cliente: Quiero comprar el MEGA PACK COMPLETO

Bot: ¡Excelente elección! 🎉

MEGA PACK COMPLETO - 81 Cursos Profesionales
Precio: $60,000 COP

✅ Acceso de por vida
✅ Actualizaciones incluidas
✅ Entrega inmediata por Google Drive

Puedes pagar con:
💳 Mercado Pago: [link]
💰 PayPal: [link]

¿Con cuál método prefieres pagar? 😊
```

## 🐛 Solución de Problemas

### Error: "Docker no está corriendo"

```bash
# Windows: Abre Docker Desktop
# Mac: Abre Docker Desktop
# Linux: sudo systemctl start docker
```

### Error: "Cannot connect to database"

```bash
# Verifica que PostgreSQL esté corriendo
docker ps

# Si no está, inícialo
docker-compose -f docker-compose.local.yml up -d

# Verifica logs
docker logs bot-whatsapp-postgres-local
```

### Error: "Prisma Client not generated"

```bash
npx prisma generate
```

### Error: "Table does not exist"

```bash
npx prisma db push
```

## 📈 Métricas del Sistema

Después de probar, puedes ver estadísticas:

```typescript
import { getRouterStats } from './src/lib/bot/core/agentRouter';

const stats = await getRouterStats(userId, 7);
console.log(stats);
```

## 🚀 Siguiente Paso: Deploy a EasyPanel

Una vez que funcione localmente, actualiza `.env` para producción:

```env
# .env.production
DATABASE_URL="postgresql://postgres:67I5320D@ollama_postgres-whatsapp:5432/whatsappdb"
GROQ_API_KEY=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
NODE_ENV=production
```

Luego:

```bash
git add .
git commit -m "feat: sistema multi-agente funcionando"
git push origin main
```

EasyPanel detectará los cambios y hará deploy automáticamente.

## ✅ Checklist Final

- [ ] Docker corriendo
- [ ] PostgreSQL local iniciado
- [ ] Prisma generado (`npx prisma generate`)
- [ ] Esquema aplicado (`npx prisma db push`)
- [ ] Productos cargados (`npx tsx scripts/seed-products.ts`)
- [ ] Pruebas ejecutadas (`npx tsx test-agent-system.ts`)
- [ ] Resultados verificados en Prisma Studio
- [ ] Sistema funcionando correctamente

¡Listo para producción! 🎉
