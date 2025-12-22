# 💳 Configuración de Métodos de Pago

## 📋 Dos Formas de Configurar Pagos

### ✅ Opción 1: Métodos Manuales (Recomendado para la mayoría)

**¿Qué es?**
Solo ingresas tus datos bancarios (Nequi, Daviplata, Banco). El bot compartirá automáticamente esta información cuando el cliente quiera pagar.

**Ventajas:**
- ✅ Súper fácil de configurar
- ✅ No requiere conocimientos técnicos
- ✅ No necesitas cuenta de desarrollador
- ✅ Funciona inmediatamente
- ✅ Sin comisiones adicionales de APIs

**¿Cómo funciona?**
1. Ingresas tus datos en el Dashboard → Configuración → Métodos de Pago
2. Cuando un cliente dice "quiero pagar", el bot responde:

```
💳 Puedes realizar el pago por cualquiera de estos métodos:

📱 Nequi: 300 123 4567
   Titular: Juan Pérez

📱 Daviplata: 300 123 4567
   Titular: Juan Pérez

🏦 Bancolombia
   Tipo: Ahorros
   Cuenta: 12345678901
   Titular: Juan Pérez

Una vez realices el pago, envíame el comprobante para confirmar tu pedido 📸
```

**Campos a llenar:**

**Nequi:**
- Número de Nequi (requerido)
- Nombre del titular (opcional)

**Daviplata:**
- Número de Daviplata (requerido)
- Nombre del titular (opcional)

**Cuenta Bancaria:**
- Banco (ej: Bancolombia, Davivienda)
- Tipo de cuenta (Ahorros/Corriente)
- Número de cuenta
- Titular

---

### ⚙️ Opción 2: APIs de Pago Automático (Avanzado - Opcional)

**¿Qué es?**
Integración con MercadoPago y PayPal para generar links de pago automáticos.

**Ventajas:**
- ✅ Links de pago únicos por transacción
- ✅ Confirmación automática de pagos
- ✅ Acepta tarjetas de crédito/débito
- ✅ Pagos internacionales (PayPal)

**Desventajas:**
- ❌ Requiere cuenta de desarrollador
- ❌ Más complejo de configurar
- ❌ Comisiones por transacción (MercadoPago ~3-4%, PayPal ~4-5%)
- ❌ Requiere conocimientos técnicos

**¿Cuándo usar esto?**
- Si vendes productos de alto valor
- Si necesitas confirmación automática de pagos
- Si vendes internacionalmente
- Si quieres aceptar tarjetas de crédito

**Campos a llenar:**

**MercadoPago:**
- Access Token (APP_USR-...)
- Public Key (APP_USR-...)

**PayPal:**
- Client ID
- Client Secret
- Email de PayPal

---

## 🎯 ¿Cuál opción elegir?

### Usa Métodos Manuales si:
- ✅ Eres un negocio pequeño/mediano
- ✅ Vendes principalmente en Colombia
- ✅ Quieres algo simple y rápido
- ✅ No quieres pagar comisiones adicionales
- ✅ Tus clientes están acostumbrados a Nequi/Daviplata

### Usa APIs Automáticas si:
- ✅ Vendes productos de alto valor (>$500.000 COP)
- ✅ Necesitas confirmación automática
- ✅ Vendes internacionalmente
- ✅ Quieres aceptar tarjetas de crédito
- ✅ Tienes conocimientos técnicos o desarrollador

---

## 💡 Recomendación

**Para el 90% de los negocios: Usa Métodos Manuales**

Es más simple, más rápido, sin comisiones adicionales, y funciona perfectamente para ventas locales en Colombia.

Solo considera las APIs si realmente necesitas las funcionalidades avanzadas.

---

## 🔧 Cómo Configurar Métodos Manuales

1. Ve a **Dashboard → Configuración**
2. Scroll hasta **"Métodos de Pago Manuales"**
3. Llena los datos que uses:
   - Nequi (si tienes)
   - Daviplata (si tienes)
   - Cuenta Bancaria (si aceptas transferencias)
4. Haz clic en **"Guardar Configuración"**
5. ¡Listo! El bot ya puede compartir tus datos de pago

---

## 📝 Ejemplo de Conversación

**Cliente:** "Quiero comprar el portátil HP"

**Bot:** "¡Excelente elección! 💻

**Portátil HP Pavilion 15**
💰 Precio: $2,500,000 COP

¿Deseas proceder con el pago?"

**Cliente:** "Sí, cómo pago?"

**Bot:** "💳 Puedes realizar el pago por cualquiera de estos métodos:

📱 **Nequi:** 300 123 4567
   Titular: Juan Pérez

📱 **Daviplata:** 300 123 4567
   Titular: Juan Pérez

🏦 **Bancolombia**
   Tipo: Ahorros
   Cuenta: 12345678901
   Titular: Juan Pérez

Una vez realices el pago, envíame el comprobante para confirmar tu pedido 📸"

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo usar ambos métodos (manual + APIs)?**
R: Sí, puedes configurar ambos. El bot ofrecerá todas las opciones disponibles.

**P: ¿Es seguro compartir mis datos bancarios?**
R: Sí, solo compartes número de cuenta/Nequi, no contraseñas ni claves. Es lo mismo que dar tu número de cuenta a un cliente por WhatsApp.

**P: ¿El bot confirma automáticamente los pagos manuales?**
R: No, con métodos manuales el cliente debe enviarte el comprobante. Tú confirmas manualmente. Para confirmación automática necesitas las APIs.

**P: ¿Puedo cambiar los datos después?**
R: Sí, puedes editar los datos en cualquier momento desde el Dashboard.

**P: ¿Qué pasa si dejo todo vacío?**
R: El bot dirá "Contáctame para coordinar el pago" y te notificará para que gestiones el pago manualmente.

---

## 🚀 Próximos Pasos

1. Configura tus métodos de pago manuales
2. Prueba el bot preguntando "¿cómo puedo pagar?"
3. Verifica que muestre correctamente tus datos
4. ¡Empieza a vender!

---

**Última actualización:** 20 de Noviembre 2025
