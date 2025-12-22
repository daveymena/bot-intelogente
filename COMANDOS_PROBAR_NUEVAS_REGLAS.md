# 🚀 COMANDOS RÁPIDOS - PROBAR NUEVAS REGLAS

## ✅ INTEGRACIÓN COMPLETADA

Las nuevas reglas del bot han sido integradas exitosamente en:
- `src/lib/intelligent-conversation-engine.ts`

---

## 🧪 PROBAR LAS NUEVAS REGLAS

### 1. Ejecutar script de prueba automatizado
```bash
npx tsx scripts/test-nuevas-reglas-bot.ts
```

Este script prueba automáticamente:
- ✅ Pregunta por curso específico
- ✅ Pregunta general sobre categoría
- ✅ Megapack completo
- ✅ Solicitud de más información
- ✅ Servicio técnico
- ✅ Producto específico

---

## 🔄 REINICIAR EL BOT

Si el bot ya está corriendo, reinícialo para aplicar los cambios:

```bash
# Detener el bot (Ctrl+C en la terminal donde corre)
# Luego iniciar de nuevo:
npm run dev
```

---

## 📱 PROBAR EN WHATSAPP

### Casos de prueba recomendados:

#### 1. Curso específico (NO debe ofrecer otros)
```
Hola, tienes el curso de piano?
```
**Esperado:** Solo información del curso de piano, sin mencionar otros cursos.

---

#### 2. Pregunta general (DEBE preguntar primero)
```
Tienes laptops?
```
**Esperado:** Pregunta sobre qué tipo busca (económico, potente, etc.)

---

#### 3. Megapack completo (reconocer variaciones)
```
Quiero el super megapack
```
**Esperado:** Información del megapack de 40 cursos ($60.000 COP)

También prueba:
- "megapack completo"
- "todos los cursos"
- "megapack de 40 cursos"

---

#### 4. Más información (descripción completa)
```
Info del curso de piano
```
Luego:
```
Dame más información
```
**Esperado:** Descripción COMPLETA del curso, no resumida.

---

#### 5. Servicio técnico (preguntar primero)
```
Necesito reparación
```
**Esperado:** Pregunta sobre qué producto o servicio necesita.

---

#### 6. Producto específico (NO ofrecer otros)
```
Cuánto cuesta la MacBook?
```
**Esperado:** Precio y descripción SOLO de MacBook, sin mencionar otros laptops.

---

## 🔍 VERIFICAR COMPORTAMIENTO

### ✅ Comportamiento CORRECTO:
- El bot responde SOLO lo que se pregunta
- No ofrece productos adicionales sin que se pidan
- Pregunta antes de mostrar opciones en preguntas generales
- Usa descripciones completas cuando se pide más información
- Mantiene el foco en el producto/servicio consultado

### ❌ Comportamiento INCORRECTO (reportar si ocurre):
- Ofrece otros productos sin que se pidan
- Muestra lista de productos sin preguntar primero
- Resume información cuando se pide "más información"
- Inventa información que no está en el catálogo
- Da respuestas genéricas o vacías

---

## 📊 MONITOREAR LOGS

Para ver los logs del bot en tiempo real:

```bash
# En la terminal donde corre el bot, verás:
[IntelligentEngine] 📥 Procesando mensaje: ...
[IntelligentEngine] 🧠 Contexto ANTES de procesar: ...
[IntelligentEngine] 🔍 Productos encontrados: ...
[IntelligentEngine] ⚡ Acciones generadas: ...
```

---

## 🐛 SI ALGO NO FUNCIONA

### 1. Verificar que el archivo fue modificado correctamente:
```bash
# Ver las últimas líneas del prompt del sistema
npx tsx -e "import {readFileSync} from 'fs'; console.log(readFileSync('src/lib/intelligent-conversation-engine.ts', 'utf-8').substring(2000, 5000))"
```

### 2. Verificar que no hay errores de sintaxis:
```bash
npx tsc --noEmit
```

### 3. Limpiar caché y reiniciar:
```bash
# Detener el bot
# Limpiar node_modules/.cache si existe
rm -rf node_modules/.cache
# Reiniciar
npm run dev
```

---

## 📝 DOCUMENTACIÓN

- **Reglas completas:** Ver `NUEVAS_REGLAS_BOT_INTEGRADAS.md`
- **Código modificado:** `src/lib/intelligent-conversation-engine.ts` (líneas ~50-150)
- **Script de prueba:** `scripts/test-nuevas-reglas-bot.ts`

---

## 🎯 CHECKLIST DE VERIFICACIÓN

Después de probar, verifica que:

- [ ] El bot responde SOLO el curso específico cuando se pregunta por uno
- [ ] El bot pregunta ANTES de mostrar laptops cuando se pregunta "¿tienes laptops?"
- [ ] El bot reconoce "super megapack", "megapack completo", etc.
- [ ] El bot da descripción COMPLETA cuando se pide "más información"
- [ ] El bot pregunta qué necesita cuando se solicita servicio técnico
- [ ] El bot NO ofrece otros productos sin que se pidan
- [ ] El bot mantiene el foco en el producto consultado
- [ ] El bot NO inventa información

---

## ✅ TODO LISTO

Si todos los checks están ✅, las nuevas reglas están funcionando correctamente.

**¡El bot ahora es más preciso y profesional!** 🎉
