# Configuración para Exportar a Otro Bot

## 1. APIs de Groq

### Obtener API Key
1. Visita: https://console.groq.com/keys
2. Crea una cuenta gratuita
3. Genera una nueva API Key
4. Límites gratuitos: 30 requests/minuto, 6000 tokens/minuto

### Configuración en .env
```env
# Groq AI (Principal)
GROQ_API_KEY=gsk_tu_api_key_aqui
GROQ_MODEL=llama-3.1-70b-versatile
GROQ_MAX_TOKENS=2000
GROQ_TEMPERATURE=0.7

# Rotación de APIs (Opcional - para más límites)
GROQ_API_KEY_1=gsk_primera_key
GROQ_API_KEY_2=gsk_segunda_key
GROQ_API_KEY_3=gsk_tercera_key
```

### Modelos Disponibles en Groq
- `llama-3.1-70b-versatile` - Mejor para conversaciones (recomendado)
- `llama-3.1-8b-instant` - Más rápido, menos preciso
- `mixtral-8x7b-32768` - Contexto largo
- `gemma2-9b-it` - Alternativa rápida

### Código de Integración Groq
```typescript
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function chatWithGroq(message: string, context: string = '') {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Eres un asistente de ventas profesional en español."
        },
        {
          role: "user",
          content: message
        }
      ],
      model: process.env.GROQ_MODEL || "llama-3.1-70b-versatile",
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 1,
      stream: false
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error Groq:', error);
    throw error;
  }
}
```

---

## 2. Configuración de Ollama (IA Local Gratis)

### Instalación de Ollama

#### Windows
```bash
# Descargar desde: https://ollama.com/download
# O usar winget:
winget install Ollama.Ollama
```

#### Linux/Mac
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Modelos Recomendados
```bash
# Instalar modelos (ejecutar en terminal)
ollama pull llama3.1:8b        # Rápido, 4.7GB
ollama pull gemma2:9b          # Muy rápido, 5.5GB
ollama pull qwen2.5:7b         # Excelente español, 4.7GB
ollama pull mistral:7b         # Alternativa, 4.1GB

# Verificar modelos instalados
ollama list
```

### Configuración en .env
```env
# Ollama (IA Local Gratis)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
OLLAMA_ENABLED=true
OLLAMA_TIMEOUT=30000

# Para servidor remoto
# OLLAMA_BASE_URL=http://tu-servidor:11434
```

### Código de Integración Ollama
```typescript
interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

async function chatWithOllama(message: string, context: string = '') {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const model = process.env.OLLAMA_MODEL || 'llama3.1:8b';

  try {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: `Contexto: ${context}\n\nUsuario: ${message}\n\nAsistente:`,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40,
          num_predict: 500
        }
      }),
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data: OllamaResponse = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error Ollama:', error);
    throw error;
  }
}
```

### Sistema Híbrido (Ollama + Groq con Fallback)
```typescript
async function chatHibrido(message: string, useLocal: boolean = true) {
  // Intentar primero con Ollama (gratis)
  if (useLocal && process.env.OLLAMA_ENABLED === 'true') {
    try {
      return await chatWithOllama(message);
    } catch (error) {
      console.log('Ollama falló, usando Groq...');
    }
  }

  // Fallback a Groq
  return await chatWithGroq(message);
}
```

---

## 3. Configuración de PostgreSQL

### Instalación Local

#### Windows
```bash
# Descargar desde: https://www.postgresql.org/download/windows/
# O usar Chocolatey:
choco install postgresql
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Mac
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Crear Base de Datos
```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE smart_sales_bot;

# Crear usuario
CREATE USER bot_user WITH PASSWORD 'tu_password_seguro';

# Dar permisos
GRANT ALL PRIVILEGES ON DATABASE smart_sales_bot TO bot_user;

# Salir
\q
```

### Configuración en .env
```env
# PostgreSQL (Producción)
DATABASE_URL="postgresql://bot_user:tu_password_seguro@localhost:5432/smart_sales_bot?schema=public"

# O para desarrollo con SQLite
# DATABASE_URL="file:./dev.db"
```

### PostgreSQL en la Nube (Gratis)

#### Supabase (Recomendado)
1. Visita: https://supabase.com
2. Crea proyecto gratis
3. Copia la connection string
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

#### Neon (Alternativa)
1. Visita: https://neon.tech
2. Crea proyecto gratis
3. Copia la connection string
```env
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb"
```

#### Railway (Alternativa)
1. Visita: https://railway.app
2. Crea proyecto PostgreSQL
3. Copia la connection string
```env
DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:7432/railway"
```

### Schema Prisma Básico
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  conversations Conversation[]
}

model Conversation {
  id        String   @id @default(cuid())
  userId    String
  phone     String
  messages  Json[]
  context   Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([phone])
}

model Product {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Float
  category    String?
  images      String[]
  stock       Int      @default(0)
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([category])
  @@index([active])
}
```

### Comandos Prisma
```bash
# Instalar Prisma
npm install prisma @prisma/client

# Inicializar Prisma
npx prisma init

# Generar cliente
npx prisma generate

# Crear migración
npx prisma migrate dev --name init

# Aplicar migraciones en producción
npx prisma migrate deploy

# Abrir Prisma Studio (GUI)
npx prisma studio

# Reset database
npx prisma migrate reset
```

### Código de Conexión Prisma
```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Uso
import { prisma } from './lib/db';

async function getProducts() {
  return await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' }
  });
}
```

---

## 4. Configuración Completa .env

```env
# ============================================
# CONFIGURACIÓN COMPLETA PARA OTRO BOT
# ============================================

# --- Base de Datos ---
DATABASE_URL="postgresql://user:password@localhost:5432/bot_db"

# --- Groq AI (Principal) ---
GROQ_API_KEY=gsk_tu_api_key_aqui
GROQ_MODEL=llama-3.1-70b-versatile
GROQ_MAX_TOKENS=2000
GROQ_TEMPERATURE=0.7

# --- Ollama (Local Gratis) ---
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
OLLAMA_ENABLED=true
OLLAMA_TIMEOUT=30000

# --- Sistema Híbrido ---
AI_FALLBACK_ENABLED=true
USE_LOCAL_FIRST=true

# --- Aplicación ---
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# --- Seguridad ---
JWT_SECRET=tu_secreto_super_seguro_aqui
SESSION_SECRET=otro_secreto_diferente

# --- WhatsApp (Opcional) ---
WHATSAPP_SESSION_PATH=./auth_sessions
WHATSAPP_AUTO_RECONNECT=true

# --- Logs ---
LOG_LEVEL=info
ENABLE_DEBUG=false
```

---

## 5. Instalación Rápida

### package.json (Dependencias Mínimas)
```json
{
  "dependencies": {
    "@prisma/client": "^5.7.0",
    "groq-sdk": "^0.3.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "prisma": "^5.7.0",
    "typescript": "^5.3.3",
    "@types/node": "^20.10.0"
  },
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  }
}
```

### Instalación
```bash
# 1. Instalar dependencias
npm install

# 2. Configurar .env
cp .env.example .env
# Editar .env con tus credenciales

# 3. Instalar Ollama
# Descargar de https://ollama.com/download

# 4. Descargar modelo Ollama
ollama pull llama3.1:8b

# 5. Configurar base de datos
npx prisma generate
npx prisma migrate dev

# 6. Iniciar
npm run dev
```

---

## 6. Verificación

### Test Groq
```bash
node -e "
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: 'tu_key' });
groq.chat.completions.create({
  messages: [{ role: 'user', content: 'Hola' }],
  model: 'llama-3.1-70b-versatile'
}).then(r => console.log(r.choices[0].message.content));
"
```

### Test Ollama
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Hola, ¿cómo estás?",
  "stream": false
}'
```

### Test PostgreSQL
```bash
psql -U bot_user -d smart_sales_bot -c "SELECT version();"
```

---

## 7. Costos y Límites

### Groq (Gratis)
- ✅ 30 requests/minuto
- ✅ 6,000 tokens/minuto
- ✅ Sin tarjeta de crédito
- ⚠️ Límite diario: ~8,640 requests

### Ollama (Gratis)
- ✅ 100% gratis
- ✅ Sin límites
- ✅ Funciona offline
- ⚠️ Requiere 8GB RAM mínimo

### PostgreSQL (Gratis)
- Supabase: 500MB, 2 proyectos
- Neon: 3GB, 10 proyectos
- Railway: 500MB, $5 crédito inicial

---

## 8. Recomendaciones

1. **Usa Ollama primero** (gratis, sin límites)
2. **Groq como fallback** (cuando Ollama falle)
3. **PostgreSQL en la nube** (Supabase o Neon)
4. **Monitorea límites** de Groq
5. **Cachea respuestas** comunes

¡Listo para implementar! 🚀
