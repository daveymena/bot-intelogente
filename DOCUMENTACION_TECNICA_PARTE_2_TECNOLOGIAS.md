# 📚 DOCUMENTACIÓN TÉCNICA COMPLETA - PARTE 2: TECNOLOGÍAS

## 🛠️ STACK TECNOLÓGICO COMPLETO

---

## 📦 FRONTEND

### Next.js 15
```json
{
  "version": "15.x",
  "features": [
    "App Router (nuevo sistema de rutas)",
    "Server Components",
    "Server Actions",
    "Streaming SSR",
    "Optimización automática de imágenes"
  ],
  "uso": "Framework principal para el dashboard"
}
```

### TypeScript 5
```json
{
  "version": "5.x",
  "features": [
    "Type safety completo",
    "Decorators",
    "Satisfies operator",
    "Const type parameters"
  ],
  "uso": "Lenguaje principal del proyecto"
}
```

### Tailwind CSS 4
```json
{
  "version": "4.x",
  "features": [
    "JIT compiler",
    "CSS-in-JS",
    "Responsive design",
    "Dark mode support"
  ],
  "uso": "Estilos y diseño responsive"
}
```

### shadcn/ui
```json
{
  "base": "Radix UI primitives",
  "features": [
    "Componentes accesibles",
    "Totalmente customizables",
    "Copy-paste components",
    "Theming system"
  ],
  "componentes": [
    "Button", "Dialog", "Dropdown",
    "Form", "Input", "Select",
    "Table", "Toast", "Tabs"
  ]
}
```

### Framer Motion
```json
{
  "version": "latest",
  "uso": "Animaciones y transiciones",
  "features": [
    "Animaciones declarativas",
    "Gestures",
    "Layout animations",
    "Scroll animations"
  ]
}
```

### Zustand
```json
{
  "version": "latest",
  "uso": "State management global",
  "ventajas": [
    "Ligero (1KB)",
    "Sin boilerplate",
    "TypeScript friendly",
    "DevTools support"
  ]
}
```

### React Hook Form + Zod
```json
{
  "react-hook-form": "Manejo de formularios",
  "zod": "Validación de schemas",
  "features": [
    "Validación en tiempo real",
    "Type-safe",
    "Performance optimizado",
    "Error handling"
  ]
}
```

---

## ⚙️ BACKEND

### Node.js
```json
{
  "version": "18.x o superior",
  "runtime": "JavaScript/TypeScript",
  "uso": "Servidor principal"
}
```

### Express.js
```json
{
  "version": "4.x",
  "uso": "Custom server que envuelve Next.js",
  "features": [
    "Middleware system",
    "Routing",
    "Static files",
    "Error handling"
  ]
}
```

### Socket.IO
```json
{
  "version": "4.x",
  "uso": "Comunicación en tiempo real",
  "features": [
    "WebSocket bidireccional",
    "Fallback a polling",
    "Room support",
    "Broadcasting"
  ],
  "casos_uso": [
    "Estado de conexión de WhatsApp",
    "Notificaciones de mensajes",
    "Updates del dashboard"
  ]
}
```

---

## 💬 WHATSAPP

### @whiskeysockets/baileys
```json
{
  "version": "7.0.0-rc.6",
  "descripcion": "WhatsApp Web API",
  "features": [
    "Multi-device support",
    "QR code authentication",
    "Envío/recepción de mensajes",
    "Envío de medios (imágenes, audio)",
    "Estados de lectura",
    "Typing indicators"
  ],
  "ventajas": [
    "No requiere WhatsApp Business API",
    "Gratis",
    "Open source",
    "Activamente mantenido"
  ]
}
```

### qrcode
```json
{
  "version": "latest",
  "uso": "Generación de QR para autenticación",
  "features": [
    "QR code generation",
    "Multiple formats (SVG, PNG)",
    "Error correction"
  ]
}
```

---

## 🗄️ BASE DE DATOS

### PostgreSQL
```json
{
  "version": "14.x o superior",
  "uso": "Base de datos en producción",
  "features": [
    "ACID compliant",
    "JSON support",
    "Full-text search",
    "Índices avanzados"
  ]
}
```

### SQLite
```json
{
  "version": "3.x",
  "uso": "Base de datos en desarrollo",
  "ventajas": [
    "Sin configuración",
    "Archivo único",
    "Rápido para desarrollo",
    "Compatible con Prisma"
  ]
}
```

### Prisma ORM
```json
{
  "version": "5.x",
  "features": [
    "Type-safe database client",
    "Migrations",
    "Schema management",
    "Query builder",
    "Introspection"
  ],
  "comandos": {
    "generate": "Genera el cliente de Prisma",
    "migrate": "Ejecuta migraciones",
    "studio": "GUI para la base de datos",
    "push": "Sincroniza schema sin migraciones"
  }
}
```

---

## 🤖 INTELIGENCIA ARTIFICIAL

### Groq SDK
```json
{
  "version": "latest",
  "modelo": "llama-3.3-70b-versatile",
  "velocidad": "~500ms por respuesta",
  "costo": "Muy bajo",
  "uso": "IA principal (90% de consultas)",
  "features": [
    "Respuestas rápidas",
    "Contexto largo (32K tokens)",
    "Streaming support",
    "Function calling"
  ]
}
```

### Groq Whisper
```json
{
  "modelo": "whisper-large-v3",
  "uso": "Transcripción de audios",
  "features": [
    "Múltiples idiomas",
    "Alta precisión",
    "Rápido (~1s por audio)",
    "Timestamps"
  ]
}
```

### OpenAI (Fallback)
```json
{
  "version": "4.x SDK",
  "modelos": ["gpt-4", "gpt-3.5-turbo"],
  "uso": "Fallback cuando Groq falla",
  "costo": "Alto"
}
```

### Anthropic Claude (Fallback)
```json
{
  "version": "latest SDK",
  "modelos": ["claude-3-opus", "claude-3-sonnet"],
  "uso": "Fallback secundario",
  "costo": "Medio"
}
```

### Google Gemini (Fallback)
```json
{
  "version": "latest SDK",
  "modelos": ["gemini-pro"],
  "uso": "Fallback terciario",
  "costo": "Bajo"
}
```

---

## 💳 PAGOS

### MercadoPago SDK
```json
{
  "version": "latest",
  "uso": "Generación de links de pago",
  "features": [
    "Payment links",
    "Webhooks",
    "Refunds",
    "Subscriptions"
  ]
}
```

---

## 🖼️ PROCESAMIENTO DE MEDIOS

### Sharp
```json
{
  "version": "latest",
  "uso": "Procesamiento de imágenes",
  "features": [
    "Resize",
    "Crop",
    "Format conversion",
    "Optimization",
    "Metadata extraction"
  ]
}
```

---

## 🌐 WEB SCRAPING

### Puppeteer
```json
{
  "version": "latest",
  "uso": "Scraping de productos de proveedores",
  "features": [
    "Headless browser",
    "Screenshot",
    "PDF generation",
    "Network interception"
  ]
}
```

---

## 🔧 UTILIDADES

### bcryptjs
```json
{
  "uso": "Hash de passwords",
  "features": [
    "Secure hashing",
    "Salt generation",
    "Compare passwords"
  ]
}
```

### jsonwebtoken
```json
{
  "uso": "Autenticación JWT",
  "features": [
    "Token generation",
    "Token verification",
    "Expiration handling"
  ]
}
```

### nodemon
```json
{
  "uso": "Hot reload en desarrollo",
  "features": [
    "Auto-restart",
    "Watch files",
    "Custom scripts"
  ]
}
```

### tsx
```json
{
  "uso": "Ejecutar TypeScript directamente",
  "features": [
    "No compilation needed",
    "Fast execution",
    "ESM support"
  ]
}
```

---

## 📊 DEPENDENCIAS PRINCIPALES

### package.json (Resumen)

```json
{
  "dependencies": {
    "next": "15.x",
    "react": "18.x",
    "typescript": "5.x",
    "@whiskeysockets/baileys": "7.0.0-rc.6",
    "groq-sdk": "latest",
    "prisma": "5.x",
    "@prisma/client": "5.x",
    "socket.io": "4.x",
    "socket.io-client": "4.x",
    "express": "4.x",
    "sharp": "latest",
    "qrcode": "latest",
    "bcryptjs": "latest",
    "jsonwebtoken": "latest",
    "zod": "latest",
    "zustand": "latest",
    "framer-motion": "latest",
    "tailwindcss": "4.x"
  },
  "devDependencies": {
    "nodemon": "latest",
    "tsx": "latest",
    "@types/node": "latest",
    "@types/react": "latest",
    "eslint": "latest",
    "prettier": "latest"
  }
}
```

---

## 🔄 VERSIONES RECOMENDADAS

### Node.js
- **Mínimo:** 18.x
- **Recomendado:** 20.x LTS
- **Máximo probado:** 21.x

### npm
- **Mínimo:** 9.x
- **Recomendado:** 10.x

### PostgreSQL (Producción)
- **Mínimo:** 14.x
- **Recomendado:** 15.x o 16.x

---

## 🌍 VARIABLES DE ENTORNO REQUERIDAS

```env
# Base de Datos
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# IA Principal
GROQ_API_KEY="gsk_..."
GROQ_API_KEY_2="gsk_..." # Backup
GROQ_API_KEY_3="gsk_..." # Backup
GROQ_API_KEY_4="gsk_..." # Backup

# IA Fallback (Opcional)
OPENAI_API_KEY="sk-..."
CLAUDE_API_KEY="sk-ant-..."
GEMINI_API_KEY="..."

# Configuración IA
AI_FALLBACK_ENABLED="true"
GROQ_MODEL="llama-3.3-70b-versatile"

# Pagos
MERCADOPAGO_ACCESS_TOKEN="..."

# Next.js
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:4000"

# Autenticación
JWT_SECRET="tu-secret-super-seguro"

# Otros
NODE_ENV="development" # o "production"
PORT="4000"
```

---

## 📝 PRÓXIMA PARTE

En la **PARTE 3** veremos:
- Instalación paso a paso
- Configuración inicial
- Primer despliegue
- Troubleshooting común

---

**Fecha de creación:** Noviembre 2024  
**Versión:** 1.0.0
