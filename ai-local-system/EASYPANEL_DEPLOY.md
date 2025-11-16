# 🚀 Despliegue en EasyPanel

Guía completa para desplegar el Sistema de IA Local en EasyPanel.

## 📋 Requisitos Previos

- Cuenta en EasyPanel
- Repositorio Git con el código
- Mínimo 4GB RAM (8GB recomendado)
- 20GB espacio en disco

## 🔧 Paso 1: Preparar Repositorio

1. **Subir código a Git**:
```bash
git init
git add .
git commit -m "Initial commit: AI Local System"
git remote add origin https://github.com/tu-usuario/ai-local-system.git
git push -u origin main
```

2. **Verificar estructura**:
```
ai-local-system/
├── core-ai/
├── gateway-whatsapp/
├── dashboard/
├── docker-compose.yml
└── .env.example
```

## 🎯 Paso 2: Crear Proyecto en EasyPanel

### 2.1 Crear Nuevo Proyecto

1. Ir a EasyPanel Dashboard
2. Click en "New Project"
3. Nombre: `tecnovariedades-ai`
4. Descripción: `Sistema de IA Local para ventas`

### 2.2 Conectar Repositorio

1. Click en "Add Service" → "From Git"
2. Conectar tu repositorio
3. Branch: `main`
4. Build Method: `Docker Compose`

## 🗄️ Paso 3: Configurar Bases de Datos

### 3.1 PostgreSQL

1. En EasyPanel: "Add Service" → "Database" → "PostgreSQL"
2. Configuración:
   - Name: `tecnovariedades-db`
   - Version: `15`
   - Storage: `10GB`
   - Username: `tecnovariedades`
   - Password: (generar segura)

3. Copiar `DATABASE_URL` generada

### 3.2 Qdrant (Vector DB)

1. "Add Service" → "Custom Docker"
2. Configuración:
   - Name: `qdrant`
   - Image: `qdrant/qdrant:latest`
   - Port: `6333`
   - Volume: `/qdrant/storage` → `10GB`

## ⚙️ Paso 4: Variables de Entorno

En EasyPanel, ir a "Environment Variables" y agregar:

```env
# Database
DATABASE_URL=postgresql://user:pass@postgres:5432/tecnovariedades

# Qdrant
QDRANT_HOST=qdrant
QDRANT_PORT=6333

# AI Models
AI_MODEL=Qwen/Qwen2.5-0.5B-Instruct
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
INTENT_MODEL_PATH=/app/models/intent_ft.bin

# AI Config
MAX_TOKENS=512
TEMPERATURE=0.7
TOP_K_RETRIEVAL=5
CONFIDENCE_THRESHOLD=0.75

# Training
AUTO_TRAIN_ENABLED=true
AUTO_TRAIN_INTERVAL=86400
MIN_SAMPLES_FOR_TRAIN=100

# WhatsApp
WHATSAPP_SESSION_PATH=/sessions
WHATSAPP_AUTO_RECONNECT=true
WHATSAPP_MAX_RETRIES=5

# Business
BUSINESS_NAME=Tecnovariedades D&S
BUSINESS_PHONE=+573136174267

# Payment
MERCADOPAGO_ACCESS_TOKEN=tu_token_aqui
PAYPAL_CLIENT_ID=tu_client_id_aqui
PAYPAL_CLIENT_SECRET=tu_secret_aqui

# Services
CORE_AI_URL=http://core-ai:8000
NODE_ENV=production
PORT=4000
LOG_LEVEL=INFO
```

## 📦 Paso 5: Configurar Servicios

### 5.1 Core AI Service

1. Service Name: `core-ai`
2. Build Context: `./core-ai`
3. Dockerfile: `./core-ai/Dockerfile`
4. Port: `8000`
5. Resources:
   - CPU: 2 cores
   - RAM: 4GB
   - Storage: 10GB (para modelos)
6. Health Check:
   - Path: `/health`
   - Interval: 30s

### 5.2 Gateway WhatsApp

1. Service Name: `gateway-whatsapp`
2. Build Context: `./gateway-whatsapp`
3. Port: `4000`
4. Resources:
   - CPU: 1 core
   - RAM: 2GB
5. Volumes:
   - `/sessions` → Persistent (para sesiones WhatsApp)
   - `/media` → Persistent (para archivos multimedia)

### 5.3 Dashboard

1. Service Name: `dashboard`
2. Build Context: `./dashboard`
3. Port: `3000`
4. Resources:
   - CPU: 1 core
   - RAM: 2GB
5. Public URL: Habilitar

## 🔗 Paso 6: Configurar Dominios

### 6.1 Dashboard (Frontend)

1. En EasyPanel: Service `dashboard` → "Domains"
2. Agregar dominio: `dashboard.tecnovariedades.com`
3. Habilitar SSL automático

### 6.2 API Gateway

1. Service `gateway-whatsapp` → "Domains"
2. Agregar dominio: `api.tecnovariedades.com`
3. Habilitar SSL

### 6.3 Core AI (Interno)

- No necesita dominio público
- Acceso interno via `http://core-ai:8000`

## 🚀 Paso 7: Deploy

1. Click en "Deploy All Services"
2. Esperar a que todos los servicios estén "Running"
3. Verificar logs de cada servicio

### Orden de inicio:
1. ✅ PostgreSQL
2. ✅ Qdrant
3. ✅ Core AI
4. ✅ Gateway WhatsApp
5. ✅ Dashboard

## 🎓 Paso 8: Inicialización

### 8.1 Entrenar Intent Classifier

```bash
# En EasyPanel Console para core-ai:
python scripts/train_intent.py
```

### 8.2 Cargar Base de Conocimiento

```bash
python scripts/load_kb.py
```

### 8.3 Verificar Servicios

```bash
# Health checks
curl https://api.tecnovariedades.com/health
curl http://core-ai:8000/health
```

## 📊 Paso 9: Monitoreo

### 9.1 Logs

En EasyPanel:
- Ver logs en tiempo real de cada servicio
- Filtrar por nivel (INFO, WARNING, ERROR)

### 9.2 Métricas

```bash
# Stats del sistema
curl http://core-ai:8000/stats
```

### 9.3 Health Checks

EasyPanel monitorea automáticamente:
- `/health` endpoints
- Reinicio automático si falla
- Alertas por email

## 🔄 Paso 10: Actualizaciones

### Deploy Automático

1. Push a Git:
```bash
git add .
git commit -m "Update: nueva funcionalidad"
git push
```

2. EasyPanel detecta cambios y redeploy automático

### Deploy Manual

1. En EasyPanel: Service → "Redeploy"
2. Seleccionar servicios a actualizar
3. Click "Deploy"

## 🛡️ Paso 11: Seguridad

### 11.1 Firewall

- Solo exponer puertos necesarios (3000, 4000)
- Core AI solo accesible internamente

### 11.2 SSL/TLS

- Habilitar SSL automático en todos los dominios
- Forzar HTTPS

### 11.3 Secrets

- Usar EasyPanel Secrets para tokens sensibles
- No commitear `.env` con credenciales reales

### 11.4 Backups

Configurar backups automáticos:
- PostgreSQL: Diario
- Qdrant: Semanal
- Sesiones WhatsApp: Diario

## 📈 Paso 12: Escalamiento

### Escalar Verticalmente

Aumentar recursos por servicio:
- Core AI: 4GB → 8GB RAM (para modelos más grandes)
- Gateway: 2GB → 4GB RAM (más usuarios)

### Escalar Horizontalmente

Agregar réplicas:
```yaml
# En docker-compose.yml
core-ai:
  deploy:
    replicas: 2
```

## 🧪 Paso 13: Testing

### Test de Integración

```bash
# Test query completo
curl -X POST https://api.tecnovariedades.com/query \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "text": "¿Cuánto cuesta el Macbook?"
  }'
```

### Test de WhatsApp

1. Ir a Dashboard: `https://dashboard.tecnovariedades.com`
2. Sección "WhatsApp"
3. Escanear QR
4. Enviar mensaje de prueba

## 📝 Paso 14: Documentación

Crear documentación interna:
- URLs de servicios
- Credenciales (en lugar seguro)
- Procedimientos de mantenimiento
- Contactos de soporte

## ✅ Checklist Final

- [ ] PostgreSQL funcionando
- [ ] Qdrant funcionando
- [ ] Core AI respondiendo
- [ ] Gateway WhatsApp conectado
- [ ] Dashboard accesible
- [ ] SSL habilitado
- [ ] Backups configurados
- [ ] Monitoreo activo
- [ ] Intent classifier entrenado
- [ ] KB cargada
- [ ] WhatsApp conectado
- [ ] Test de query exitoso
- [ ] Documentación completa

## 🆘 Troubleshooting

### Core AI no inicia

```bash
# Ver logs
docker logs core-ai

# Verificar modelos
ls -lh /app/models/

# Re-entrenar
python scripts/train_intent.py
```

### Qdrant no conecta

```bash
# Verificar servicio
curl http://qdrant:6333/health

# Recrear colecciones
python scripts/load_kb.py
```

### WhatsApp no conecta

```bash
# Limpiar sesiones
rm -rf /sessions/*

# Reiniciar gateway
docker restart gateway-whatsapp
```

## 📞 Soporte

- Documentación: `/docs`
- Issues: GitHub Issues
- Email: soporte@tecnovariedades.com

---

## 🎉 ¡Listo!

Tu sistema de IA local está desplegado y funcionando en EasyPanel.

**Próximos pasos**:
1. Conectar WhatsApp
2. Importar catálogo completo
3. Entrenar con conversaciones reales
4. Monitorear y optimizar
