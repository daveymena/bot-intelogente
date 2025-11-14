# 🔄 DIAGRAMA DE FLUJO - NUEVAS REGLAS

## 📊 FLUJO DE DECISIÓN DEL BOT

```
┌─────────────────────────────────────┐
│   CLIENTE ENVÍA MENSAJE             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   ¿Es pregunta por curso específico?│
└──────────────┬──────────────────────┘
               │
       ┌───────┴───────┐
       │ SÍ            │ NO
       ▼               ▼
┌──────────────┐  ┌──────────────────────┐
│ Responder    │  │ ¿Es pregunta general │
│ SOLO ese     │  │ sobre categoría?     │
│ curso        │  └──────┬───────────────┘
│              │         │
│ NO mencionar │  ┌──────┴──────┐
│ otros cursos │  │ SÍ          │ NO
└──────────────┘  ▼             ▼
           ┌──────────────┐  ┌─────────────────┐
           │ PREGUNTAR    │  │ ¿Es megapack    │
           │ qué tipo     │  │ completo?       │
           │ busca        │  └──────┬──────────┘
           │              │         │
           │ Luego mostrar│  ┌──────┴──────┐
           │ 3-4 opciones │  │ SÍ          │ NO
           └──────────────┘  ▼             ▼
                      ┌──────────────┐  ┌──────────────┐
                      │ Mostrar      │  │ ¿Es producto │
                      │ megapack de  │  │ específico?  │
                      │ 40 cursos    │  └──────┬───────┘
                      │ ($60,000)    │         │
                      └──────────────┘  ┌──────┴──────┐
                                        │ SÍ          │ NO
                                        ▼             ▼
                                 ┌──────────────┐  ┌──────────────┐
                                 │ Responder    │  │ ¿Es servicio │
                                 │ SOLO ese     │  │ técnico?     │
                                 │ producto     │  └──────┬───────┘
                                 │              │         │
                                 │ NO mencionar │  ┌──────┴──────┐
                                 │ otros        │  │ SÍ          │ NO
                                 └──────────────┘  ▼             ▼
                                            ┌──────────────┐  ┌──────────────┐
                                            │ PREGUNTAR    │  │ Respuesta    │
                                            │ qué necesita │  │ general      │
                                            │              │  │ con IA       │
                                            │ Luego ofrecer│  └──────────────┘
                                            │ diagnóstico  │
                                            └──────────────┘
```

---

## 🎯 REGLAS DE DECISIÓN

### 1. Curso Específico
```
Pregunta: "Tienes el curso de piano?"
    ↓
Detectar: Curso específico mencionado
    ↓
Acción: Responder SOLO ese curso
    ↓
Resultado: Info completa del curso de piano
    ↓
NO mencionar otros cursos
```

---

### 2. Pregunta General
```
Pregunta: "Tienes laptops?"
    ↓
Detectar: Pregunta general sobre categoría
    ↓
Acción: PREGUNTAR qué tipo busca
    ↓
Cliente responde: "Económico para trabajo"
    ↓
Acción: Mostrar 3-4 opciones filtradas
    ↓
Resultado: Lista organizada de económica a completa
```

---

### 3. Megapack Completo
```
Pregunta: "Quiero el super megapack"
    ↓
Detectar: Variaciones de megapack completo
    ↓
Reconocer: "super megapack", "megapack completo",
           "todos los cursos", "megapack de 40"
    ↓
Acción: Mostrar megapack de 40 cursos
    ↓
Resultado: Info completa + precio $60,000 COP
```

---

### 4. Más Información
```
Contexto: Ya se habló de un producto
    ↓
Pregunta: "Dame más información"
    ↓
Detectar: Solicitud de detalles adicionales
    ↓
Acción: Usar TODA la descripción del catálogo
    ↓
Resultado: Descripción COMPLETA (no resumida)
```

---

### 5. Servicio Técnico
```
Pregunta: "Necesito reparación"
    ↓
Detectar: Solicitud de servicio técnico
    ↓
Acción: PREGUNTAR qué producto/servicio necesita
    ↓
Cliente responde: "Mi laptop no enciende"
    ↓
Acción: Ofrecer diagnóstico + agendar cita
    ↓
Resultado: Info de diagnóstico + ubicación + contacto
```

---

### 6. Producto Específico
```
Pregunta: "Cuánto cuesta la MacBook?"
    ↓
Detectar: Producto específico mencionado
    ↓
Acción: Responder SOLO ese producto
    ↓
Resultado: Info completa de MacBook
    ↓
NO mencionar otros laptops
```

---

## 🔄 FLUJO DE CONTEXTO

```
┌─────────────────────────────────────┐
│   MENSAJE 1: "Info del curso de    │
│              piano"                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   BOT: Responde info del curso      │
│   MEMORIA: Guarda "curso de piano"  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   MENSAJE 2: "Cuánto cuesta?"       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   BOT: Lee memoria → "curso de      │
│        piano"                       │
│   Responde: Precio del curso        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   MENSAJE 3: "Cómo puedo pagar?"    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   BOT: Lee memoria → "curso de      │
│        piano"                       │
│   Responde: Métodos de pago para    │
│             ese curso               │
└─────────────────────────────────────┘
```

**Mantiene contexto durante toda la conversación**

---

## 🎨 FLUJO DE CALIFICACIÓN

```
┌─────────────────────────────────────┐
│   PREGUNTA GENERAL                  │
│   "Tienes laptops?"                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   BOT PREGUNTA                      │
│   "¿Buscas algo económico o         │
│    potente? ¿Para qué lo usarás?"   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   CLIENTE RESPONDE                  │
│   "Económico para trabajo"          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   BOT FILTRA                        │
│   - Precio: Económico               │
│   - Uso: Trabajo (Office, etc.)     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   BOT MUESTRA                       │
│   3-4 opciones filtradas            │
│   Organizadas por precio            │
└─────────────────────────────────────┘
```

---

## 📊 MATRIZ DE DECISIONES

| Tipo de Pregunta | Acción del Bot | Resultado |
|------------------|----------------|-----------|
| Curso específico | Responder solo ese | Info completa |
| Pregunta general | Preguntar primero | Luego mostrar opciones |
| Megapack completo | Reconocer variaciones | Megapack de 40 cursos |
| Más información | Usar descripción completa | Todo el contenido |
| Servicio técnico | Preguntar qué necesita | Diagnóstico + cita |
| Producto específico | Responder solo ese | Info completa |

---

## ✅ PRINCIPIOS CLAVE

### 1. PRECISIÓN
```
Pregunta específica → Respuesta específica
NO ofrecer más de lo solicitado
```

### 2. CALIFICACIÓN
```
Pregunta general → Preguntar primero
Entender necesidad → Luego mostrar opciones
```

### 3. CONTEXTO
```
Mantener memoria de la conversación
No perder el hilo del producto en discusión
```

### 4. COMPLETITUD
```
Cuando se pide "más información"
Dar TODA la descripción disponible
```

### 5. PROFESIONALISMO
```
No inventar información
Solo usar datos del catálogo
Respuestas claras y organizadas
```

---

## 🎯 RESULTADO ESPERADO

```
ANTES:
Cliente pregunta → Bot ofrece todo → Cliente confundido

DESPUÉS:
Cliente pregunta → Bot responde exacto → Cliente satisfecho
```

---

**El bot ahora sigue un flujo lógico y profesional** ✅
