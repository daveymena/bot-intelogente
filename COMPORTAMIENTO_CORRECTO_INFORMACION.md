# ✅ Comportamiento Correcto: Uso de Información Real

## 🎯 Principio

El bot debe usar **TODA la información real** disponible en la base de datos, pero **NUNCA inventar** información que no existe.

## 📚 Ejemplo: Curso de Piano

### Información Real en la BD:
```
Nombre: "Curso Completo de Piano Online"
Precio: 60,000 COP
Descripción:
🎵 Curso de Piano Completo: Desde Cero hasta Nivel Avanzado 🎹

✅ +80 lecciones en video HD
✅ 157 recursos descargables
✅ Acceso de por vida
✅ Soporte personalizado

🎼 Aprende estilos: Clásico, Balada, Pop, Blues, Jazz
📚 19 secciones | 283 clases | 18h 55min

🎯 Para principiantes y avanzados
💡 Método progresivo y fácil de seguir
🎁 Certificado al finalizar
```

## ✅ Comportamiento Correcto

### Primera Consulta (Respuesta Breve):
```
Cliente: "Tienes curso de piano?"

Bot: "¡Sí! 🎹

Curso Completo de Piano Online
💰 60,000 COP

✅ +80 lecciones en video HD
✅ 157 recursos descargables
✅ Acceso de por vida

¿Te gustaría más información?"
```

### Cliente Pide Más Información (Respuesta Completa):
```
Cliente: "Dame más información"

Bot: "¡Claro! 🎵

Curso Completo de Piano Online
💰 60,000 COP

📚 CONTENIDO:
✅ +80 lecciones en video HD
✅ 157 recursos descargables
✅ 19 secciones | 283 clases
⏱️ 18h 55min de contenido

🎼 ESTILOS QUE APRENDERÁS:
• Clásico
• Balada
• Pop
• Blues
• Jazz

🎯 NIVEL:
Para principiantes y avanzados
Método progresivo y fácil de seguir

🎁 INCLUYE:
✅ Acceso de por vida
✅ Soporte personalizado
✅ Certificado al finalizar

📲 Entrega digital inmediata

¿Te gustaría el link de pago?"
```

## ❌ Comportamiento Incorrecto (Lo que NO debe hacer)

### Inventar Información:
```
Cliente: "Dame más información"

Bot: "¡Claro que sí! 😊

Nuestro curso de piano en línea se llama "Piano Mágico" ❌ INVENTADO
y es una herramienta perfecta...

- **Niveles de dificultad**: Desde principiante hasta avanzado ❌ GENÉRICO
- **Lecciones interactivas**: Con vídeos explicativos ❌ VAGO
- **Acceso a recursos adicionales**: Como partituras ❌ NO ESPECÍFICO
```

**Problemas**:
- Inventa el nombre "Piano Mágico"
- Usa descripciones genéricas en lugar de los datos reales
- No menciona las 80 lecciones, 157 recursos, 18h 55min
- No menciona los estilos específicos (Clásico, Balada, Pop, Blues, Jazz)

## 🎯 Reglas de Oro

### 1. **Primera Respuesta: Breve y Atractiva**
- Nombre del producto
- Precio
- 2-3 beneficios clave de la descripción
- Pregunta si quiere más información

### 2. **Segunda Respuesta: Completa y Detallada**
- Usa TODA la información de la descripción
- Organízala de forma clara (secciones, viñetas)
- Mantén el formato atractivo con emojis
- Termina con call-to-action

### 3. **Preguntas Específicas: Busca en la Descripción**
```
Cliente: "¿Cuántas lecciones tiene?"
Bot: "El curso tiene +80 lecciones en video HD, organizadas en 19 secciones con 283 clases en total (18h 55min) 🎵"
```

### 4. **Información No Disponible: Sé Honesto**
```
Cliente: "¿Tiene ejercicios prácticos?"
Bot (si no está en la descripción): "Déjame verificar ese detalle específico. ¿Te gustaría que te genere el link de pago para que puedas ver todos los detalles?"
```

## 📊 Comparación

| Aspecto | ❌ Incorrecto | ✅ Correcto |
|---------|--------------|------------|
| Nombre | "Piano Mágico" (inventado) | "Curso Completo de Piano Online" (real) |
| Contenido | "Lecciones interactivas" (vago) | "+80 lecciones en video HD" (específico) |
| Recursos | "Recursos adicionales" (genérico) | "157 recursos descargables" (exacto) |
| Duración | No menciona | "18h 55min" (real) |
| Estilos | No menciona | "Clásico, Balada, Pop, Blues, Jazz" (específico) |

## 🎯 Objetivo

**Usar información real = Cliente sabe exactamente qué compra = Cliente satisfecho**

El bot debe ser como un vendedor que conoce perfectamente el producto y puede dar todos los detalles reales cuando se los piden.

## 📁 Implementación

La corrección está en `src/conversational-module/ai/promptBuilder.ts`:

```typescript
📌 INSTRUCCIONES DE USO:
✅ Primera respuesta: Breve (nombre, precio, 2-3 beneficios clave)
✅ Si piden MÁS INFORMACIÓN: Usa TODA la descripción, organízala bien
✅ Si piden DETALLES ESPECÍFICOS: Busca en la descripción y responde
✅ Si NO está en la descripción: Di "Déjame verificar eso" u ofrece el link
```

---

**Fecha**: 29 Nov 2025  
**Estado**: ✅ ACLARADO  
**Principio**: Usa toda la información real, nunca inventes
