# ✅ CHECKLIST DE VERIFICACIÓN - NUEVAS REGLAS

## 📋 VERIFICACIÓN DE INTEGRACIÓN

### Archivos modificados:
- [x] `src/lib/intelligent-conversation-engine.ts` - Actualizado con nuevas reglas

### Archivos creados:
- [x] `NUEVAS_REGLAS_BOT_INTEGRADAS.md` - Documentación completa
- [x] `scripts/test-nuevas-reglas-bot.ts` - Script de prueba
- [x] `COMANDOS_PROBAR_NUEVAS_REGLAS.md` - Guía de comandos
- [x] `RESUMEN_INTEGRACION_REGLAS.md` - Resumen ejecutivo
- [x] `EJEMPLOS_VISUALES_NUEVAS_REGLAS.md` - Ejemplos visuales
- [x] `CHECKLIST_VERIFICACION_REGLAS.md` - Este archivo

### Verificación de sintaxis:
- [x] No hay errores de TypeScript
- [x] No hay errores de compilación

---

## 🧪 PRUEBAS AUTOMATIZADAS

### Ejecutar script de prueba:
```bash
npx tsx scripts/test-nuevas-reglas-bot.ts
```

### Casos de prueba incluidos:
- [ ] Test 1: Curso específico (NO debe ofrecer otros)
- [ ] Test 2: Pregunta general (DEBE preguntar primero)
- [ ] Test 3: Megapack completo (reconoce variaciones)
- [ ] Test 4: Más información (descripción completa)
- [ ] Test 5: Servicio técnico (pregunta qué necesita)
- [ ] Test 6: Producto específico (NO ofrece otros)

**Marcar cada test como completado después de verificar la respuesta.**

---

## 📱 PRUEBAS EN WHATSAPP

### Preparación:
- [ ] Bot reiniciado con `npm run dev`
- [ ] WhatsApp conectado correctamente
- [ ] Número de prueba disponible

### Test 1: Curso específico
**Mensaje:** "Hola, tienes el curso de piano?"

**Verificar:**
- [ ] Responde SOLO información del curso de piano
- [ ] NO menciona otros cursos
- [ ] Incluye precio, descripción y características
- [ ] Usa emojis apropiados
- [ ] Pregunta si quiere más información

**Comportamiento INCORRECTO (reportar si ocurre):**
- [ ] Menciona otros cursos sin que se pidan
- [ ] Ofrece megapacks sin que se pidan
- [ ] Da información incompleta

---

### Test 2: Pregunta general
**Mensaje:** "Tienes laptops?"

**Verificar:**
- [ ] Pregunta qué tipo busca (económico, potente, etc.)
- [ ] Pregunta para qué lo va a usar
- [ ] NO muestra lista de productos inmediatamente
- [ ] Usa tono amigable y profesional

**Comportamiento INCORRECTO (reportar si ocurre):**
- [ ] Muestra lista de laptops sin preguntar
- [ ] No pregunta sobre necesidades
- [ ] Asume lo que el cliente quiere

---

### Test 3: Megapack completo
**Probar estas variaciones:**
- [ ] "Quiero el super megapack"
- [ ] "Dame el megapack completo"
- [ ] "Cuánto cuesta el megapack de 40 cursos?"
- [ ] "Info del megapack de 30 cursos"
- [ ] "Quiero todos los cursos"

**Verificar:**
- [ ] Todas las variaciones activan la misma respuesta
- [ ] Muestra información del megapack de 40 cursos
- [ ] Precio correcto: $60,000 COP
- [ ] Incluye descripción completa
- [ ] NO confunde con megapacks temáticos

**Comportamiento INCORRECTO (reportar si ocurre):**
- [ ] No reconoce alguna variación
- [ ] Muestra megapack temático en lugar del completo
- [ ] Precio incorrecto

---

### Test 4: Más información
**Secuencia de mensajes:**
1. "Info del curso de piano"
2. "Dame más información"

**Verificar:**
- [ ] Primera respuesta: Información básica del curso
- [ ] Segunda respuesta: Descripción COMPLETA (no resumida)
- [ ] Incluye todos los módulos/contenidos
- [ ] Incluye bonos y extras
- [ ] Usa formato claro y organizado

**Comportamiento INCORRECTO (reportar si ocurre):**
- [ ] Resume la información en lugar de dar todo
- [ ] Repite la misma información básica
- [ ] No da detalles adicionales

---

### Test 5: Servicio técnico
**Mensaje:** "Necesito reparación"

**Verificar:**
- [ ] Pregunta qué producto tiene
- [ ] Pregunta qué servicio necesita
- [ ] NO ofrece precios sin saber qué necesita
- [ ] NO asume el tipo de reparación
- [ ] Ofrece diagnóstico después de entender el problema

**Comportamiento INCORRECTO (reportar si ocurre):**
- [ ] Ofrece servicio sin preguntar
- [ ] Da precios sin saber qué necesita
- [ ] Asume el tipo de reparación

---

### Test 6: Producto específico
**Mensaje:** "Cuánto cuesta la MacBook?"

**Verificar:**
- [ ] Responde SOLO información de MacBook
- [ ] NO menciona otros laptops
- [ ] Incluye especificaciones completas
- [ ] Incluye precio y disponibilidad
- [ ] Pregunta si quiere más información o comprar

**Comportamiento INCORRECTO (reportar si ocurre):**
- [ ] Menciona otros laptops sin que se pidan
- [ ] Ofrece alternativas sin que se pidan
- [ ] Da información incompleta

---

### Test 7: Megapack temático
**Mensaje:** "Tienes megapack de diseño gráfico?"

**Verificar:**
- [ ] Responde SOLO sobre megapack de diseño
- [ ] NO menciona el megapack completo
- [ ] NO menciona otros megapacks temáticos
- [ ] Incluye lista de cursos incluidos
- [ ] Incluye precio específico

**Comportamiento INCORRECTO (reportar si ocurre):**
- [ ] Menciona el megapack completo
- [ ] Ofrece otros megapacks sin que se pidan
- [ ] Confunde con curso individual

---

### Test 8: Contexto de conversación
**Secuencia de mensajes:**
1. "Info del curso de piano"
2. "Cuánto cuesta?"
3. "Cómo puedo pagar?"

**Verificar:**
- [ ] Mantiene contexto del curso de piano
- [ ] No pregunta "¿cuánto cuesta qué?"
- [ ] Responde precio del curso en contexto
- [ ] Muestra métodos de pago para ese curso
- [ ] NO pierde el contexto entre mensajes

**Comportamiento INCORRECTO (reportar si ocurre):**
- [ ] Pierde el contexto
- [ ] Pregunta de qué producto habla
- [ ] Confunde con otro producto

---

## 📊 VERIFICACIÓN DE CALIDAD

### Formato de respuestas:
- [ ] Usa emojis apropiados
- [ ] Organiza información con saltos de línea
- [ ] Usa viñetas o listas cuando es apropiado
- [ ] Respuestas concisas pero completas
- [ ] Tono amigable y profesional

### Precisión:
- [ ] NO inventa información
- [ ] Solo usa datos del catálogo
- [ ] Precios correctos
- [ ] Descripciones exactas
- [ ] NO da respuestas genéricas

### Comportamiento:
- [ ] Responde SOLO lo que se pregunta
- [ ] Pregunta antes de mostrar opciones
- [ ] Mantiene foco en producto consultado
- [ ] NO ofrece productos sin que se pidan
- [ ] Usa descripciones completas cuando se pide

---

## 🐛 REPORTE DE PROBLEMAS

### Si encuentras comportamiento incorrecto:

1. **Anotar el problema:**
   - Mensaje enviado
   - Respuesta recibida
   - Comportamiento esperado
   - Comportamiento actual

2. **Verificar logs:**
   ```bash
   # Ver logs en la terminal donde corre el bot
   ```

3. **Revisar código:**
   - `src/lib/intelligent-conversation-engine.ts` (líneas ~50-150)

4. **Ajustar si es necesario:**
   - Modificar reglas en el prompt del sistema
   - Reiniciar bot
   - Volver a probar

---

## ✅ CHECKLIST FINAL

### Antes de dar por completado:
- [ ] Todos los tests automatizados pasan
- [ ] Todos los tests en WhatsApp pasan
- [ ] Formato de respuestas es correcto
- [ ] Precisión de información es correcta
- [ ] Comportamiento cumple con las reglas
- [ ] No hay errores en logs
- [ ] Documentación está completa
- [ ] Equipo está informado de los cambios

---

## 📝 NOTAS ADICIONALES

### Casos especiales encontrados:
```
(Anotar aquí cualquier caso especial o comportamiento inesperado)
```

### Ajustes realizados:
```
(Anotar aquí cualquier ajuste que se haya hecho después de las pruebas)
```

### Feedback del equipo:
```
(Anotar aquí feedback del equipo después de probar)
```

---

## 🎯 ESTADO FINAL

- [ ] **INTEGRACIÓN COMPLETADA**
- [ ] **PRUEBAS AUTOMATIZADAS PASADAS**
- [ ] **PRUEBAS EN WHATSAPP PASADAS**
- [ ] **DOCUMENTACIÓN COMPLETA**
- [ ] **EQUIPO INFORMADO**
- [ ] **LISTO PARA PRODUCCIÓN**

---

**Fecha de verificación:** _______________  
**Verificado por:** _______________  
**Aprobado por:** _______________

---

## 📞 SOPORTE

Si necesitas ayuda:
1. Revisar `NUEVAS_REGLAS_BOT_INTEGRADAS.md`
2. Revisar `EJEMPLOS_VISUALES_NUEVAS_REGLAS.md`
3. Ejecutar `npx tsx scripts/test-nuevas-reglas-bot.ts`
4. Revisar logs del bot

---

**✅ VERIFICACIÓN COMPLETA**
