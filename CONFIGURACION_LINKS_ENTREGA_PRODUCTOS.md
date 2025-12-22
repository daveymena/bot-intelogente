# 🎯 CONFIGURACIÓN DE LINKS DE ENTREGA - CURSO PIANO Y MEGAPACK

## 📦 Productos Configurados

### 1. Curso Completo de Piano
**Link de entrega:** https://drive.google.com/drive/folders/1fhzQ30sJZRUHJ-qCoIwDPxOZfjL2eZ4m?usp=sharing

**Precio:** $65.000 COP

**Métodos de pago:**
- MercadoPago
- PayPal
- Nequi
- Daviplata

### 2. Megapack de 40 Cursos
**Link de entrega:** https://1024terabox.com/s/1V1uSSVPIt5-FXkGEWtk_Lw
**Código de extracción:** ifq5

**Precio:** $60.000 COP

**Métodos de pago:**
- MercadoPago
- PayPal
- Nequi
- Daviplata

## 🔧 Configuración en Base de Datos

Los links se deben agregar en el campo `deliveryInfo` de cada producto en la base de datos.

### SQL para actualizar:

```sql
-- Curso de Piano
UPDATE products 
SET "deliveryInfo" = '{"type":"google_drive","link":"https://drive.google.com/drive/folders/1fhzQ30sJZRUHJ-qCoIwDPxOZfjL2eZ4m?usp=sharing","instructions":"Accede al link con tu cuenta de Gmail. Tendrás acceso de por vida a todo el contenido."}'
WHERE name LIKE '%Piano%' AND category = 'DIGITAL';

-- Megapack de 40 Cursos
UPDATE products 
SET "deliveryInfo" = '{"type":"terabox","link":"https://1024terabox.com/s/1V1uSSVPIt5-FXkGEWtk_Lw","extractionCode":"ifq5","instructions":"1. Abre el link\n2. Ingresa el código: ifq5\n3. Descarga los cursos\n4. Acceso de por vida"}'
WHERE name LIKE '%Mega Pack%' AND name LIKE '%40%';
```

## 📧 Formato de Email de Entrega

### Para Curso de Piano:

```
Asunto: ✅ Tu Curso Completo de Piano está listo!

Hola [NOMBRE],

¡Gracias por tu compra! 🎹

Tu Curso Completo de Piano ya está disponible:

🔗 ACCEDE AQUÍ:
https://drive.google.com/drive/folders/1fhzQ30sJZRUHJ-qCoIwDPxOZfjL2eZ4m?usp=sharing

📝 INSTRUCCIONES:
1. Abre el link con tu cuenta de Gmail
2. Tendrás acceso a todas las lecciones
3. Puedes ver online o descargar
4. Acceso de por vida ✅

🎓 CONTENIDO INCLUIDO:
- Más de 100 lecciones en video
- Desde nivel básico hasta avanzado
- Partituras y ejercicios
- Soporte incluido

¿Necesitas ayuda? Responde este correo.

¡Disfruta tu curso! 🎹
Tecnovariedades D&S
```

### Para Megapack de 40 Cursos:

```
Asunto: ✅ Tu Megapack de 40 Cursos está listo!

Hola [NOMBRE],

¡Gracias por tu compra! 🎓

Tu Megapack de 40 Cursos ya está disponible:

🔗 ACCEDE AQUÍ:
https://1024terabox.com/s/1V1uSSVPIt5-FXkGEWtk_Lw

🔑 CÓDIGO DE EXTRACCIÓN: ifq5

📝 INSTRUCCIONES:
1. Abre el link
2. Ingresa el código: ifq5
3. Descarga los cursos que necesites
4. Acceso de por vida ✅

🎓 CONTENIDO INCLUIDO:
40 cursos completos en diversas áreas:
- Diseño Gráfico
- Programación
- Marketing Digital
- Idiomas
- Fotografía
- Y mucho más!

¿Necesitas ayuda? Responde este correo.

¡Disfruta tus cursos! 🚀
Tecnovariedades D&S
```

## 🤖 Respuestas del Bot Configuradas

### Cuando preguntan por el Curso de Piano:

```
🎹 *Curso Completo de Piano*

Aprende piano desde cero hasta nivel avanzado con más de 100 lecciones en video.

📚 *Contenido:*
• Nivel básico: Postura, lectura de partituras, primeras melodías
• Nivel intermedio: Acordes, escalas, técnicas avanzadas
• Nivel avanzado: Piezas clásicas, improvisación, composición

🎯 *Incluye:*
✅ Más de 100 lecciones en video HD
✅ Partituras y ejercicios descargables
✅ Acceso de por vida
✅ Soporte incluido

💰 *Precio:* $65.000 COP

📦 *Entrega:* Inmediata por Google Drive

¿Te gustaría comprarlo? 😊
```

### Cuando preguntan por el Megapack:

```
🎓 *Megapack de 40 Cursos Completos*

Accede a 40 cursos profesionales en diversas áreas por un precio increíble.

📚 *Áreas incluidas:*
• Diseño Gráfico (Photoshop, Illustrator, etc.)
• Programación (Python, JavaScript, etc.)
• Marketing Digital
• Idiomas (Inglés, Francés, etc.)
• Fotografía y Video
• Desarrollo Personal
• Y mucho más!

🎯 *Incluye:*
✅ 40 cursos completos
✅ Cientos de horas de contenido
✅ Acceso de por vida
✅ Actualizaciones incluidas

💰 *Precio:* $60.000 COP (¡Solo $1.500 por curso!)

📦 *Entrega:* Inmediata por TeraBox

¿Te gustaría comprarlo? 😊
```

### Después de confirmar el pago:

```
✅ *¡Pago confirmado!*

Tu [PRODUCTO] ya está disponible 🎉

📧 *Revisa tu correo:*
Te enviamos un email con:
• Link de acceso directo
• Instrucciones paso a paso
• Código de extracción (si aplica)

⚠️ *Importante:*
Si no ves el correo, revisa tu carpeta de SPAM

🕐 *Tiempo de entrega:*
Inmediato (máximo 5 minutos)

¿Necesitas ayuda? Estoy aquí para asistirte 😊
```

## 🎯 Flujo Completo de Venta

### 1. Saludo
```
Cliente: "Hola"
Bot: "¡Hola! 😊 Bienvenido a Tecnovariedades D&S

Tenemos cursos digitales de alta calidad:
🎹 Curso Completo de Piano - $65.000
🎓 Megapack de 40 Cursos - $60.000

¿Cuál te interesa?"
```

### 2. Información del Producto
```
Cliente: "El curso de piano"
Bot: [Muestra información completa del curso]
```

### 3. Métodos de Pago
```
Cliente: "Cómo puedo pagar?"
Bot: "Perfecto! 💳 Puedes pagarlo por:

💳 MercadoPago - Tarjeta, PSE o efectivo
🌐 PayPal - Tarjeta internacional
📱 Nequi - Transferencia móvil
📱 Daviplata - Transferencia móvil

¿Con cuál prefieres continuar?"
```

### 4. Generación de Link
```
Cliente: "MercadoPago"
Bot: "¡Perfecto! 💳 Aquí está tu link de pago:

[LINK DE MERCADOPAGO]

Una vez pagues, recibirás el curso inmediatamente en tu correo ✅"
```

### 5. Confirmación y Entrega
```
[Sistema detecta pago confirmado]
Bot: "✅ ¡Pago confirmado!

Tu Curso de Piano ya está disponible 🎉

📧 Revisa tu correo: [EMAIL]
Te enviamos el link de acceso directo

¿Necesitas ayuda? Estoy aquí 😊"
```

## 🛡️ Manejo de Objeciones

### "Está caro"
```
Bot: "Entiendo tu preocupación 😊

Déjame mostrarte el valor:

🎹 Curso de Piano: $65.000
• Más de 100 lecciones = $650 por lección
• Acceso de por vida
• Un curso presencial cuesta $500.000+

🎓 Megapack: $60.000
• 40 cursos completos = $1.500 por curso
• Valor real: $2.000.000+
• Ahorro del 97%

Además, puedes pagar en cuotas con MercadoPago 💳

¿Te gustaría aprovechar esta oferta?"
```

### "¿Es confiable?"
```
Bot: "¡Totalmente confiable! ✅

🔒 *Garantías:*
• Entrega inmediata después del pago
• Acceso de por vida garantizado
• Soporte incluido
• Cientos de clientes satisfechos

📧 *Entrega segura:*
• Google Drive (Curso Piano)
• TeraBox (Megapack)
• Links permanentes

💯 *Garantía de satisfacción:*
Si tienes algún problema, lo resolvemos inmediatamente

¿Listo para empezar? 😊"
```

### "¿Cómo sé que recibiré el curso?"
```
Bot: "Excelente pregunta! 😊

📧 *Proceso de entrega:*
1. Realizas el pago
2. Sistema confirma automáticamente
3. Recibes email inmediato con el link
4. Accedes al curso al instante

⏱️ *Tiempo:* Máximo 5 minutos

🔒 *Seguridad:*
• Links permanentes
• Acceso de por vida
• No se pueden revocar

✅ *Garantía:*
Si no recibes el curso, te devolvemos tu dinero

¿Procedemos con la compra? 💳"
```

## 📊 Preguntas Frecuentes (FAQ)

### "¿Cuánto dura el acceso?"
```
Bot: "El acceso es DE POR VIDA ✅

Una vez compres, el curso es tuyo para siempre:
• Sin límite de tiempo
• Sin renovaciones
• Sin pagos adicionales

Puedes verlo cuando quieras, las veces que quieras 😊"
```

### "¿Puedo descargarlo?"
```
Bot: "¡Sí! Puedes descargar todo el contenido 📥

🎹 Curso de Piano (Google Drive):
• Descarga videos
• Descarga partituras
• Descarga ejercicios

🎓 Megapack (TeraBox):
• Descarga los 40 cursos
• Guarda en tu computador
• Acceso offline

Todo el contenido es tuyo para siempre ✅"
```

### "¿Tiene certificado?"
```
Bot: "Los cursos incluyen certificado de finalización 🎓

Al completar el curso, recibes:
✅ Certificado digital
✅ Con tu nombre
✅ Descargable en PDF
✅ Válido para tu portafolio

¿Te gustaría empezar? 😊"
```

## ✅ Checklist de Preparación

- [x] Links de entrega configurados
- [x] Precios definidos ($65.000 y $60.000)
- [x] Métodos de pago listos
- [x] Respuestas del bot preparadas
- [x] Manejo de objeciones configurado
- [x] FAQ completo
- [x] Emails de entrega diseñados
- [ ] **Actualizar productos en base de datos**
- [ ] **Probar flujo completo**
- [ ] **Verificar envío de emails**

## 🚀 Próximos Pasos

1. **Actualizar base de datos:**
   ```bash
   # Ejecutar script de actualización
   npx tsx scripts/update-delivery-links.ts
   ```

2. **Probar flujo completo:**
   ```bash
   # Iniciar bot
   npm run dev
   
   # Probar conversación completa
   ```

3. **Verificar emails:**
   - Confirmar que se envían correctamente
   - Verificar que los links funcionan
   - Probar con correo real

---

**¡El bot está listo para vender! 🎯**

Ahora puede manejar todo el proceso desde el saludo hasta la entrega del producto.
