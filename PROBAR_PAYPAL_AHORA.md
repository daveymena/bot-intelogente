# 🚀 PROBAR PAYPAL DINÁMICO AHORA

## ✅ Paso 1: Verificar Variables de Entorno

Las credenciales ya fueron agregadas al `.env`. Verifica que estén ahí:

```bash
# Buscar en el .env
findstr "PAYPAL_CLIENT_ID" .env
```

Deberías ver:
```
PAYPAL_CLIENT_ID=BAAtdQwVN8LvIoRstmHZWlo2ndcJBP8dFZdXLc8HJGdYUXstriO6mO0GJMZimkBCdZHotBkulELqeFm_R4
PAYPAL_CLIENT_SECRET=EP5jZdzbUuHva4I8ERnbNYSHQ_BNe0niXQe91Bvf33Kl88nRKY-ivRx0_PGERS72JbjQSiMr63y9lEEL
PAYPAL_MODE=live
PAYPAL_API_URL=https://api-m.paypal.com
COP_TO_USD_RATE=4000
```

## ✅ Paso 2: Ejecutar Test

```bash
npx tsx scripts/test-paypal-dinamico.ts
```

## ✅ Paso 3: Ver el Resultado

El test debería:
1. ✅ Detectar las credenciales de PayPal
2. ✅ Buscar un producto activo
3. ✅ Generar un link dinámico de PayPal
4. ✅ Mostrar el link completo

### Resultado Esperado:

```
🧪 INICIANDO TEST DE PAYPAL DINÁMICO
============================================================

📋 VERIFICANDO CONFIGURACIÓN:
   PAYPAL_CLIENT_ID: ✅ Configurado
   PAYPAL_CLIENT_SECRET: ✅ Configurado
   PAYPAL_MODE: live
   COP_TO_USD_RATE: 4000

🔍 BUSCANDO PRODUCTO DE PRUEBA...
✅ Producto encontrado: Curso de Piano Completo
   ID: abc123
   Precio: 50,000 COP

💳 GENERANDO LINK DE PAYPAL...
============================================================
[PaymentLink] 💰 Generando link PayPal dinámico con API:
   Producto: Curso de Piano Completo
   Precio COP: 50,000
   Precio USD: 12.50
   Tasa: 1 USD = 4000 COP
[PaymentLink] ✅ Link PayPal dinámico generado: https://www.paypal.com/checkoutnow?token=XXXXX
[PaymentLink] 📦 Order ID: 5O190127TN364715T

📊 RESULTADO:
============================================================
✅ Link generado exitosamente!

🔗 Link de PayPal:
https://www.paypal.com/checkoutnow?token=5O190127TN364715T

✅ Es un link DINÁMICO (API REST v2)
   El link crea una orden real en PayPal

============================================================
✅ TEST COMPLETADO
============================================================
```

## 🔧 Si las Variables No Se Detectan

Si el test muestra "❌ No configurado", significa que las variables no se cargaron. Haz esto:

### Opción 1: Reiniciar Terminal
```bash
# Cierra y abre una nueva terminal PowerShell
exit
```

### Opción 2: Cargar Variables Manualmente
```powershell
$env:PAYPAL_CLIENT_ID="BAAtdQwVN8LvIoRstmHZWlo2ndcJBP8dFZdXLc8HJGdYUXstriO6mO0GJMZimkBCdZHotBkulELqeFm_R4"
$env:PAYPAL_CLIENT_SECRET="EP5jZdzbUuHva4I8ERnbNYSHQ_BNe0niXQe91Bvf33Kl88nRKY-ivRx0_PGERS72JbjQSiMr63y9lEEL"
$env:PAYPAL_MODE="live"
$env:COP_TO_USD_RATE="4000"
```

Luego ejecuta el test de nuevo:
```bash
npx tsx scripts/test-paypal-dinamico.ts
```

## 🎯 Probar en el Bot Real

Una vez que el test funcione, prueba en WhatsApp:

1. Envía: `Hola, quiero el curso de piano`
2. Cuando el bot ofrezca métodos de pago, responde: `PayPal`
3. El bot debería enviar un link dinámico como:
   ```
   🔗 Link de PayPal:
   https://www.paypal.com/checkoutnow?token=XXXXX
   ```

## 📝 Notas Importantes

- ✅ Las credenciales son de **producción** (PAYPAL_MODE=live)
- ✅ Los links generados son **reales** y funcionales
- ✅ El sistema convierte automáticamente COP → USD
- ✅ Cada link es único y expira en 3 horas
- ✅ Si falla la API, usa fallback automático

## 🚨 Troubleshooting

### Error: "PAYPAL_CLIENT_ID: ❌ No configurado"
**Solución:** Las variables no se cargaron. Reinicia la terminal o cárgalas manualmente.

### Error: "PayPal Auth error: 401"
**Solución:** Verifica que las credenciales sean correctas y coincidan con el modo (live/sandbox).

### Error: "No se encontró ningún producto activo"
**Solución:** Agrega un producto activo en la base de datos o cambia el filtro del test.

## ✅ Siguiente Paso

Una vez que el test funcione correctamente, el sistema está listo para usar en producción. Los clientes recibirán links dinámicos reales de PayPal cuando soliciten pagar por ese método.
