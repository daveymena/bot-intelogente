# 🚀 INSTRUCCIONES RÁPIDAS: Activar Sistema de Escalamiento

## ⚡ Activación en 3 Pasos

### 1️⃣ Ejecutar Script Automático
```bash
activar-escalamiento-ahora.bat
```

Este script hace:
- ✅ Aplica migración de base de datos
- ✅ Ejecuta tests del sistema
- ✅ Muestra instrucciones finales

### 2️⃣ Reiniciar el Bot
```bash
npm run dev
```

### 3️⃣ Verificar que Funciona

Envía un mensaje de prueba por WhatsApp:
```
"El portátil que me vendieron no funciona!"
```

Deberías ver en logs:
```
[Baileys] 🔍 Verificando si necesita escalamiento...
[Baileys] 🚨 ESCALAMIENTO DETECTADO: Queja sobre producto
[Baileys] 📊 Confianza: 95%
[Baileys] 🏷️ Categoría: complaint
[Baileys] ✅ Conversación escalada a humano
```

---

## 📋 ¿Qué Hace el Sistema?

Cuando un cliente envía un mensaje, el bot:

1. **Analiza el mensaje** para detectar intención
2. **Verifica si necesita humano** (quejas, problemas técnicos, pagos, etc.)
3. **Si necesita humano:**
   - Envía mensaje apropiado al cliente
   - Marca conversación en base de datos
   - NO envía respuesta automática
4. **Si NO necesita humano:**
   - Responde normalmente con plantillas

---

## 🎯 Casos que Escalan Automáticamente

| Tipo | Ejemplo | Acción |
|------|---------|--------|
| 🔴 **Queja** | "El producto no funciona!" | Escala a humano |
| 🔧 **Técnico** | "¿Soporta VT-x y GPU passthrough?" | Escala a humano |
| 💳 **Pago** | "Pagué pero no recibí nada" | Escala a humano |
| 💼 **Negociación** | "¿Descuento por 3 unidades?" | Escala a humano |
| 🛡️ **Garantía** | "¿Cómo activo la garantía?" | Escala a humano |
| ⚠️ **Baja confianza** | Bot inseguro (< 40%) | Escala a humano |
| 😤 **Frustración** | "Pésimo servicio!" | Escala a humano |
| ✅ **Consulta simple** | "¿Cuánto cuesta?" | Bot responde normal |

---

## 📊 Ver Conversaciones Escaladas

### En Base de Datos
```sql
SELECT 
  customerPhone,
  escalationCategory,
  escalationReason,
  escalatedAt
FROM conversations
WHERE needsHumanAttention = true
ORDER BY escalatedAt DESC;
```

### En Logs
Busca:
```
[Baileys] 🚨 ESCALAMIENTO DETECTADO
```

---

## 🧪 Probar el Sistema

### Opción 1: Script de Tests
```bash
probar-escalamiento.bat
```

### Opción 2: Manual
```bash
npx tsx test-escalamiento-inteligente.ts
```

Esto prueba 8 casos diferentes:
1. Queja sobre producto defectuoso ✅
2. Consulta técnica compleja ✅
3. Problema con pago ✅
4. Consulta simple (NO debe escalar) ✅
5. Solicitud de negociación ✅
6. Frustración del cliente ✅
7. Solicitud de garantía ✅
8. Baja confianza en respuesta ✅

---

## 📚 Documentación Completa

Si necesitas más detalles:

1. **`SISTEMA_ESCALAMIENTO_HUMANO_COMPLETO.md`**
   - Guía completa del sistema
   - Todos los casos de uso
   - Ejemplos detallados

2. **`INTEGRACION_ESCALAMIENTO_COMPLETADA.md`**
   - Resumen ejecutivo
   - Cambios técnicos
   - Troubleshooting

3. **`RESUMEN_FINAL_SESION_ESCALAMIENTO.md`**
   - Resumen de toda la implementación
   - Métricas y KPIs
   - Próximos pasos

---

## ⚠️ Troubleshooting

### Problema: Migración falla
```bash
# Solución: Forzar reset
npx prisma db push --force-reset
```

### Problema: Tests fallan
```bash
# Verificar que el archivo existe
dir src\lib\intelligent-escalation-system.ts

# Reinstalar si es necesario
npm install
```

### Problema: No detecta escalamientos
```bash
# Verificar que el bot está actualizado
npm run dev

# Revisar logs
# Debe aparecer: [Baileys] 🔍 Verificando si necesita escalamiento...
```

---

## ✅ Checklist de Activación

- [ ] Ejecutar `activar-escalamiento-ahora.bat`
- [ ] Verificar que migración se aplicó correctamente
- [ ] Verificar que todos los tests pasan
- [ ] Reiniciar bot con `npm run dev`
- [ ] Enviar mensaje de prueba (queja)
- [ ] Verificar en logs que detecta escalamiento
- [ ] Verificar en BD que marca conversación
- [ ] Confirmar que bot NO responde automáticamente

---

## 🎉 ¡Listo!

Una vez completados estos pasos, el sistema estará **100% funcional**.

El bot ahora sabe cuándo necesita ayuda humana y actuará en consecuencia.

**¿Dudas?** Lee la documentación completa en:
- `SISTEMA_ESCALAMIENTO_HUMANO_COMPLETO.md`

---

**Estado:** ✅ LISTO PARA ACTIVAR  
**Tiempo estimado:** 5 minutos  
**Dificultad:** Fácil (script automático)
