# 🧪 Cómo Probar el Flujo de Ventas Completo

## 🚀 Inicio Rápido

### 1. Inicia el servidor
```bash
npm run dev
```

### 2. Configura el rol del bot
1. Ve a: http://localhost:3000/dashboard/bot-config
2. Selecciona: **"Agente Profesional de Ventas"**
3. Haz clic en **"Guardar Personalidad"**

### 3. Conecta WhatsApp
1. Ve al dashboard
2. Escanea el código QR con WhatsApp
3. Espera a que se conecte

### 4. Prueba el flujo completo

## 📱 Conversación de Prueba

### Escenario 1: Venta Exitosa

```
TÚ: "Hola"

BOT: "¡Hola! 👋 Bienvenido a Tecnovariedades D&S.
      ¿En qué puedo ayudarte hoy?"

---

TÚ: "Busco un laptop"

BOT: "¡Perfecto! 💻 Para recomendarte el ideal:
      ¿Para qué lo vas a usar principalmente?"

[✅ Técnica SPIN - Pregunta Situacional]

---

TÚ: "Para trabajo y estudio"

BOT: [Busca en base de datos]
     "¡Excelente! Tengo justo lo que necesitas:
      
      💻 ASUS VivoBook 15
      ✅ Intel Core i5 (11va Gen)
      ✅ 8GB RAM
      ✅ 512GB SSD
      ✅ Pantalla 15.6" Full HD
      
      💰 Precio: $2.500.000 COP
      
      Ideal para trabajo y estudio fluido.
      ¿Te gustaría más información?"

[✅ Búsqueda en BD + Presentación]

---

TÚ: "Sí, pero me parece caro"

BOT: "Entiendo tu preocupación por el precio.
      
      Considera que:
      • Ahorras $300.000 vs otros modelos similares
      • Incluye garantía de 1 año
      • Más de 200 clientes satisfechos
      
      Además, puedes pagarlo en cuotas.
      ¿Cuál sería tu presupuesto ideal?"

[✅ Manejo de Objeción + Social Proof]

---

TÚ: "Hasta 2 millones"

BOT: [Busca alternativas en BD según presupuesto]
     "¡Perfecto! Tengo una excelente opción:
      
      💻 Lenovo IdeaPad 3
      ✅ Intel Core i3
      ✅ 8GB RAM
      ✅ 256GB SSD
      
      💰 Precio: $1.850.000 COP
      
      Solo quedan 2 unidades con este precio.
      ¿Te lo aparto ahora? 😊"

[✅ Búsqueda por Presupuesto + Escasez + Cierre]

---

TÚ: "Sí, me interesa"

BOT: "¡Excelente decisión! 🎉
      
      💳 Métodos de pago:
      • Mercado Pago: [link]
      • Nequi: 304 274 8687
      • Tarjeta de crédito: [link]
      
      📦 Envío gratis
      🛡️ Garantía de 1 año
      
      ¿Con cuál método prefieres pagar?"

[✅ Cierre Exitoso]
```

### Escenario 2: Cliente Indeciso

```
TÚ: "Hola, me interesa el curso de piano"

BOT: [Busca en BD]
     "¡Excelente elección! 🎹
      
      📚 Curso de Piano Profesional
      ✅ 50+ lecciones en video
      ✅ Acceso de por vida
      ✅ Certificado incluido
      
      💰 Precio: $150.000 COP
      
      ¿Qué te gustaría saber?"

---

TÚ: "No sé si me sirva"

BOT: "Entiendo tu duda. Déjame contarte:
      
      Este curso es ideal si:
      • Quieres aprender desde cero
      • Buscas flexibilidad de horarios
      • Prefieres aprender a tu ritmo
      
      Más de 500 estudiantes ya lo han tomado
      con excelentes resultados.
      
      ¿Tienes experiencia previa con piano?"

[✅ Manejo de Duda + Social Proof + Pregunta]

---

TÚ: "No, soy principiante"

BOT: "¡Perfecto! Este curso está diseñado
      específicamente para principiantes.
      
      Empiezas desde lo más básico y avanzas
      paso a paso. Imagina que en 3 meses
      ya estarás tocando tus primeras canciones.
      
      Hoy tenemos una oferta especial:
      $150.000 (antes $250.000)
      
      ¿Te gustaría comprarlo ahora?"

[✅ Visualización + Urgencia + Cierre]
```

### Escenario 3: Comparación de Productos

```
TÚ: "Quiero comparar laptops"

BOT: "¡Claro! Te ayudo a comparar.
      
      ¿Qué características son más importantes
      para ti?
      • Precio
      • Rendimiento
      • Portabilidad
      • Batería"

[✅ Pregunta de Calificación]

---

TÚ: "Precio y rendimiento"

BOT: [Busca en BD]
     "Perfecto, te muestro las mejores opciones:
      
      💻 Opción 1: ASUS VivoBook
      • Core i5 + 8GB RAM
      • $2.500.000
      • Mejor rendimiento
      
      💻 Opción 2: Lenovo IdeaPad
      • Core i3 + 8GB RAM
      • $1.850.000
      • Mejor precio
      
      ¿Cuál se ajusta más a tu presupuesto?"

[✅ Comparación + Pregunta de Cierre]
```

## 🔍 Qué Observar

### En los Logs del Servidor:
```bash
[AI] 🎯 Ejecutando flujo de ventas profesional...
[AI] ✅ Flujo de ventas ejecutado: close_attempt
[AI] 📊 Técnica usada: SPIN
[AI] 💰 Limitación de presupuesto detectada: 2000000
[AI] 🔍 Búsqueda en BD - Producto encontrado: Lenovo IdeaPad
```

### En las Respuestas del Bot:
- ✅ Hace preguntas para entender necesidades
- ✅ Busca productos en la base de datos
- ✅ Presenta productos con beneficios claros
- ✅ Maneja objeciones profesionalmente
- ✅ Intenta cerrar la venta
- ✅ Ofrece facilidades de pago

## ✅ Checklist de Verificación

- [ ] Bot saluda profesionalmente
- [ ] Hace preguntas para entender necesidades
- [ ] Busca productos en la base de datos
- [ ] Presenta productos con precio y beneficios
- [ ] Maneja objeciones de precio
- [ ] Ofrece alternativas según presupuesto
- [ ] Intenta cerrar la venta
- [ ] Proporciona métodos de pago
- [ ] Usa técnicas de venta (SPIN, Social Proof, etc.)
- [ ] Mantiene contexto de la conversación

## 🐛 Solución de Problemas

### Si el bot no responde:
```bash
# Verifica que el servidor esté corriendo
npm run dev

# Verifica la conexión de WhatsApp
# Ve al dashboard y revisa el estado
```

### Si no busca en la base de datos:
```bash
# Verifica que tengas productos en la BD
npx tsx scripts/ver-productos-ia.ts

# Verifica los logs
[AI] 🔍 Búsqueda en BD...
```

### Si no aplica técnicas de venta:
```bash
# Verifica que el rol esté configurado
# Dashboard → Bot Config → Agente Profesional de Ventas

# Verifica en logs:
[AI] 🎭 Usando personalidad personalizada del dashboard
[AI] 🎯 Ejecutando flujo de ventas profesional...
```

## 📊 Métricas a Monitorear

### En el Dashboard:
- Número de conversaciones
- Productos más consultados
- Tasa de conversión
- Objeciones más comunes

### En los Logs:
- Técnicas más usadas
- Productos más buscados
- Presupuestos mencionados
- Cierres exitosos

## 🎯 Próximos Pasos

1. **Prueba con clientes reales** en WhatsApp
2. **Monitorea las conversaciones** en el dashboard
3. **Ajusta la personalidad** según resultados
4. **Optimiza productos** en la base de datos
5. **Analiza métricas** para mejorar

## 📚 Documentación Adicional

- **Guía completa:** `SISTEMA_FLUJO_VENTAS_COMPLETO.md`
- **Resumen rápido:** `RESUMEN_FLUJO_VENTAS_FINAL.txt`
- **Configuración:** `EMPEZAR_PERSONALIDAD_BOT.md`

---

**¡Listo para probar!** 🚀

Inicia el servidor, configura el rol y prueba una conversación completa.
