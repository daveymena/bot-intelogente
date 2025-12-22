# ⚡ CONFIGURAR N8N EASYPANEL - PASO A PASO

## 🎯 Objetivo

Conectar tu Smart Sales Bot con n8n en Easypanel para que n8n maneje toda la lógica.

## 📋 Checklist Rápido

- [ ] Obtener URLs de Easypanel
- [ ] Configurar variables de entorno
- [ ] Importar workflow en n8n
- [ ] Probar conexión
- [ ] Enviar mensaje de prueba

## 🚀 PASO 1: Obtener URLs (2 minutos)

### 1.1 URL de n8n

1. Ir a Easypanel → Tu app n8n
2. Copiar URL pública, ejemplo:
   ```
   https://n8n.tudominio.com
   ```
3. O URL interna (si está en la misma red):
   ```
   http://n8n:5678
   ```

### 1.2 URL de tu Bot

1. Ir a Easypanel → Smart Sales Bot
2. Copiar URL pública:
   ```
   https://bot.tudominio.com
   ```
3. O URL interna:
   ```
   http://smart-sales-bot:3000
   ```

### 1.3 Datos PostgreSQL

1. Ir a Easypanel → PostgreSQL
2. Anotar:
   - Host: `postgres` (interno) o `postgres.tudominio.com`
   - Port: `5432`
   - Database: `smartsales`
   - User: tu usuario
   - Password: tu contraseña

## 🔧 PASO 2: Configurar Variables (5 minutos)

### 2.1 En Smart Sales Bot (Easypanel)

1. Ir a Easypanel → Smart Sales Bot → "Environment"
2. Agregar estas variables:

```bash
# n8n Configuration
N8N_WEBHOOK_URL=http://n8n:5678/webhook/whatsapp-incoming
N8N_API_KEY=TU_API_KEY_SEGURA_AQUI_123456

# Si n8n está en otro servidor, usar URL pública:
# N8N_WEBHOOK_URL=https://n8n.tudominio.com/webhook/whatsapp-incoming
```

3. Click "Save"
4. Click "Rebuild" para aplicar cambios

### 2.2 En n8n (Easypanel)

1. Ir a Easypanel → n8n → "Environment"
2. Agregar estas variables:

```bash
# Smart Sales Bot URL
SMART_SALES_BOT_URL=http://smart-sales-bot:3000
N8N_API_KEY=TU_API_KEY_SEGURA_AQUI_123456

# Si el bot está en otro servidor:
# SMART_SALES_BOT_URL=https://bot.tudominio.com

# PostgreSQL (para que n8n consulte la BD)
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=smartsales
POSTGRES_USER=tu_usuario
POSTGRES_PASSWORD=tu_password

# Ollama o Groq
OLLAMA_URL=http://ollama:11434
# o si usas Groq:
# GROQ_API_KEY=tu_groq_api_key
```

3. Click "Save"
4. Click "Restart" para aplicar cambios

### 2.3 Generar API Key Segura

```bash
# En tu terminal local, ejecutar:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copiar el resultado y usarlo como N8N_API_KEY en ambas apps
```

## 📦 PASO 3: Importar Workflow (3 minutos)

### 3.1 Acceder a n8n

1. Abrir: `https://n8n.tudominio.com`
2. Iniciar sesión

### 3.2 Importar Workflow

1. Click en "Workflows" (menú izquierdo)
2. Click en "Import from File"
3. Seleccionar archivo: `n8n-workflow-whatsapp-bot-easypanel.json`
4. Click "Import"

### 3.3 Configurar PostgreSQL

1. Click en nodo "PostgreSQL - Buscar Productos"
2. Click en "Credentials" → "Create New"
3. Llenar datos:
   ```
   Name: PostgreSQL - SmartSales Easypanel
   Host: postgres
   Database: smartsales
   User: tu_usuario
   Password: tu_password
   Port: 5432
   SSL: disable
   ```
4. Click "Save"
5. Click "Test" para verificar conexión
6. Si funciona, aplicar a todos los nodos PostgreSQL

### 3.4 Activar Workflow

1. Click en "Active" (toggle arriba a la derecha)
2. ✅ Debe aparecer en verde
3. El webhook ahora está escuchando en:
   ```
   https://n8n.tudominio.com/webhook/whatsapp-incoming
   ```

## 🧪 PASO 4: Probar Conexión (5 minutos)

### 4.1 Test: Bot → n8n

Desde tu terminal local o Easypanel console:

```bash
curl -X POST https://n8n.tudominio.com/webhook/whatsapp-incoming \
  -H "Content-Type: application/json" \
  -d '{
    "from": "573001234567@s.whatsapp.net",
    "message": "Hola, busco un portátil",
    "timestamp": 1234567890,
    "messageId": "test-123",
    "hasMedia": false
  }'
```

**Resultado esperado:**
```json
{
  "success": true,
  "timestamp": 1734480000000,
  "from": "573001234567@s.whatsapp.net",
  "processed": true
}
```

**Verificar en n8n:**
1. Ir a `https://n8n.tudominio.com/workflows`
2. Click en "WhatsApp Bot - Easypanel"
3. Tab "Executions"
4. Deberías ver la ejecución con todos los pasos

### 4.2 Test: n8n → Bot

Desde tu terminal:

```bash
curl -X POST https://bot.tudominio.com/api/whatsapp/send-from-n8n \
  -H "Content-Type: application/json" \
  -H "x-api-key: TU_API_KEY_AQUI" \
  -d '{
    "to": "573001234567@s.whatsapp.net",
    "message": "Hola desde n8n, esto es una prueba"
  }'
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "to": "573001234567@s.whatsapp.net",
  "timestamp": 1734480000000
}
```

### 4.3 Test: Flujo Completo

1. Conectar WhatsApp (escanear QR)
2. Enviar mensaje: "Hola, busco un portátil para diseño"
3. Ver en n8n:
   - `https://n8n.tudominio.com/workflows`
   - Tab "Executions"
   - Ver cada paso del workflow
4. Recibir respuesta en WhatsApp

## 📊 PASO 5: Monitoreo (Continuo)

### 5.1 Ver Logs en Easypanel

**Smart Sales Bot:**
```
Easypanel → Smart Sales Bot → "Logs"
```

Buscar:
- `📨 Mensaje recibido`
- `✅ Mensaje enviado a n8n`

**n8n:**
```
Easypanel → n8n → "Logs"
```

O mejor, usar la UI de n8n:
```
https://n8n.tudominio.com/workflows → Executions
```

### 5.2 Dashboard de n8n

Ver todas las ejecuciones:
1. `https://n8n.tudominio.com/workflows`
2. Click en "WhatsApp Bot - Easypanel"
3. Tab "Executions"
4. Click en cualquier ejecución para ver detalles
5. Ver input/output de cada nodo

## 🔒 PASO 6: Seguridad

### 6.1 Verificar API Key

Asegúrate de que la misma API key esté en:
- ✅ Smart Sales Bot (variable `N8N_API_KEY`)
- ✅ n8n (variable `N8N_API_KEY`)

### 6.2 Comunicación Interna (Recomendado)

Si ambas apps están en Easypanel, usa URLs internas:

**En Bot:**
```bash
N8N_WEBHOOK_URL=http://n8n:5678/webhook/whatsapp-incoming
```

**En n8n:**
```bash
SMART_SALES_BOT_URL=http://smart-sales-bot:3000
```

Ventajas:
- ✅ Más rápido
- ✅ Más seguro
- ✅ No consume ancho de banda externo

## 🚨 Troubleshooting

### Error: "Connection refused"

**Causa:** URLs incorrectas

**Solución:**
1. Verificar que ambas apps estén corriendo
2. Verificar URLs en variables de entorno
3. Si están en la misma red, usar URLs internas (`http://nombre-app:puerto`)

### Error: "Unauthorized"

**Causa:** API key incorrecta

**Solución:**
1. Verificar que `N8N_API_KEY` sea la misma en ambas apps
2. Regenerar API key si es necesario
3. Rebuild ambas apps

### Error: "Webhook not found"

**Causa:** Workflow no activado

**Solución:**
1. Ir a n8n → Workflows
2. Verificar que el workflow esté "Active" (verde)
3. Si no, activarlo

### Error: "PostgreSQL connection failed"

**Causa:** Credenciales incorrectas

**Solución:**
1. Verificar credenciales en n8n
2. Probar conexión manualmente:
   ```bash
   psql -h postgres -U tu_usuario -d smartsales
   ```
3. Actualizar credenciales en n8n

## ✅ Checklist Final

- [ ] Variables de entorno configuradas en Bot
- [ ] Variables de entorno configuradas en n8n
- [ ] Workflow importado en n8n
- [ ] PostgreSQL conectado en n8n
- [ ] Workflow activado (verde)
- [ ] Test Bot → n8n exitoso
- [ ] Test n8n → Bot exitoso
- [ ] Mensaje real por WhatsApp funciona
- [ ] Ejecuciones visibles en n8n

## 🎉 ¡Listo!

Ahora tienes:
- ✅ Bot simplificado (solo WhatsApp)
- ✅ n8n orquestando toda la lógica
- ✅ Todo en Easypanel
- ✅ Comunicación segura
- ✅ Fácil de monitorear

## 📚 Próximos Pasos

1. **Personalizar respuestas**: Editar prompt en nodo Ollama
2. **Agregar más workflows**: Seguimiento, pagos, etc.
3. **Optimizar**: Ajustar timeouts, agregar reintentos
4. **Escalar**: Agregar más instancias si es necesario

## 💡 Tips

- Usa la UI de n8n para debugging (es visual)
- Guarda versiones de tus workflows
- Prueba cambios en workflow de desarrollo primero
- Monitorea ejecuciones regularmente

**¿Necesitas ayuda? Revisa los logs en Easypanel o las ejecuciones en n8n.** 🚀
