# ⚡ CONFIGURAR EASYPANEL AHORA - Guía Rápida

**Tiempo estimado**: 5 minutos  
**Prioridad**: 🔴 CRÍTICA

---

## 🎯 OBJETIVO

Agregar la variable `ENCRYPTION_KEY` en Easypanel para que la aplicación pueda encriptar/desencriptar credenciales de pago.

---

## 📋 PASOS RÁPIDOS

### 1. Acceder a Easypanel (1 min)

```
URL: https://easypanel.io
```

1. Login con tu cuenta
2. Click en tu proyecto
3. Click en "bot-whatsapp-bot-whatsapp-inteligente"

### 2. Ir a Variables de Entorno (30 seg)

```
1. En el menú lateral, click en "Environment" o "Variables"
2. Verás la lista de variables actuales
```

### 3. Agregar ENCRYPTION_KEY (1 min)

**Copiar este valor EXACTO**:
```
825cef657fc011fb81729ca0618ecd771c102582afba29c61ba4442a7b53022f
```

**Agregar variable**:
```
Nombre:  ENCRYPTION_KEY
Valor:   825cef657fc011fb81729ca0618ecd771c102582afba29c61ba4442a7b53022f
```

⚠️ **IMPORTANTE**: 
- Copiar el valor COMPLETO (64 caracteres)
- NO agregar espacios ni saltos de línea
- NO compartir esta clave públicamente

### 4. Guardar Cambios (30 seg)

```
1. Click en "Save" o "Update"
2. Confirmar cambios
```

### 5. Rebuild Aplicación (2 min)

```
1. Ir a "Deploy" o "Build"
2. Click en "Rebuild" o "Redeploy"
3. Esperar 2-3 minutos
```

### 6. Verificar Logs (1 min)

```
1. Click en "Logs"
2. Buscar: "✅ Sistema de suscripciones SaaS activo"
3. NO debe haber errores de ENCRYPTION_KEY
```

---

## ✅ VERIFICACIÓN

### Verificar que la variable existe:

En la consola de Easypanel:
```bash
echo $ENCRYPTION_KEY
```

**Debe mostrar**:
```
825cef657fc011fb81729ca0618ecd771c102582afba29c61ba4442a7b53022f
```

### Verificar en la aplicación:

1. Abrir: `https://bot-whatsapp-bot-whatsapp-inteligente.sqaoeo.easypanel.host`
2. Login al dashboard
3. Ir a: Configuración → Métodos de Pago
4. Habilitar MercadoPago
5. Ingresar credenciales
6. Click "Probar Conexión"
7. Debe funcionar ✅

---

## 🔍 TROUBLESHOOTING

### Error: "ENCRYPTION_KEY no está configurada"

**Solución**:
```
1. Verificar que agregaste la variable en Easypanel
2. Verificar que el nombre es exactamente: ENCRYPTION_KEY
3. Hacer rebuild de la aplicación
4. Esperar 2-3 minutos
```

### Error: "Error al desencriptar datos"

**Solución**:
```
1. Verificar que la clave es la correcta (64 caracteres)
2. NO debe tener espacios ni saltos de línea
3. Ejecutar script de migración:
   npx tsx scripts/migrate-encrypt-credentials.ts
```

### La aplicación no inicia

**Solución**:
```
1. Ver logs en Easypanel
2. Buscar errores relacionados con ENCRYPTION_KEY
3. Verificar que todas las variables están configuradas
4. Hacer rebuild limpio
```

---

## 📊 CHECKLIST

Antes de continuar, verifica:

- [ ] Variable ENCRYPTION_KEY agregada en Easypanel
- [ ] Valor correcto (64 caracteres hex)
- [ ] Cambios guardados
- [ ] Rebuild completado
- [ ] Logs sin errores
- [ ] Dashboard accesible
- [ ] Configuración de pagos funciona

---

## 🚀 DESPUÉS DE CONFIGURAR

### 1. Probar en Producción (5 min)

```
1. Abrir dashboard en producción
2. Ir a Configuración → Métodos de Pago
3. Configurar MercadoPago o PayPal
4. Click "Probar Conexión"
5. Verificar: ✅ Conexión exitosa
6. Guardar cambios
7. Recargar página
8. Verificar ofuscación: ****1234
```

### 2. Migrar Datos Existentes (5 min)

Si ya tenías credenciales guardadas antes:

```bash
# En tu máquina local o en Easypanel console
npx tsx scripts/migrate-encrypt-credentials.ts
```

Esto encriptará todas las credenciales que estaban en texto plano.

### 3. Verificar Seguridad (2 min)

```bash
# Conectar a PostgreSQL
psql $DATABASE_URL

# Ver datos encriptados
SELECT 
  userId,
  mercadopagoEnabled,
  LEFT(mercadopagoAccessToken, 50) as token_preview
FROM "PaymentIntegration"
LIMIT 1;

# Debe mostrar algo como:
# token_preview: a1b2c3d4e5f6:1234567890ab:9876...
```

---

## 🎉 LISTO!

Una vez completados todos los pasos:

✅ Encriptación funcionando en producción  
✅ Credenciales protegidas  
✅ Validación en tiempo real activa  
✅ Rate limiting funcionando  
✅ Sistema seguro y listo para usar  

---

## 📞 SOPORTE

Si tienes problemas:

1. **Revisar logs**: Click en "Logs" en Easypanel
2. **Verificar variables**: Ir a "Environment" y verificar ENCRYPTION_KEY
3. **Rebuild limpio**: Hacer rebuild completo
4. **Consultar documentación**: Ver `AUDITORIA_DASHBOARD_COMPLETA.md`

---

## 🔗 ENLACES ÚTILES

- **Dashboard**: https://bot-whatsapp-bot-whatsapp-inteligente.sqaoeo.easypanel.host
- **Easypanel**: https://easypanel.io
- **GitHub**: https://github.com/daveymena/bot-intelogente

---

**Tiempo total**: 5 minutos  
**Dificultad**: Fácil  
**Impacto**: 🔴 CRÍTICO (seguridad de datos de pago)

---

**¡HAZLO AHORA!** ⚡

La seguridad de las credenciales de pago de tus clientes depende de esto.
