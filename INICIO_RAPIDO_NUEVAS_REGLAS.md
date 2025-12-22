# 🚀 INICIO RÁPIDO - NUEVAS REGLAS

## ⚡ EN 3 PASOS

### 1️⃣ Probar con script automatizado
```bash
npx tsx scripts/test-nuevas-reglas-bot.ts
```

### 2️⃣ Reiniciar el bot
```bash
npm run dev
```

### 3️⃣ Probar en WhatsApp
Envía: **"Hola, tienes el curso de piano?"**

---

## ✅ ¿QUÉ CAMBIÓ?

El bot ahora responde **SOLO lo que se pregunta**, sin ofrecer productos adicionales.

### Ejemplo:

**ANTES:**
```
Cliente: Tienes el curso de piano?
Bot: Sí, y también tengo Excel, Photoshop, megapacks...
```

**DESPUÉS:**
```
Cliente: Tienes el curso de piano?
Bot: ¡Hola! 😄 Sí, el Curso de Piano está disponible ✅
     [Info completa del curso]
     ¿Te interesa?
```

---

## 📚 DOCUMENTACIÓN

- **Reglas completas:** `NUEVAS_REGLAS_BOT_INTEGRADAS.md`
- **Ejemplos visuales:** `EJEMPLOS_VISUALES_NUEVAS_REGLAS.md`
- **Comandos:** `COMANDOS_PROBAR_NUEVAS_REGLAS.md`
- **Checklist:** `CHECKLIST_VERIFICACION_REGLAS.md`

---

## 🎯 CASOS DE PRUEBA

1. "Hola, tienes el curso de piano?" → Solo piano
2. "Tienes laptops?" → Pregunta qué tipo busca
3. "Quiero el super megapack" → Megapack de 40 cursos
4. "Cuánto cuesta la MacBook?" → Solo MacBook

---

## ✅ LISTO

**El bot ahora es más preciso y profesional** 🎉
