# ⭐ TODO EN EASYPANEL - Configuración Final

## 🎯 Tu Escenario Ideal

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TODO EN EASYPANEL (Red Privada)                   │
│                                                                       │
│  ┌──────────────────┐         ┌──────────────────┐                 │
│  │  Smart Sales Bot │◄───────►│   PostgreSQL     │                 │
│  │  (Baileys)       │  Interno│   Database       │                 │
│  │                  │         │                  │                 │
│  │  Port: 3000      │         │  Port: 5432      │                 │
│  └────────┬─────────┘         └────────▲─────────┘                 │
│           │                             │                            │
│           │ ① http://n8n:5678          │ ③ postgres:5432           │
│           │                             │                            │
│           ▼                             │                            │
│  ┌──────────────────┐         ┌────────┴─────────┐                 │
│  │      n8n         │────────►│   Ollama/Groq    │                 │
│  │  (Orquestador)   │  Interno│   (IA)           │                 │
│  │                  │         │                  │                 │
│  │  Port: 5678      │         │  Port: 11434     │                 │
│  └────────┬─────────┘         └──────────────────┘                 │
│           │                                                          │
│           │ ⑤ http://smart-sales-bot:3000                          │
│           │                                                          │
└───────────┼──────────────────────────────────────────────────────────┘
            │
            ▼
    ┌───────────────┐
    │   WhatsApp    │
    │   Cliente     │
    └───────────────┘
```

## ✅ Ventajas de Esta Configuración

1. **Todo en red privada** - Comunicación súper rápida
2. **URLs internas** - No sale a internet
3. **Más seguro** - Red privada de Easypanel
4. **Más simple** - No necesitas ngrok ni exponer puertos
5. **Siempre disponible** - No depende de tu PC

## 🚀 Configuración en 3 Pasos

### PASO 1: Configurar Variables en Smart Sales Bot (Easypanel)

1. Ir a Easypanel → Tu app "Smart Sales Bot"
2. Click en "Environment"
3. Agregar estas variables:

```bash
# n8n (URL interna - red privada de Easypanel)
N8N_WEBHOOK_URL=http://n8n:5678/webhook/whatsapp-incoming
N8N_API_KEY=genera-una-api-key-segura-aqui-123456

# PostgreSQL (URL interna)
DATABASE_URL=postgresql://user:pass@postgres:5432/smartsales

# Ollama (si lo tienes en Easypanel)
OLLAMA_URL=http://ollama:11434

# O Groq (si usas API externa)
GROQ_API_KEY=tu-groq-api-key

# Otras variables que ya tienes...
NEXTAUTH_SECRET=tu-secret
NEXTAUTH_URL=https://bot.tudominio.com
```

4. Click "Save"
5. Click "Rebuild" para aplicar cambios

### PASO 2: Configurar Variables en n8n (Easypanel)

1. Ir a Easypanel → Tu app "n8n"
2. Click en "Environment"
3. Agregar estas variables:

```bash
# Smart Sales Bot (URL interna)
SMART_SALES_BOT_URL=http://smart-sales-bot:3000
N8N_API_KEY=la-misma-api-key-que-en-el-bot-123456

# PostgreSQL (URL interna)
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=smartsales
POSTGRES_USER=tu_usuario
POSTGRES_PASSWORD=tu_password

# Ollama (si lo tienes en Easypanel)
OLLAMA_URL=http://ollama:11434

# O Groq
GROQ_API_KEY=tu-groq-api-key
```

4. Click "Save"
5. Click "Restart" para aplicar cambios

### PASO 3: Importar Workflow en n8n

1. Abrir n8n: `https://n8n.tudominio.com`
2. Click en "Workflows" → "Import from File"
3. Seleccionar: `n8n-workflow-whatsapp-bot-easypanel.json`
4. Configurar credenciales PostgreSQL:
   - Host: `postgres`
   - Database: `smartsales`
   - User: tu usuario
   - Password: tu contraseña
   - Port: `5432`
   - SSL: `disable`
5. Click "Active" para activar el workflow

## 🔧 Nombres de Servicios en Easypanel

**Importante:** Los nombres internos en Easypanel son los nombres de tus apps.

Por ejemplo, si tus apps se llaman:
- `smart-sales-bot` → URL interna: `http://smart-sales-bot:3000`
- `n8n` → URL interna: `http://n8n:5678`
- `postgres` → URL interna: `postgres:5432`

**Verificar nombres:**
1. Ir a Easypanel → "Apps"
2. Ver el nombre de cada app
3. Usar ese nombre en las URLs internas

## 📝 Ejemplo Completo de Variables

### En Smart Sales Bot:

```bash
# ===== n8n Integration =====
N8N_WEBHOOK_URL=http://n8n:5678/webhook/whatsapp-incoming
N8N_API_KEY=abc123def456ghi789jkl012mno345pqr678

# ===== Database =====
DATABASE_URL=postgresql://smartsales_user:mi_password_segura@postgres:5432/smartsales

# ===== AI Provider =====
# Opción 1: Ollama (si lo tienes en Easypanel)
OLLAMA_URL=http://ollama:11434

# Opción 2: Groq (API externa)
GROQ_API_KEY=gsk_tu_api_key_de_groq_aqui

# ===== NextAuth =====
NEXTAUTH_SECRET=tu_secret_super_seguro_aqui
NEXTAUTH_URL=https://bot.tudominio.com

# ===== Email (opcional) =====
RESEND_API_KEY=re_tu_api_key_de_resend
EMAIL_FROM=noreply@tudominio.com

# ===== Payments (opcional) =====
MERCADOPAGO_ACCESS_TOKEN=tu_token_de_mercadopago
```

### En n8n:

```bash
# ===== Smart Sales Bot =====
SMART_SALES_BOT_URL=http://smart-sales-bot:3000
N8N_API_KEY=abc123def456ghi789jkl012mno345pqr678

# ===== PostgreSQL =====
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=smartsales
POSTGRES_USER=smartsales_user
POSTGRES_PASSWORD=mi_password_segura

# ===== AI Provider =====
# Opción 1: Ollama
OLLAMA_URL=http://ollama:11434

# Opción 2: Groq
GROQ_API_KEY=gsk_tu_api_key_de_groq_aqui
```

## 🧪 Probar Conexión

### Test 1: Desde Easypanel Console (Smart Sales Bot)

1. Ir a Easypanel → Smart Sales Bot → "Console"
2. Ejecutar:

```bash
# Probar conexión a n8n
curl http://n8n:5678/webhook/whatsapp-incoming

# Probar conexión a PostgreSQL
psql $DATABASE_URL -c "SELECT 1"

# Probar conexión a Ollama (si lo tienes)
curl http://ollama:11434/api/tags
```

### Test 2: Desde Easypanel Console (n8n)

1. Ir a Easypanel → n8n → "Console"
2. Ejecutar:

```bash
# Probar conexión al bot
curl http://smart-sales-bot:3000/api/health

# Probar conexión a PostgreSQL
psql postgresql://user:pass@postgres:5432/smartsales -c "SELECT 1"
```

### Test 3: Flujo Completo

1. Conectar WhatsApp (escanear QR)
2. Enviar mensaje: "Hola, busco un portátil"
3. Ver en n8n:
   - `https://n8n.tudominio.com/workflows`
   - Tab "Executions"
   - Ver cada paso del workflow
4. Recibir respuesta en WhatsApp

## 📊 Monitoreo

### Ver Logs en Easypanel

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

O mejor, usar la UI:
```
https://n8n.tudominio.com/workflows → Executions
```

### Dashboard de n8n

Ver todas las ejecuciones:
1. `https://n8n.tudominio.com/workflows`
2. Click en "WhatsApp Bot - Easypanel"
3. Tab "Executions"
4. Ver cada paso con datos reales

## 🔄 Workflow de Desarrollo

### Opción 1: Desarrollar Local, Desplegar a Easypanel

```bash
# 1. Desarrollar localmente
npm run dev

# 2. Probar cambios
# ...

# 3. Commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# 4. Easypanel hace rebuild automático
# O manualmente: Easypanel → App → "Rebuild"
```

### Opción 2: Desarrollar Directo en Easypanel

```bash
# 1. Conectar por SSH a Easypanel
ssh user@tu-servidor-easypanel

# 2. Ir al directorio de tu app
cd /path/to/smart-sales-bot

# 3. Editar archivos
nano src/lib/baileys-webhook-service.ts

# 4. Rebuild
# Easypanel → App → "Rebuild"
```

### Opción 3: Usar Git + Easypanel (Recomendado)

```bash
# 1. Crear rama de desarrollo
git checkout -b dev

# 2. Hacer cambios localmente
# ...

# 3. Push a rama dev
git push origin dev

# 4. Crear app de staging en Easypanel
# Conectar con rama "dev"

# 5. Probar en staging
# https://bot-staging.tudominio.com

# 6. Si funciona, merge a main
git checkout main
git merge dev
git push origin main

# 7. Easypanel producción se actualiza automáticamente
```

## 🔐 Seguridad

### API Key Segura

Generar API key fuerte:

```bash
# En tu terminal local
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Resultado ejemplo:
# abc123def456ghi789jkl012mno345pqr678
```

Usar esta key en:
- ✅ Smart Sales Bot: `N8N_API_KEY`
- ✅ n8n: `N8N_API_KEY`

### Validación en API

El código ya tiene validación:

```typescript
// src/app/api/whatsapp/send-from-n8n/route.ts
export async function POST(req: NextRequest) {
  // Validar API key
  const apiKey = req.headers.get('x-api-key')
  if (apiKey !== process.env.N8N_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ...
}
```

## 🚨 Troubleshooting

### Error: "Connection refused" entre servicios

**Causa:** Nombres de servicios incorrectos

**Solución:**
1. Verificar nombres en Easypanel → "Apps"
2. Usar exactamente esos nombres en URLs internas
3. Ejemplo: Si tu app se llama `my-bot`, usar `http://my-bot:3000`

### Error: "Unauthorized" en n8n

**Causa:** API key diferente

**Solución:**
1. Verificar que `N8N_API_KEY` sea igual en ambas apps
2. Regenerar si es necesario
3. Rebuild ambas apps

### Error: "PostgreSQL connection failed"

**Causa:** Credenciales incorrectas

**Solución:**
1. Verificar credenciales en Easypanel → PostgreSQL
2. Actualizar en ambas apps
3. Probar conexión desde console

### Error: "Workflow not active"

**Causa:** Workflow no activado en n8n

**Solución:**
1. Ir a n8n → Workflows
2. Verificar que esté "Active" (verde)
3. Si no, activarlo

## ✅ Checklist Final

- [ ] Variables configuradas en Smart Sales Bot
- [ ] Variables configuradas en n8n
- [ ] API key generada y configurada en ambos
- [ ] Workflow importado en n8n
- [ ] PostgreSQL conectado en n8n
- [ ] Workflow activado (verde)
- [ ] Test de conexión Bot → n8n exitoso
- [ ] Test de conexión n8n → Bot exitoso
- [ ] Test de PostgreSQL exitoso
- [ ] Mensaje real por WhatsApp funciona
- [ ] Ejecuciones visibles en n8n

## 🎉 Resultado Final

Ahora tienes:

```
✅ Todo en Easypanel (red privada)
✅ Comunicación interna súper rápida
✅ No depende de tu PC
✅ Siempre disponible 24/7
✅ Fácil de monitorear
✅ Fácil de escalar
✅ Arquitectura profesional
```

## 📚 Próximos Pasos

1. **Personalizar respuestas**: Editar prompt en workflow de n8n
2. **Agregar workflows**: Seguimiento, pagos, análisis
3. **Optimizar**: Ajustar timeouts, agregar reintentos
4. **Monitorear**: Revisar ejecuciones regularmente
5. **Escalar**: Agregar más instancias si es necesario

## 💡 Tips Pro

### Tip 1: Usar Variables de Entorno Compartidas

En Easypanel, puedes crear "Environment Groups" para compartir variables entre apps.

### Tip 2: Backups Automáticos

Configurar backups automáticos de PostgreSQL en Easypanel.

### Tip 3: Monitoreo

Usar Easypanel Metrics para ver uso de recursos.

### Tip 4: Logs Centralizados

Configurar log aggregation para ver todos los logs en un solo lugar.

**¡Listo! Ahora tienes todo configurado profesionalmente en Easypanel!** 🚀
