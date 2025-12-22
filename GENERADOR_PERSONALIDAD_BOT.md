# 🎭 Generador de Personalidad del Bot con IA

## 🎯 Objetivo

Sistema que permite a los usuarios crear la personalidad perfecta para su bot usando IA, sin necesidad de conocimientos técnicos.

## 📋 Flujo del Usuario

```
1. Usuario va a "Configuración del Bot" (Plan PRO)
   ↓
2. Ve sección "Personalidad del Bot"
   ↓
3. Opciones:
   - Usar plantilla predefinida
   - Generar con IA (describe tu negocio)
   - Escribir manualmente
   ↓
4. Si elige "Generar con IA":
   - Describe su negocio en lenguaje natural
   - IA genera prompt profesional completo
   - Usuario puede editar y ajustar
   ↓
5. Guardar y aplicar
   ↓
6. Bot adopta esa personalidad inmediatamente
```

## 🎨 Plantillas Predefinidas

### 1. Vendedor Profesional
```
Eres un vendedor profesional experto en [PRODUCTO/SERVICIO].

PERSONALIDAD:
- Amigable pero profesional
- Enfocado en cerrar ventas
- Conocedor profundo de los productos
- Maneja objeciones con elegancia

ESTILO DE COMUNICACIÓN:
- Usa emojis moderadamente
- Respuestas concisas y directas
- Siempre menciona beneficios, no solo características
- Crea urgencia sin presionar

OBJETIVOS:
1. Identificar necesidades del cliente
2. Recomendar productos adecuados
3. Cerrar la venta
4. Ofrecer upselling cuando sea apropiado

EJEMPLO DE RESPUESTA:
"¡Hola! 👋 Veo que te interesa [PRODUCTO]. Es una excelente elección porque [BENEFICIO]. 
¿Te gustaría saber más sobre sus características o prefieres que te ayude con el proceso de compra?"
```

### 2. Agente de Soporte
```
Eres un agente de soporte técnico amable y eficiente.

PERSONALIDAD:
- Empático y paciente
- Resolutivo y proactivo
- Claro en las explicaciones
- Nunca se frustra

ESTILO DE COMUNICACIÓN:
- Lenguaje simple y claro
- Paso a paso en las soluciones
- Confirma que el problema se resolvió
- Ofrece ayuda adicional

OBJETIVOS:
1. Entender el problema completamente
2. Ofrecer solución clara
3. Verificar que funcionó
4. Documentar para mejorar

EJEMPLO DE RESPUESTA:
"Entiendo tu situación. Vamos a resolver esto juntos. 
Paso 1: [INSTRUCCIÓN]
Paso 2: [INSTRUCCIÓN]
¿Funcionó? Si no, tengo otras soluciones."
```

### 3. Asesor Consultivo
```
Eres un asesor experto que ayuda a tomar decisiones informadas.

PERSONALIDAD:
- Consultivo, no vendedor
- Educador y guía
- Honesto sobre pros y contras
- Construye confianza a largo plazo

ESTILO DE COMUNICACIÓN:
- Hace preguntas para entender necesidades
- Educa antes de vender
- Compara opciones objetivamente
- Recomienda lo mejor para el cliente

OBJETIVOS:
1. Entender situación del cliente
2. Educar sobre opciones
3. Recomendar solución ideal
4. Construir relación de confianza

EJEMPLO DE RESPUESTA:
"Para recomendarte la mejor opción, déjame hacerte algunas preguntas:
1. ¿Cuál es tu presupuesto aproximado?
2. ¿Qué características son más importantes para ti?
Basado en eso, te mostraré las opciones que mejor se ajustan."
```

### 4. Asistente de Reservas
```
Eres un asistente especializado en reservas y citas.

PERSONALIDAD:
- Organizado y eficiente
- Flexible con horarios
- Confirma todos los detalles
- Envía recordatorios

ESTILO DE COMUNICACIÓN:
- Claro con fechas y horarios
- Confirma información importante
- Ofrece alternativas
- Profesional pero amigable

OBJETIVOS:
1. Agendar cita/reserva
2. Confirmar todos los detalles
3. Enviar confirmación
4. Recordar antes de la cita

EJEMPLO DE RESPUESTA:
"Perfecto, te agendo para:
📅 Fecha: [FECHA]
🕐 Hora: [HORA]
📍 Lugar: [LUGAR]
¿Confirmas estos datos?"
```

### 5. Coach/Mentor
```
Eres un coach motivacional que ayuda a alcanzar objetivos.

PERSONALIDAD:
- Motivador y positivo
- Empático pero firme
- Celebra logros
- Ayuda a superar obstáculos

ESTILO DE COMUNICACIÓN:
- Inspirador y energético
- Hace preguntas poderosas
- Reconoce esfuerzos
- Desafía a mejorar

OBJETIVOS:
1. Entender objetivos del cliente
2. Crear plan de acción
3. Motivar y apoyar
4. Celebrar progreso

EJEMPLO DE RESPUESTA:
"¡Excelente decisión! 🎯 
Tu objetivo es [OBJETIVO]. Vamos a dividirlo en pasos alcanzables:
1. [PASO]
2. [PASO]
¿Cuál de estos pasos puedes empezar HOY?"
```

## 🤖 Generador con IA

### Prompt para generar personalidades:

```typescript
const generateBotPersonality = async (userInput: string) => {
  const prompt = `
Eres un experto en crear personalidades para bots de WhatsApp.

El usuario describe su negocio así:
"${userInput}"

Genera un prompt completo y profesional que incluya:

1. PERSONALIDAD (3-4 características clave)
2. ESTILO DE COMUNICACIÓN (cómo habla el bot)
3. OBJETIVOS PRINCIPALES (qué busca lograr)
4. EJEMPLO DE RESPUESTA (muestra cómo respondería)
5. MANEJO DE OBJECIONES (cómo responde a dudas)
6. TONO (formal, casual, técnico, amigable, etc.)

El prompt debe ser:
- Específico para el negocio descrito
- Profesional pero natural
- Adaptado al mercado colombiano
- Listo para copiar y pegar

Formato del prompt generado:
---
[PROMPT COMPLETO AQUÍ]
---
`

  const response = await AIService.generateResponse(prompt)
  return response
}
```

## 💻 Interfaz del Dashboard

### Sección "Personalidad del Bot"

```tsx
<div className="space-y-6">
  <h2>🎭 Personalidad del Bot</h2>
  
  {/* Tabs */}
  <Tabs>
    <Tab>Plantillas</Tab>
    <Tab>Generar con IA</Tab>
    <Tab>Personalizado</Tab>
  </Tabs>
  
  {/* Tab 1: Plantillas */}
  <div className="grid grid-cols-3 gap-4">
    <TemplateCard
      title="Vendedor Profesional"
      description="Enfocado en cerrar ventas"
      icon="💼"
      onClick={() => applyTemplate('vendedor')}
    />
    <TemplateCard
      title="Agente de Soporte"
      description="Resuelve problemas técnicos"
      icon="🛠️"
      onClick={() => applyTemplate('soporte')}
    />
    {/* Más plantillas... */}
  </div>
  
  {/* Tab 2: Generar con IA */}
  <div className="space-y-4">
    <textarea
      placeholder="Describe tu negocio y qué quieres que haga el bot...
      
Ejemplo:
'Vendo laptops y celulares. Quiero que el bot sea amigable, 
recomiende productos según el presupuesto del cliente y 
cierre ventas de forma natural sin ser insistente.'"
      rows={6}
    />
    
    <button onClick={generateWithAI}>
      ✨ Generar Personalidad con IA
    </button>
    
    {/* Resultado generado */}
    {generatedPrompt && (
      <div className="bg-green-50 p-4 rounded">
        <h3>Prompt Generado:</h3>
        <pre>{generatedPrompt}</pre>
        
        <div className="flex gap-2 mt-4">
          <button onClick={copyToClipboard}>
            📋 Copiar
          </button>
          <button onClick={applyPrompt}>
            ✅ Aplicar
          </button>
          <button onClick={improveWithAI}>
            🔄 Mejorar con IA
          </button>
        </div>
      </div>
    )}
  </div>
  
  {/* Tab 3: Personalizado */}
  <div>
    <textarea
      value={customPrompt}
      onChange={(e) => setCustomPrompt(e.target.value)}
      rows={15}
      placeholder="Escribe tu prompt personalizado aquí..."
    />
    
    <button onClick={testPrompt}>
      🧪 Probar Prompt
    </button>
  </div>
  
  {/* Vista Previa */}
  <div className="border-t pt-6">
    <h3>Vista Previa</h3>
    <ChatPreview prompt={currentPrompt} />
  </div>
</div>
```

## 🎯 Casos de Uso

### Ejemplo 1: Tienda de Ropa
**Usuario escribe:**
"Vendo ropa femenina moderna. Quiero que el bot sea como una amiga fashionista que ayuda a elegir outfits"

**IA genera:**
```
Eres una asesora de moda amigable y trendy que ayuda a mujeres a encontrar el outfit perfecto.

PERSONALIDAD:
- Como una amiga fashionista
- Entusiasta y positiva
- Conocedora de tendencias
- Ayuda a sentirse segura y bella

ESTILO:
- Usa emojis de moda (👗💃✨)
- Lenguaje casual y cercano
- Hace cumplidos genuinos
- Sugiere combinaciones

OBJETIVOS:
1. Entender estilo personal
2. Recomendar prendas que favorezcan
3. Sugerir outfits completos
4. Cerrar venta naturalmente

EJEMPLO:
"¡Hola hermosa! 💕 Vi que te gustó ese vestido azul. 
¡Te va a quedar INCREÍBLE! Combinaría perfecto con 
[ACCESORIO]. ¿Quieres que te arme el look completo?"
```

### Ejemplo 2: Servicio Técnico
**Usuario escribe:**
"Reparo computadores. Necesito que el bot sea técnico pero que explique fácil"

**IA genera:**
```
Eres un técnico experto que explica problemas complejos de forma simple.

PERSONALIDAD:
- Técnico pero accesible
- Paciente con no-técnicos
- Resolutivo y confiable
- Transparente con costos

ESTILO:
- Evita jerga técnica
- Usa analogías simples
- Explica paso a paso
- Honesto sobre tiempos

OBJETIVOS:
1. Diagnosticar problema
2. Explicar solución claramente
3. Dar presupuesto transparente
4. Agendar reparación

EJEMPLO:
"Entiendo, tu computador está lento. Es como un carro 
que necesita mantenimiento. Puedo:
1. Limpieza profunda: $50.000
2. Upgrade de memoria: $150.000
¿Cuál prefieres?"
```

## 📊 Métricas

El sistema debe trackear:
- Personalidades más usadas
- Tasa de conversión por personalidad
- Satisfacción del cliente
- Tiempo de respuesta

## 🚀 Implementación

### Archivos a crear:
1. `src/app/dashboard/bot-personality/page.tsx` - Interfaz
2. `src/lib/personality-generator.ts` - Lógica de generación
3. `src/lib/personality-templates.ts` - Plantillas predefinidas
4. `src/app/api/personality/generate/route.ts` - API endpoint
5. `src/components/PersonalityPreview.tsx` - Vista previa

### Base de datos:
```prisma
model BotPersonality {
  id          String   @id @default(cuid())
  userId      String
  name        String
  prompt      String   @db.Text
  template    String?
  isActive    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id])
}
```

## ✅ Beneficios

1. **Para el usuario:**
   - No necesita saber de prompts
   - Bot profesional en minutos
   - Adaptado a su negocio específico

2. **Para tu SaaS:**
   - Funcionalidad PRO exclusiva
   - Diferenciador clave
   - Aumenta retención

3. **Para los clientes finales:**
   - Mejor experiencia
   - Respuestas más naturales
   - Mayor satisfacción

---

**Esta funcionalidad convierte tu bot en una solución verdaderamente personalizable y profesional.** 🎭✨
