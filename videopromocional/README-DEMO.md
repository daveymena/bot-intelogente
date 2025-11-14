# 🎬 Demo Interactiva - Smart Sales Bot Pro

## 📋 Descripción

Demo interactiva HTML profesional lista para grabar con OBS o cualquier software de captura de pantalla. Muestra el funcionamiento completo del bot con animaciones suaves y efectos profesionales.

## 🚀 Cómo Usar

### Opción 1: Abrir Directamente
1. Abre el archivo `demo-interactiva.html` en tu navegador
2. Presiona F11 para pantalla completa
3. Haz clic en "Comenzar Demo"

### Opción 2: Grabar con OBS
1. Abre OBS Studio
2. Agrega fuente → Ventana
3. Selecciona tu navegador con la demo abierta
4. Configura resolución 1920x1080 (Full HD)
5. Presiona grabar y navega por la demo

### Opción 3: Servidor Local (Recomendado)
```bash
# En la carpeta videopromocional
npx http-server -p 8080

# Luego abre: http://localhost:8080/demo-interactiva.html
```

## 🎮 Controles

- **Clic en botones** → Navegar entre pantallas
- **Flecha Derecha / Espacio** → Siguiente pantalla
- **Flecha Izquierda** → Pantalla anterior
- **Home** → Volver al inicio
- **F11** → Pantalla completa

## 📸 Contenido de la Demo

### Pantalla Intro
- Logo animado
- 3 características principales
- Botón de inicio

### Pantalla 1: Dashboard Principal
- Captura: `Captura de pantalla 2025-11-01 115218.png`
- Muestra el panel de control completo

### Pantalla 2: Conexión WhatsApp
- Captura: `Captura de pantalla 2025-11-01 115252.png`
- Proceso de conexión con QR

### Pantalla 3: Gestión de Productos
- Captura: `Captura de pantalla 2025-11-01 115343.png`
- Administración del catálogo

### Pantalla 4: Configuración de IA
- Captura: `Captura de pantalla 2025-11-01 115409.png`
- Multi-proveedor de IA

### Pantalla 5: Conversación en Vivo
- Captura: `Captura de pantalla 2025-11-01 115443.png`
- Bot respondiendo a clientes

### Pantalla 6: Búsqueda Inteligente
- Captura: `Captura de pantalla 2025-11-01 120520.png`
- Búsqueda semántica de productos

### Pantalla 7: Sistema de Pagos
- Captura: `Captura de pantalla 2025-11-01 120605.png`
- Métodos de pago integrados

### Pantalla 8: BONUS - Catálogo Público
- Captura: `Captura de pantalla 2025-11-01 120637.png`
- Catálogo web gratuito

### Pantalla 9: BONUS - Tienda Personal
- Captura: `Captura de pantalla 2025-11-01 120859.png`
- Tienda online sin costo

### Pantalla 10: Resumen Final
- Captura: `Captura de pantalla 2025-11-01 120921.png`
- Todo lo que incluye el sistema

## 🎨 Características de la Demo

✅ **Animaciones Suaves**
- Fade in/out entre pantallas
- Efectos de zoom y slide
- Transiciones profesionales

✅ **Efectos Visuales**
- Gradientes animados
- Sombras y blur effects
- Badges de BONUS animados

✅ **Navegación Intuitiva**
- Botones flotantes
- Barra de progreso
- Indicador de paso actual

✅ **Responsive**
- Se adapta a cualquier pantalla
- Optimizado para grabación Full HD

✅ **Interactivo**
- Navegación con teclado
- Hover effects
- Smooth scrolling

## 🎥 Tips para Grabar

### Configuración OBS Recomendada
- **Resolución**: 1920x1080 (Full HD)
- **FPS**: 30 o 60
- **Bitrate**: 6000-8000 kbps
- **Encoder**: x264 o NVENC

### Guion Sugerido
1. **Intro (5s)**: "Mira cómo funciona Smart Sales Bot Pro"
2. **Dashboard (10s)**: "Controla todo desde un panel intuitivo"
3. **WhatsApp (8s)**: "Conecta tu número en segundos"
4. **Productos (10s)**: "Gestiona tu catálogo fácilmente"
5. **IA (12s)**: "Múltiples proveedores de inteligencia artificial"
6. **Conversación (15s)**: "El bot responde como un humano"
7. **Búsqueda (10s)**: "Búsqueda inteligente de productos"
8. **Pagos (10s)**: "Múltiples métodos de pago integrados"
9. **Catálogo (12s)**: "BONUS: Catálogo web gratis"
10. **Tienda (12s)**: "BONUS: Tienda online sin costo"
11. **Final (8s)**: "Todo en una sola plataforma"

**Duración Total**: ~2 minutos

### Música de Fondo Sugerida
- Upbeat corporate
- Tech/Innovation
- Energética pero no invasiva
- Volumen: -20dB a -15dB

## 🔧 Personalización

### Cambiar Colores
Edita las variables CSS en el `<style>`:
```css
/* Gradiente principal */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Color de botones */
background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
```

### Auto-Avance
Descomenta en el JavaScript:
```javascript
setInterval(() => {
    if (currentScreen < totalScreens - 1) {
        nextScreen();
    } else {
        restartDemo();
    }
}, 5000); // Cambia cada 5 segundos
```

### Agregar Más Pantallas
1. Duplica una sección `<div class="demo-screen">`
2. Cambia el `id="screenX"` al número siguiente
3. Actualiza `totalScreens` en el JavaScript

## 📱 Compartir

Una vez grabado el video:
- **YouTube**: Título optimizado con keywords
- **Facebook**: Video nativo (mejor alcance)
- **Instagram**: Recorta a 60 segundos para Reels
- **TikTok**: Versión vertical 9:16

## 🆘 Solución de Problemas

**Las imágenes no se ven**
- Verifica que las capturas estén en la misma carpeta
- Los nombres deben coincidir exactamente

**Animaciones lentas**
- Cierra otras pestañas del navegador
- Usa Chrome o Edge (mejor rendimiento)

**No se ve en pantalla completa**
- Presiona F11 en el navegador
- O usa el modo presentación de OBS

## 📞 Soporte

Si necesitas ayuda o personalizaciones adicionales, consulta la documentación principal del proyecto.

---

**¡Listo para grabar tu video profesional! 🎬**
