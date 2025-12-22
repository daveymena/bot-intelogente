# 🤖 BOT SUPER INTELIGENTE UNIFICADO

## 🎯 Descripción

Bot de WhatsApp extremadamente completo que unifica lo mejor de dos mundos:

### 🧠 Del Bot Estable (smart-sales)
- ✅ **Transcripción de Audio**: Convierte mensajes de voz a texto con Groq Whisper
- ✅ **IA Ultra Inteligente**: Sistema de razonamiento profundo con múltiples modelos
- ✅ **Groq AI**: Llama 3.1 8B Instant + Llama 3.3 70B Versatile
- ✅ **Sistema de Fotos Inteligente**: Envío automático contextual de imágenes
- ✅ **Hot Reload**: Recarga automática de configuración
- ✅ **Métricas en Tiempo Real**: Estadísticas detalladas de rendimiento
- ✅ **Conexión Ultra Estable**: Sistema de reconexión inteligente
- ✅ **Memoria Conversacional**: Contexto de conversaciones
- ✅ **Respuestas Humanizadas**: Lenguaje natural y emojis

### 🌐 Del Bot con Interfaz (.tar)
- ✅ **Dashboard Web Profesional**: Interfaz Next.js completa
- ✅ **Autenticación de Usuarios**: Sistema de login seguro
- ✅ **Base de Datos Prisma**: SQLite con migraciones
- ✅ **Socket.IO**: Comunicación en tiempo real
- ✅ **Componentes UI Modernos**: shadcn/ui + Tailwind CSS
- ✅ **Gestión de Productos**: CRUD completo
- ✅ **Sistema de Conversaciones**: Historial completo
- ✅ **Métricas Visuales**: Gráficos y estadísticas

## 🚀 Características Principales

### 1. Inteligencia Artificial Avanzada
```javascript
// Sistema de IA con múltiples modelos
- Groq Llama 3.1 8B Instant (ultra rápido, sin rate limits)
- Groq Llama 3.3 70B Versatile (más potente)
- Fallback automático entre modelos
- Razonamiento profundo y contextual
- Comprensión de lenguaje natural
- Corrección automática de errores ortográficos
```

### 2. Procesamiento Multimedia
```javascript
// Transcripción de audio
- Groq Whisper para voz a texto
- Soporte para múltiples formatos
- Procesamiento automático
- Respuestas basadas en transcripción

// Sistema de fotos
- Envío inteligente contextual
- Múltiples imágenes por producto
- Compresión automática
- Gestión de catálogo visual
```

### 3. Interfaz Web Completa
```javascript
// Dashboard profesional
- Panel de control en tiempo real
- Gestión de usuarios y roles
- Configuración de bot
- Visualización de métricas
- Historial de conversaciones
- Gestión de productos
```

### 4. Conexión Ultra Estable
```javascript
// Sistema de reconexión
- Heartbeat cada 10 segundos
- Hasta 100 intentos de reconexión
- Recuperación automática de sesión
- Monitoreo de salud de conexión
- Estrategias múltiples de reconexión
```

## 📦 Instalación

### Requisitos Previos
- Node.js 18+
- npm o yarn
- Cuenta de Groq (para API key)

### Paso 1: Instalar Dependencias
```bash
npm install
```

### Paso 2: Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env y agregar tu GROQ_API_KEY
nano .env
```

### Paso 3: Configurar Base de Datos
```bash
# Generar cliente Prisma
npm run db:generate

# Crear base de datos
npm run db:push

# (Opcional) Poblar con datos de ejemplo
npm run db:seed
```

### Paso 4: Iniciar el Bot
```bash
# Modo desarrollo (con hot reload)
npm run dev

# Modo producción
npm run build
npm start
```

## 🔧 Configuración

### Variables de Entorno Principales

```env
# IA - Groq API
GROQ_API_KEY=gsk_tu_api_key_aqui
GROQ_MODEL=llama-3.1-8b-instant
GROQ_MAX_TOKENS=400

# WhatsApp
WHATSAPP_PROVIDER=baileys
HEARTBEAT_INTERVAL=10000
RECONNECT_ATTEMPTS_MAX=100

# Características
PHOTOS_ENABLED=true
AUDIO_ENABLED=true
AI_ENABLED=true
HOT_RELOAD_ENABLED=true

# Base de Datos
DATABASE_URL="file:./dev.db"

# Autenticación
NEXTAUTH_SECRET="tu-secret-key-aqui"
JWT_SECRET="tu-jwt-secret-aqui"
```

## 📱 Uso

### 1. Conectar WhatsApp
1. Inicia el bot: `npm run dev`
2. Abre el navegador en `http://localhost:3000`
3. Ve a la sección "WhatsApp"
4. Escanea el código QR con tu teléfono
5. ¡Listo! El bot está conectado

### 2. Enviar Mensajes de Texto
El bot responde automáticamente a mensajes de texto usando IA:
```
Cliente: "Hola, ¿tienes laptops disponibles?"
Bot: "¡Hola! 😊 Sí, tenemos laptops disponibles. ¿Qué características buscas?"
```

### 3. Enviar Mensajes de Voz
El bot transcribe automáticamente mensajes de voz:
```
Cliente: [Audio: "Quiero información sobre la moto"]
Bot: "Entiendo que quieres información sobre la moto. Te cuento..."
```

### 4. Solicitar Fotos
El bot envía fotos automáticamente cuando se mencionan productos:
```
Cliente: "Muéstrame fotos de la laptop"
Bot: [Envía 3-5 fotos de laptops disponibles]
```

### 5. Gestionar desde el Dashboard
- Ver conversaciones en tiempo real
- Responder manualmente si es necesario
- Ver métricas y estadísticas
- Configurar productos y respuestas
- Gestionar usuarios

## 🎨 Estructura del Proyecto

```
botexperimento/
├── src/
│   ├── app/              # Páginas Next.js
│   │   ├── api/          # API routes
│   │   ├── login/        # Página de login
│   │   └── dashboard/    # Dashboard principal
│   ├── components/       # Componentes React
│   │   ├── ui/           # Componentes UI base
│   │   └── ...           # Componentes específicos
│   ├── lib/              # Servicios y utilidades
│   │   ├── whatsapp-unified.ts      # Servicio WhatsApp unificado
│   │   ├── groq-ai-fixed.js         # IA Groq
│   │   ├── audio-transcription-service.js  # Transcripción
│   │   ├── ultra-intelligent-system.js     # Sistema inteligente
│   │   ├── enhanced-photo-system.js        # Sistema de fotos
│   │   ├── db.ts                    # Cliente Prisma
│   │   ├── auth.ts                  # Autenticación
│   │   └── socket.ts                # Socket.IO
│   └── hooks/            # React hooks personalizados
├── prisma/
│   └── schema.prisma     # Esquema de base de datos
├── public/               # Archivos estáticos
├── smart-sales/          # Bot estable original (referencia)
├── server.ts             # Servidor custom con Socket.IO
├── package.json          # Dependencias
├── .env                  # Variables de entorno
└── README_BOT_UNIFICADO.md  # Este archivo
```

## 🧪 Testing

### Probar Transcripción de Audio
```bash
# Envía un mensaje de voz al bot
# El bot debería transcribirlo y responder
```

### Probar IA
```bash
# Envía mensajes con errores ortográficos
Cliente: "ola k tal ncsito lapto"
# El bot debería entender y responder correctamente
```

### Probar Fotos
```bash
# Menciona un producto
Cliente: "quiero ver fotos de motos"
# El bot debería enviar fotos automáticamente
```

## 📊 Métricas y Monitoreo

El bot incluye un sistema completo de métricas:

- **Mensajes Recibidos**: Total de mensajes entrantes
- **Mensajes Procesados**: Mensajes respondidos
- **Mensajes de Audio**: Transcripciones realizadas
- **Respuestas de IA**: Respuestas generadas por IA
- **Tiempo de Respuesta**: Promedio de tiempo de respuesta
- **Errores**: Contador de errores
- **Uptime**: Tiempo de actividad del bot

Accede a las métricas en: `http://localhost:3000/dashboard/metrics`

## 🔒 Seguridad

- ✅ Autenticación con NextAuth
- ✅ JWT para sesiones
- ✅ Bcrypt para contraseñas
- ✅ Variables de entorno para secretos
- ✅ Validación con Zod
- ✅ Rate limiting en API

## 🚀 Despliegue

### Vercel (Recomendado para interfaz web)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

### Render (Recomendado para bot completo)
1. Conecta tu repositorio en Render
2. Configura las variables de entorno
3. Despliega automáticamente

### Docker
```bash
# Construir imagen
docker build -t bot-super-inteligente .

# Ejecutar contenedor
docker run -p 3000:3000 --env-file .env bot-super-inteligente
```

## 🤝 Contribución

Este es un proyecto unificado que combina dos bots. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📝 Licencia

MIT License - Siéntete libre de usar este bot para tus proyectos

## 🆘 Soporte

Si tienes problemas:

1. Revisa que todas las variables de entorno estén configuradas
2. Verifica que tienes una API key válida de Groq
3. Asegúrate de que el puerto 3000 esté disponible
4. Revisa los logs en la consola

## 🎉 Características Futuras

- [ ] Soporte para más modelos de IA (GPT-4, Claude, Gemini)
- [ ] Sistema de pagos integrado (Stripe, MercadoPago)
- [ ] Multi-idioma
- [ ] Análisis de sentimientos
- [ ] Chatbot con aprendizaje automático
- [ ] Integración con CRM
- [ ] API REST completa
- [ ] App móvil

---

**¡Disfruta de tu Bot Super Inteligente Unificado!** 🚀🤖
