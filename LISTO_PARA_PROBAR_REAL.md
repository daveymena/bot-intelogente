# 🚀 LISTO PARA PROBAR EN REAL

## ⚡ Configuración Final

**Modelo:** gemma2:2b (rápido y ligero)  
**Velocidad:** 2-5 segundos  
**Costo:** $0/mes

---

## 🎯 Iniciar

```bash
npm run dev
```

1. Abre http://localhost:3000
2. Conecta WhatsApp
3. Prueba con tu número

---

## 💡 Cómo Funciona

**IA (gemma2:2b):** Coordinador  
- Entiende al cliente
- Llama a los agentes
- Responde al cliente

**Agentes del Sistema:** Ejecutores  
- Buscan productos en BD
- Generan links de pago (MercadoPago/PayPal)
- Envían fotos

---

## 📊 Velocidades

- "Hola" → 0.001s ⚡
- "Busco laptop" → 3-8s
- "Generar link" → 3-8s
- **Promedio: 2-5s**

---

## 🧪 Prueba Esto

1. **Saludo:** "Hola"
2. **Búsqueda:** "Busco una laptop"
3. **Contexto:** "Cuéntame de la opción 1"
4. **Pago:** "Genérame el link"

---

## ⚠️ Si Algo Falla

### Muy lento:
```env
# En .env
OLLAMA_MAX_TOKENS=100
```

### Pierde contexto:
```env
# En .env
OLLAMA_MODEL=llama3.1:8b
```

### Necesita velocidad extrema:
```env
# En .env
DISABLE_GROQ=false
```

---

## 📝 Después de Probar

Anota:
- ¿Velocidad aceptable?
- ¿Respuestas correctas?
- ¿Mantiene contexto?
- ¿Qué mejorar?

---

## 💰 Ahorro

**$9,000/año** vs Groq

---

**Estado:** 🟢 LISTO

**¡A probar! 🎉**
