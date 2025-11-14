# ✅ Sistema de Razonamiento Profundo Local Activado

## ¿Qué hace?

El bot ahora tiene un **traductor de intenciones** que entiende el contexto completo de lo que dice el cliente, sin necesitar IA externa.

## Ejemplos de Razonamiento

### Ejemplo 1: "diseño gráfico"
```
Cliente dice: "diseño gráfico"

🧠 RAZONAMIENTO:
→ Tipo de producto: general (no especificó si curso o megapack)
→ Tema identificado: diseño
→ Buscar productos con: diseño, diseno, diseño grafico, diseno grafico, diseño gráfico, design, grafico, gráfico

RESULTADO: Encuentra "Mega Pack 01: Cursos Diseño Gráfico"
```

### Ejemplo 2: "curso de diseño gráfico"
```
Cliente dice: "curso de diseño gráfico"

🧠 RAZONAMIENTO:
→ Tipo de producto: curso (mencionó "curso")
→ Tema identificado: diseño
→ Buscar productos con: curso, cursos, diseño, diseno, diseño grafico, diseno grafico, grafico, gráfico

RESULTADO: Encuentra "Mega Pack 01: Cursos Diseño Gráfico" (es un curso)
```

### Ejemplo 3: "reparación de teléfonos"
```
Cliente dice: "reparación de teléfonos"

🧠 RAZONAMIENTO:
→ Tipo de producto: servicio (mencionó "reparación")
→ Tema identificado: reparacion
→ Buscar productos con: reparacion, reparación, arreglo, mantenimiento, servicio tecnico, telefono, teléfono, celular, movil, móvil, smartphone

RESULTADO: Encuentra "Mega Pack 18: Reparación de teléfonos y tablets"
```

### Ejemplo 4: "laptop para gaming"
```
Cliente dice: "laptop para gaming"

🧠 RAZONAMIENTO:
→ Tipo de producto: producto_fisico (mencionó "laptop")
→ Tema identificado: laptop + gaming
→ Buscar productos con: laptop, portatil, portátil, computador, notebook, gaming, gamer, juegos

RESULTADO: Encuentra laptops con Ryzen 5/7 y características gaming
```

## Cómo Funciona

### 1. Detecta el Tipo de Producto
- **Megapack**: "megapack", "pack completo", "todos los cursos"
- **Curso**: "curso", "aprender", "enseñar"
- **Producto Físico**: "laptop", "monitor", "moto"
- **Servicio**: "reparación", "arreglo", "mantenimiento"

### 2. Identifica el Tema
- Diseño: diseño, gráfico, photoshop, illustrator
- Programación: programación, código, desarrollo, web
- Reparación: reparación, teléfono, celular, tablet
- Gaming: gaming, gamer, juegos
- Y muchos más...

### 3. Genera Variaciones
Para "diseño" genera:
- diseño
- diseno (sin tilde)
- diseño grafico
- diseno grafico
- diseño gráfico
- design

### 4. Busca con Puntos
- +10 puntos: palabra en el nombre
- +5 puntos: palabra en la descripción
- +20 puntos: contiene TODAS las palabras
- +15 puntos: nombre empieza con la palabra

## Ventajas

✅ **Entiende contexto**: "diseño" = "curso de diseño" = "megapack de diseño"
✅ **Sin IA externa**: Todo el razonamiento es local
✅ **Rápido**: Milisegundos de procesamiento
✅ **Preciso**: Usa los tags mejorados
✅ **Flexible**: Entiende variaciones y errores ortográficos

## Integración

El sistema está integrado en:
- `src/lib/intent-translator.ts` - Traductor de intenciones
- `src/lib/intelligent-conversation-engine.ts` - Motor de conversación

Se activa automáticamente cuando:
1. Las APIs de IA fallan
2. O cuando busca productos en la base de datos

## Prueba

```bash
# Inicia el bot
npm run dev

# Prueba estos mensajes:
"diseño gráfico"
"curso de diseño"
"megapack de diseño"
"reparación de teléfonos"
"laptop para gaming"
```

El bot entenderá el contexto completo y encontrará el producto correcto.

## Próximos Pasos

1. ✅ Razonamiento profundo local activado
2. ⚠️ Agregar tags a los 96 productos sin tags
3. ⚠️ Obtener nuevas API keys de Groq
4. ⚠️ Reemplazar URLs de imágenes
