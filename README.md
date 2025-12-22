# 🤖 Smart Sales Bot Pro

Sistema completo de automatización de ventas por WhatsApp con inteligencia artificial avanzada para **Tecnovariedades D&S**.

## 🌟 Características Principales

### 🧠 Inteligencia Artificial Multinúcleo
- **Múltiples modelos**: Groq (Llama 3.1), GPT-4, Claude, Gemini y Mistral
- **Detección de intenciones**: Reconoce automáticamente qué quiere el cliente
- **Respuestas naturales**: Con emojis y estilo conversacional
- **Modo espera inteligente**: No responde impulsivamente si el cliente duda

### 📱 Bot de WhatsApp Inteligente
- **Respuestas automáticas personalizadas** según palabra clave o intención
- **Sistema de prompts configurables** para diferentes tipos de consultas
- **Integración con productos** para respuestas precisas
- **Gestión de conversaciones** con historial completo

### 🏪 Gestión de Productos
- **Productos físicos y digitales** (motos, laptops, cursos, etc.)
- **Sistema de imágenes** con soporte para múltiples fotos por producto
- **Gestión de stock** para productos físicos
- **Etiquetas y respuestas predefinidas** por producto
- **Importación/Exportación CSV** para gestión masiva

### 📊 Dashboard Web Moderno
- **Diseño inspirado en WhatsApp** con tonos verdes (#25D366)
- **Navegación lateral intuitiva** con todas las secciones
- **Métricas en tiempo real**: mensajes, usuarios, ventas, tasa de respuesta
- **Interfaz responsive** para móviles y desktop

### 🎯 Módulos Principales

1. **Dashboard**: Vista general con estadísticas y actividad reciente
2. **Productos**: Gestión completa del catálogo con imágenes y precios
3. **Prompts IA**: Editor visual para personalizar respuestas del bot
4. **Simulador**: Prueba el funcionamiento del bot en tiempo real
5. **Import/Export**: Gestión masiva mediante archivos CSV/JSON
6. **Conversaciones**: Historial completo de interacciones con clientes
7. **Métricas**: Análisis detallado del rendimiento
8. **Configuración**: Ajustes de API keys y parámetros del bot

## 🎥 Video Demostración

**¡Mira el bot en acción!** 🚀

[![Smart Sales Bot Pro - Demo](https://img.youtube.com/vi/kQclScVbkJg/maxresdefault.jpg)](https://youtu.be/kQclScVbkJg)

👉 **[Ver video completo en YouTube](https://youtu.be/kQclScVbkJg)**

En este video podrás ver:
- ✅ Cómo el bot responde automáticamente a consultas de clientes
- ✅ Búsqueda inteligente de productos
- ✅ Envío automático de fotos y detalles
- ✅ Generación de links de pago dinámicos
- ✅ Conversaciones naturales con IA

## 🚀 Ejemplo de Conversación

```
Cliente: "Hola, ¿tienes disponible la NS160 FI 2020?"

Bot: "¡Hola! 😎 Sí, la Pulsar NS160 FI modelo 2020 está disponible ✅ con papeles al día, mantenimiento recién hecho y lista para rodar 🏍️💨 ¿Quieres que te mande las fotos y el precio actualizado?"

Cliente: "¿Y el curso de piano cuánto vale?"

Bot: "🎹 El curso de piano completo cuesta 💰60.000 COP. Incluye más de 76 clases en HD, acceso de por vida y certificado digital 📜. ¿Te gustaría ver una muestra de las clases?"
```

## 🛠️ Arquitectura Tecnológica

### Frontend
- **Next.js 15** con App Router
- **TypeScript 5** para tipado seguro
- **Tailwind CSS 4** con diseño personalizado
- **shadcn/ui** componentes modernos
- **Framer Motion** para animaciones

### Backend
- **Node.js** con Express
- **Prisma ORM** con SQLite
- **Socket.io** para comunicación en tiempo real
- **Zod** para validación de datos

### Inteligencia Artificial
- **z-ai-web-dev-sdk** para múltiples modelos de IA
- **Groq API** (Llama 3.1) - Principal
- **OpenAI API** (GPT-4) - Opcional
- **Claude API** (Anthropic) - Opcional
- **Gemini API** (Google) - Opcional
- **Mistral API** - Opcional

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd smart-sales-bot-pro
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus API keys
```

4. **Configurar base de datos**
```bash
npm run db:push
```

5. **Poblar datos de ejemplo**
```bash
npx tsx seed.ts
```

6. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

7. **Abrir en navegador**
```
http://localhost:3000
```

## 🔧 Configuración de API Keys

El sistema soporta múltiples proveedores de IA. Configura las API keys en el archivo `.env`:

```env
# Groq (Recomendado - Principal)
GROQ_API_KEY=tu_groq_api_key

# OpenAI (Opcional)
OPENAI_API_KEY=tu_openai_api_key

# Anthropic Claude (Opcional)
CLAUDE_API_KEY=tu_claude_api_key

# Google Gemini (Opcional)
GEMINI_API_KEY=tu_gemini_api_key

# Mistral (Opcional)
MISTRAL_API_KEY=tu_mistral_api_key
```

## 📱 Uso del Simulador

El sistema incluye un simulador de WhatsApp para probar el bot:

1. **Activa/Desactiva el bot** con el interruptor
2. **Selecciona el modelo de IA** que prefieras
3. **Ajusta el tiempo de respuesta** (1-10 segundos)
4. **Envía mensajes de prueba** o usa los mensajes rápidos
5. **Observa las respuestas** generadas por la IA
6. **Cambia entre conversaciones** para simular múltiples clientes

## 📊 Gestión de Productos

### Agregar Productos
1. Ve a la sección **Productos**
2. Haz clic en **Nuevo Producto**
3. Completa la información:
   - Nombre y descripción
   - Precio y moneda
   - Categoría (Físico/Digital/Servicio)
   - Imágenes (URLs separadas por comas)
   - Etiquetas para búsqueda
   - Respuesta automática personalizada

### Importación Masiva
1. Descarga la **plantilla CSV**
2. Edita el archivo con tus productos
3. Usa la función **Importar** en la sección de productos
4. Revisa los resultados y corrige errores si es necesario

## 🎨 Personalización de Prompts

Crea prompts personalizados para diferentes tipos de interacciones:

- **Bienvenida**: Primera impresión del cliente
- **Info Producto**: Respuestas sobre productos específicos
- **Precios**: Información de costos y métodos de pago
- **Soporte**: Ayuda y resolución de problemas
- **Cierre**: Despedida y contacto futuro

### Variables Disponibles
- `{product_name}` - Nombre del producto
- `{price}` - Precio del producto
- `{description}` - Descripción del producto
- `{customer_name}` - Nombre del cliente
- `{business_phone}` - Teléfono del negocio
- `{business_email}` - Email del negocio

## 🔄 Flujo de Trabajo

1. **Cliente envía mensaje** por WhatsApp
2. **Bot detecta intención** (bienvenida, producto, precio, etc.)
3. **Selecciona prompt apropiado** según el contexto
4. **Genera respuesta** con el modelo de IA seleccionado
5. **Procesa respuesta** para hacerla más natural
6. **Envía respuesta** al cliente
7. **Guarda conversación** en la base de datos

## 📈 Métricas y Análisis

El sistema proporciona métricas en tiempo real:
- **Mensajes procesados** hoy
- **Usuarios activos** en el sistema
- **Ventas generadas** a través del bot
- **Tasa de respuesta** del bot
- **Productos más consultados**
- **Conversaciones por día/hora**

## 🛡️ Seguridad y Privacidad

- **Validación de datos** con Zod schemas
- **Sanitización de entradas** para prevenir XSS
- **API keys seguras** en variables de entorno
- **Base de datos local** (SQLite) para mayor control
- **Logs de auditoría** para todas las interacciones

## 🚀 Despliegue

### Producción
```bash
npm run build
npm start
```

### Docker (Opcional)
```bash
docker build -t smart-sales-bot-pro .
docker run -p 3000:3000 smart-sales-bot-pro
```

## 🤝 Contribución

1. Fork del proyecto
2. Crear feature branch (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es propiedad de **Tecnovariedades D&S**. Todos los derechos reservados.

## 🆘 Soporte

Para soporte técnico:
- **Email**: soporte@tecnovariedades.com
- **WhatsApp**: +57 300 123 4567
- **Horario**: Lunes a Sábado 8am-6pm

---

🎉 **¡Gracias por usar Smart Sales Bot Pro!** 

Transforma tu negocio con la potencia de la inteligencia artificial.
