# 🚀 Guía de Despliegue en Easypanel (Optimizado)

Sí, tu proyecto está **100% LISTO y OPTIMIZADO** para Easypanel. 

Hemos configurado:
1.  **Dockerfile**: Optimizado para producción (Puppeteer + Next.js Standalone).
2.  **Arquitectura**: Sistema Híbrido (3 Capas) para máxima velocidad y menor consumo.
3.  **Base de Datos**: Listo para conectar con PostgreSQL de Easypanel.

## 📋 Pasos Rápidos para Desplegar

### 1. Crear Proyecto en Easypanel
- Ve a tu Easypanel.
- Crea un nuevo proyecto (ej: `BotWhatsApp`).
- Crea un servicio tipo **App**.

### 2. Configurar Fuente (Source)
- **Repository**: `daveymena/whatsapp-bot-private` (o tu repo actual).
- **Branch**: `main`.
- **Build Path**: `/` (Raíz).
- **DockerfilePath**: `/Dockerfile` (Déjalo por defecto).

### 3. Variables de Entorno (Environment)
Copia y pega este bloque EXACTO en la pestaña "Environment" de tu servicio en Easypanel. 
**IMPORTANTE**: Reemplaza las claves (`tu_...`) con tus valores reales.

```env
# --- SISTEMA HIBRIDO (OPTIMIZADO) ---
AI_PROVIDER=hybrid
HYBRID_SYSTEM_ENABLED=true
ENABLE_HYBRID_SYSTEM=true
HYBRID_MODE=smart
LOCAL_RESPONSE_PRIORITY=true
AI_USE_REASONING=true

# --- PROVEEDOR IA (GROQ - RECOMENDADO) ---
GROQ_API_KEY=tu_groq_api_key_aqui
GROQ_MODEL=llama-3.1-8b-instant
GROQ_TIMEOUT=30000
GROQ_MAX_TOKENS=800

# --- BASE DE DATOS (POSTGRESQL) ---
# Easypanel te dará esta URL si creas una BD interna, o usa una externa.
DATABASE_URL=postgresql://usuario:password@host:5432/nombre_db

# --- WHATSAPP & SERVER ---
NODE_ENV=production
PORT=3000
WHATSAPP_SESSION_PATH=/app/auth_sessions
NEXT_PUBLIC_APP_URL=https://tu-dominio-easypanel.com

# --- FORMATO ---
USE_FORMATTED_RESPONSES=true
USE_EMOJIS=true
RESPONSE_STYLE=professional

# --- INTELIGENCIA ---
AI_MAX_TOKENS=600
AI_TEMPERATURE=0.7
MEMORY_PERSISTENCE=true
CONTEXT_RETENTION_HOURS=48
ADVANCED_INTENT_DETECTION=true

# --- CONFIGURACIÓN SAAS (MULTI-TENANT) ---
# TUS CREDENCIALES DE PAGO YA NO VAN AQUÍ.
# Se configuran automáticamente en la Base de Datos para cada usuario.
# El sistema usará la configuración de 'admin' si existen los registros en BD.
```


### 4. Volúmenes (Discos Persistentes)
Para evitar tener que escanear el QR cada vez que haces deploy, agrega estos volúmenes en la pestaña "Mounts" o "Volumes":

| Mount Path (Ruta en Contenedor) | Type (Tipo) |
|-------------------|---|
| `/app/auth_sessions` | Volume (Disco) |
| `/app/prisma` | Volume (Disco) *Opcional, para migraciones* |

### 5. ¡Desplegar! 🚀
- Dale clic a **Deploy**.
- Espera unos minutos.
- Abre los logs para ver el código QR y escanéalo.

---

## ✅ Verificación de Estado
Tu bot iniciará en modo **Híbrido Optimizado**:
- **Respuestas Rápidas**: Usará lógica local para saludos y preguntas simples.
- **Inteligencia**: Usará Groq (Llama 3.1) para ventas y consultas complejas.
- **Persistencia**: Recordará el contexto del cliente (producto actual, dudas previas).
