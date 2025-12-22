# 🤖 Guía Completa para Probar el Bot

## ✅ Tareas Completadas

1. ✅ Productos duplicados eliminados (27 eliminados, 79 conservados)
2. ✅ Imágenes asignadas automáticamente a productos
3. ✅ Base de datos actualizada con productos e imágenes
4. ✅ Scripts de prueba creados y funcionando

## 🚀 Cómo Probar el Bot

### Opción 1: Prueba Simulada (Sin WhatsApp)

```bash
# Ejecutar el archivo .bat
probar-bot.bat

# O directamente con npm
npx tsx scripts/probar-bot-respuestas.ts
```

Esto mostrará cómo el bot responde a diferentes consultas sin necesidad de WhatsApp.

### Opción 2: Prueba Real con WhatsApp

#### Paso 1: Iniciar el Sistema
```bash
# Opción A: Usar el archivo .bat
iniciar-whatsapp-real.bat

# Opción B: Comandos manuales
npm run dev
```

#### Paso 2: Acceder al Dashboard
1. Abrir navegador en: `http://localhost:3000`
2. Iniciar sesión con:
   - Email: `admin@tecnovariedades.com`
   - Password: `admin123`

#### Paso 3: Conectar WhatsApp
1. En el dashboard, ir a la sección "WhatsApp"
2. Hacer clic en "Conectar WhatsApp"
3. Escanear el código QR con tu WhatsApp
4. Esperar a que aparezca "Conectado"

#### Paso 4: Probar el Bot
Envía mensajes desde otro teléfono al número conectado:

**Ejemplos de mensajes para probar:**

1. **Saludo inicial:**
   ```
   Hola
   ```
   Respuesta esperada: Saludo amigable del bot

2. **Consulta de laptops:**
   ```
   Tienes laptops ASUS?
   ```
   Respuesta esperada: Lista de laptops ASUS con precios e imágenes

3. **Consulta de precio:**
   ```
   Cuánto cuesta el MacBook?
   ```
   Respuesta esperada: Información del MacBook Pro M4 con precio

4. **Consulta de motos:**
   ```
   Necesito una moto
   ```
   Respuesta esperada: Información de la Bajaj Pulsar

5. **Consulta específica:**
   ```
   Quiero una laptop con Ryzen 7
   ```
   Respuesta esperada: Laptops con procesador Ryzen 7

6. **Consulta de cursos:**
   ```
   Tienes cursos digitales?
   ```
   Respuesta esperada: Información de Mega Packs

## 📊 Verificar Respuestas del Bot

El bot debe:
- ✅ Responder en menos de 3 segundos
- ✅ Mostrar información relevante del producto
- ✅ Incluir precio en formato COP
- ✅ Mencionar disponibilidad de stock
- ✅ Indicar cantidad de imágenes disponibles
- ✅ Usar emojis de forma moderada
- ✅ Ser amigable y profesional

## 🔍 Monitorear el Bot

### Ver Logs en Tiempo Real
```bash
# En la terminal donde corre el servidor
# Verás mensajes como:
[AI] Generando respuesta para: "Hola"
[AI] Respuesta generada: "¡Hola! 👋 Bienvenido..."
[WhatsApp] Mensaje enviado a: +57...
```

### Ver Conversaciones en el Dashboard
1. Ir a la sección "Conversaciones"
2. Ver todas las conversaciones activas
3. Revisar mensajes enviados y recibidos
4. Ver productos mencionados

### Ver Estadísticas
1. Ir a la sección "Estadísticas"
2. Ver:
   - Total de conversaciones
   - Mensajes enviados/recibidos
   - Productos más consultados
   - Tasa de respuesta

## 🛠️ Solución de Problemas

### El bot no responde
1. Verificar que WhatsApp esté conectado
2. Revisar logs en la terminal
3. Verificar que la API de Groq esté configurada en `.env`
4. Reiniciar el servidor

### El bot responde pero sin información de productos
1. Verificar que hay productos en la base de datos:
   ```bash
   npx tsx scripts/probar-bot-respuestas.ts
   ```
2. Si no hay productos, ejecutar:
   ```bash
   limpiar-y-actualizar-productos.bat
   ```

### Las imágenes no se muestran
1. Verificar que las imágenes estén en `public/fotos`
2. Verificar que los productos tengan el campo `images` en la BD
3. Ejecutar:
   ```bash
   npx tsx scripts/limpiar-y-asignar-imagenes.ts
   ```

### El código QR no aparece
1. Verificar que el puerto 3000 esté libre
2. Limpiar sesión anterior:
   ```bash
   resetear-whatsapp.bat
   ```
3. Reiniciar el servidor

## 📝 Ejemplos de Conversaciones Exitosas

### Ejemplo 1: Consulta de Laptop
```
Cliente: Hola, busco una laptop
Bot: ¡Hola! 👋 Encontré 26 laptops disponibles. 
     Te recomiendo:
     
     1. ASUS VivoBook GO 15 - AMD Ryzen 3
        💰 $1.189.000 COP
        📦 5 unidades disponibles
        📸 5 imágenes
     
     ¿Te gustaría más información?
```

### Ejemplo 2: Consulta de Precio
```
Cliente: Cuánto cuesta el MacBook?
Bot: El MacBook Pro M4 Pro Max tiene un precio de 
     $9.799.000 COP. 
     
     Incluye:
     - Chip M4 Pro Max
     - 24GB RAM
     - 512GB SSD
     - Pantalla 14" Retina XDR
     
     Tenemos 2 unidades disponibles. 
     ¿Te interesa? 😊
```

### Ejemplo 3: Intención de Compra
```
Cliente: Quiero comprar una laptop
Bot: ¡Perfecto! 🎉 
     
     Tenemos varias opciones:
     - Laptops desde $1.189.000
     - Gaming desde $3.200.000
     - MacBook desde $9.799.000
     
     ¿Qué tipo de laptop buscas?
```

## 🎯 Métricas de Éxito

Para considerar que el bot funciona correctamente:

- ✅ Tasa de respuesta: > 95%
- ✅ Tiempo de respuesta: < 3 segundos
- ✅ Precisión de información: 100%
- ✅ Satisfacción del cliente: Respuestas amigables
- ✅ Conversiones: Clientes interesados en productos

## 📈 Próximos Pasos

1. **Agregar más productos**
   - Importar catálogo completo
   - Asignar más imágenes
   - Categorizar mejor

2. **Mejorar respuestas**
   - Personalizar prompts de IA
   - Agregar respuestas automáticas
   - Configurar horarios de atención

3. **Integrar pagos**
   - Configurar pasarela de pagos
   - Generar enlaces de pago
   - Confirmar pedidos automáticamente

4. **Analíticas avanzadas**
   - Reportes de ventas
   - Productos más consultados
   - Horarios de mayor actividad

## 🆘 Soporte

Si tienes problemas:
1. Revisar logs en la terminal
2. Verificar archivo `.env`
3. Consultar documentación en los archivos MD
4. Reiniciar el sistema completo

---

**¡El bot está listo para usar! 🚀**
