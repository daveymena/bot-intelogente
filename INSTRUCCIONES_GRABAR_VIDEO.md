# 📹 Instrucciones para Grabar el Video Demo

## 🎯 Archivo Creado

**Ubicación:** `public/demo-video.html`

## 🚀 Cómo Usar

### Opción 1: Abrir Directamente
```bash
# Abre el archivo en tu navegador
start public/demo-video.html
```

### Opción 2: Con el Servidor
```bash
# Si tienes el servidor corriendo
npm run dev

# Luego visita:
http://localhost:3000/demo-video.html
```

## 🎬 Controles de la Demo

### Navegación Manual
- **Siguiente ▶**: Avanza a la siguiente escena
- **◀ Anterior**: Retrocede a la escena anterior
- **▶ Auto**: Activa reproducción automática (8 segundos por escena)

### Atajos de Teclado
- `→` o `Espacio`: Siguiente escena
- `←`: Escena anterior
- `Enter`: Activar/pausar modo automático

## 📋 Escenas del Video (7 en total)

1. **Intro** (8 seg)
   - Logo animado
   - Título del producto
   - Descripción breve

2. **Instalación** (8 seg)
   - Terminal con comandos
   - Simulación de instalación
   - Mensajes de éxito

3. **Conexión WhatsApp** (8 seg)
   - Mockup de teléfono
   - Código QR animado
   - Dashboard con estadísticas

4. **Productos** (8 seg)
   - Grid de 6 categorías
   - Iconos animados
   - Descripción de cada tipo

5. **Chat Demo** (12 seg)
   - Conversación real simulada
   - Cliente pregunta por laptop
   - Bot responde inteligentemente
   - Lista de características

6. **Beneficios** (8 seg)
   - 6 beneficios clave
   - Números impactantes
   - Animaciones llamativas

7. **Call to Action** (8 seg)
   - Mensaje final
   - Botón de acción
   - Beneficios resumidos

**Duración Total:** ~60 segundos (1 minuto)

## 🎥 Configuración OBS Studio

### Configuración Recomendada

1. **Resolución de Salida**
   - 1920x1080 (Full HD)
   - 1280x720 (HD) para archivos más ligeros

2. **FPS**
   - 30 FPS (estándar)
   - 60 FPS (más fluido)

3. **Bitrate**
   - 2500-4000 kbps para 1080p
   - 1500-2500 kbps para 720p

### Pasos en OBS

1. **Agregar Fuente**
   - Fuente → Captura de Ventana del Navegador
   - O usar "Navegador" (plugin)

2. **Ajustar Ventana**
   - Presiona F11 en el navegador (pantalla completa)
   - Ajusta el tamaño en OBS

3. **Audio** (Opcional)
   - Puedes agregar narración en vivo
   - O grabar sin audio y agregarlo después

4. **Grabar**
   - Activa modo automático (▶ Auto)
   - Presiona "Iniciar Grabación" en OBS
   - Espera ~60 segundos
   - Detén la grabación

## 🎨 Personalización

### Cambiar Colores
Edita las variables CSS en `demo-video.html`:
```css
/* Gradiente principal */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Color de WhatsApp */
background: #075e54;

/* Color de acento */
color: #25d366;
```

### Cambiar Tiempos
Modifica el intervalo de autoplay:
```javascript
// Línea ~250
autoplayInterval = setInterval(() => {
    nextScene();
}, 8000); // Cambia 8000 a los milisegundos que quieras
```

### Cambiar Conversación del Chat
Edita el array `conversation` en la función `startChatDemo()`:
```javascript
const conversation = [
    { type: 'customer', text: 'Tu mensaje', delay: 500 },
    { type: 'bot', text: 'Respuesta del bot', delay: 2000 },
    // Agrega más mensajes...
];
```

## 📱 Versión para Redes Sociales

### Instagram/TikTok (Vertical 9:16)
Ajusta el viewport en el navegador:
- Abre DevTools (F12)
- Modo responsive
- Dimensiones: 1080x1920

### YouTube Shorts (Vertical)
- Misma configuración que Instagram
- Duración: Máximo 60 segundos ✅

### Facebook/LinkedIn (Horizontal 16:9)
- Configuración por defecto
- Funciona perfectamente

## 🎤 Sugerencias de Narración

### Escena 1 - Intro
> "Conoce Smart Sales Bot Pro, el asistente de ventas con inteligencia artificial que revolucionará tu negocio en WhatsApp"

### Escena 2 - Instalación
> "La instalación es súper simple. Solo tres comandos y estás listo para empezar"

### Escena 3 - WhatsApp
> "Conecta tu WhatsApp escaneando un código QR. En segundos, tu bot estará activo y listo para atender clientes"

### Escena 4 - Productos
> "Importa todos tus productos: laptops, motos, cursos digitales, megapacks y más. Todo desde CSV o JSON"

### Escena 5 - Chat
> "Mira cómo el bot entiende preguntas naturales y recomienda productos inteligentemente, como un vendedor experto"

### Escena 6 - Beneficios
> "Atiende clientes 24/7, responde 10 veces más rápido y ahorra hasta 80% en costos de atención"

### Escena 7 - CTA
> "Empieza ahora mismo. Sin tarjeta de crédito, instalación en 5 minutos y soporte completo en español"

## 🎬 Tips para Mejor Resultado

1. **Usa Pantalla Completa (F11)**
   - Elimina barras del navegador
   - Aspecto más profesional

2. **Graba en Modo Automático**
   - Presiona "▶ Auto" antes de grabar
   - Las transiciones serán suaves

3. **Iluminación**
   - Graba en un cuarto oscuro
   - Los colores se verán más vibrantes

4. **Múltiples Tomas**
   - Graba 2-3 veces
   - Elige la mejor versión

5. **Post-Producción**
   - Agrega música de fondo
   - Ajusta velocidad si es necesario
   - Agrega subtítulos para redes sociales

## 🎵 Música Sugerida (Libre de Derechos)

- **YouTube Audio Library**: "Tech" o "Corporate"
- **Epidemic Sound**: Tracks energéticos
- **Artlist**: Música para tech demos
- **Bensound**: "Sunny", "Energy"

## 📤 Exportar y Compartir

### Formatos Recomendados
- **MP4 (H.264)**: Universal, mejor compatibilidad
- **WebM**: Más ligero para web
- **MOV**: Para edición posterior

### Plataformas
- YouTube: 1080p, 30fps
- Instagram: 1080x1920, 30fps, máx 60seg
- TikTok: 1080x1920, 30fps, máx 60seg
- Facebook: 1080p, 30fps
- LinkedIn: 1080p, 30fps

## ✅ Checklist Pre-Grabación

- [ ] Navegador en pantalla completa (F11)
- [ ] OBS configurado correctamente
- [ ] Audio desactivado (o micrófono listo)
- [ ] Modo automático activado
- [ ] Resolución correcta
- [ ] Espacio en disco suficiente
- [ ] Cerrar notificaciones del sistema

## 🚀 ¡Listo para Grabar!

Abre el archivo y presiona grabar. En 60 segundos tendrás un video profesional de tu producto.

**¿Necesitas ayuda?** Revisa este documento o modifica el HTML según tus necesidades.
