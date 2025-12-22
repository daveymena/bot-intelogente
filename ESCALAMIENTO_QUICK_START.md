# ⚡ QUICK START: Sistema de Escalamiento Inteligente

## 🚀 Activación en 30 Segundos

```bash
# 1. Activar todo automáticamente
activar-escalamiento-ahora.bat

# 2. Reiniciar bot
npm run dev

# 3. ¡Listo! El sistema ya está funcionando
```

---

## 🎯 ¿Qué Hace?

El bot ahora detecta automáticamente cuándo necesita ayuda humana y:
- ✅ Detiene respuestas automáticas
- ✅ Envía mensaje apropiado al cliente
- ✅ Marca conversación en dashboard
- ✅ Notifica para atención prioritaria

---

## 📋 Casos que Escalan

| Situación | Ejemplo | Acción |
|-----------|---------|--------|
| 🔴 Queja | "El producto no funciona!" | → Humano |
| 💳 Pago | "Pagué pero no recibí nada" | → Humano |
| 🔧 Técnico | "¿Soporta VT-x?" | → Humano |
| 💼 Negociación | "¿Descuento por 3?" | → Humano |
| ✅ Simple | "¿Cuánto cuesta?" | → Bot |

---

## 🔍 Verificar que Funciona

### En Logs
```
[Baileys] 🚨 ESCALAMIENTO DETECTADO: Queja sobre producto
[Baileys] ✅ Conversación escalada a humano
```

### En Base de Datos
```sql
SELECT * FROM conversations WHERE needsHumanAttention = true;
```

---

## 📚 Documentación

- **Guía Completa:** `SISTEMA_ESCALAMIENTO_HUMANO_COMPLETO.md`
- **Integración:** `INTEGRACION_ESCALAMIENTO_COMPLETADA.md`
- **Diagrama:** `DIAGRAMA_FLUJO_ESCALAMIENTO.md`

---

## 🧪 Probar

```bash
# Ejecutar tests
probar-escalamiento.bat

# O manual
npx tsx test-escalamiento-inteligente.ts
```

---

## ✅ Checklist

- [ ] Ejecutar `activar-escalamiento-ahora.bat`
- [ ] Reiniciar bot
- [ ] Enviar mensaje de prueba (queja)
- [ ] Verificar logs
- [ ] Confirmar marca en BD

---

**¡Listo en 30 segundos!** 🚀
