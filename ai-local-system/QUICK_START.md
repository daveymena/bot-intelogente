# ⚡ Inicio Rápido - 5 Minutos

Pon en marcha el sistema de IA local en menos de 5 minutos.

## 🚀 Opción 1: Docker Compose (Local)

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/ai-local-system.git
cd ai-local-system

# 2. Configurar variables
cp .env.example .env
# Editar .env con tus credenciales

# 3. Iniciar servicios
docker-compose up -d

# 4. Esperar a que inicien (2-3 minutos)
docker-compose logs -f

# 5. Entrenar modelo de intenciones
docker-compose exec core-ai python scripts/train_intent.py

# 6. Cargar base de conocimiento
docker-compose exec core-ai python scripts/load_kb.py

# 7. ¡Listo! Acceder a:
# - Dashboard: http://localhost:3000
# - API: http://localhost:4000
# - Core AI: http://localhost:8000
```

## ☁️ Opción 2: EasyPanel (Producción)

```bash
# 1. Subir a Git
git init
git add .
git commit -m "Initial commit"
git push

# 2. En EasyPanel:
# - Crear proyecto
# - Conectar repositorio
# - Configurar variables de entorno
# - Deploy

# 3. Inicializar (en consola EasyPanel):
python scripts/train_intent.py
python scripts/load_kb.py

# 4. ¡Listo!
```

## 🧪 Probar el Sistema

### Test 1: Health Check

```bash
curl http://localhost:8000/health
```

Respuesta esperada:
```json
{
  "status": "healthy",
  "services": {
    "intent_classifier": true,
    "embedding_service": true,
    "knowledge_retriever": true,
    "mini_llm": true
  }
}
```

### Test 2: Query de Prueba

```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "text": "¿Cuánto cuesta el Macbook Pro?"
  }'
```

Respuesta esperada:
```json
{
  "intent": "product_price",
  "confidence": 0.95,
  "reply": "El Macbook Pro M4 16GB está en $4.500.000. Tenemos 3 unidades disponibles. ¿Te gustaría reservar uno?",
  "actions": {
    "suggest": ["reserve", "send_payment_link"]
  }
}
```

### Test 3: Conectar WhatsApp

1. Abrir Dashboard: http://localhost:3000
2. Ir a "Conexión WhatsApp"
3. Escanear código QR con WhatsApp
4. ¡Listo! El bot responderá automáticamente

### Test 4: Enviar Mensaje de Prueba

Desde tu WhatsApp, envía al número conectado:

```
Hola, ¿cuánto cuesta el iPhone 15?
```

El bot debería responder:

```
👋 ¡Hola! El iPhone 15 Pro 256GB está en $4.200.000. 
Tenemos 2 unidades disponibles. 

¿Te gustaría más información o reservar uno?
```

## 📊 Verificar Funcionamiento

### Ver Logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo Core AI
docker-compose logs -f core-ai

# Solo Gateway
docker-compose logs -f gateway-whatsapp
```

### Ver Estadísticas

```bash
curl http://localhost:8000/stats
```

### Ver Base de Datos

```bash
# Conectar a PostgreSQL
docker-compose exec postgres psql -U tecnovariedades

# Ver productos
SELECT * FROM products LIMIT 5;
```

## 🎓 Entrenar con tus Datos

### 1. Agregar Productos

Crear archivo `data/catalog/productos.json`:

```json
[
  {
    "id": "prod_custom_001",
    "text": "Laptop HP Pavilion 15 Intel i5 8GB RAM 256GB SSD. Precio: $2.100.000. Ideal para estudiantes y oficina. Stock: 7 unidades.",
    "metadata": {
      "category": "laptop",
      "brand": "HP",
      "price": 2100000
    }
  }
]
```

### 2. Importar Productos

```bash
docker-compose exec core-ai python scripts/import_catalog.py \
  --file /data/catalog/productos.json
```

### 3. Re-indexar

```bash
curl -X POST http://localhost:8000/reindex
```

## 🔧 Configuración Rápida

### Cambiar Modelo de IA

En `.env`:

```env
# Opción 1: Qwen (más rápido, 500MB)
AI_MODEL=Qwen/Qwen2.5-0.5B-Instruct

# Opción 2: Phi-2 (mejor calidad, 2.7GB)
AI_MODEL=microsoft/phi-2

# Opción 3: TinyLlama (balance, 1.1GB)
AI_MODEL=TinyLlama/TinyLlama-1.1B-Chat-v1.0
```

Reiniciar:
```bash
docker-compose restart core-ai
```

### Ajustar Temperatura

```env
# Más creativo (0.8-1.0)
TEMPERATURE=0.9

# Más conservador (0.5-0.7)
TEMPERATURE=0.6

# Muy determinístico (0.1-0.3)
TEMPERATURE=0.2
```

### Habilitar/Deshabilitar Auto-entrenamiento

```env
# Habilitar
AUTO_TRAIN_ENABLED=true
AUTO_TRAIN_INTERVAL=86400  # 24 horas

# Deshabilitar
AUTO_TRAIN_ENABLED=false
```

## 🐛 Solución Rápida de Problemas

### Problema: Core AI no inicia

```bash
# Ver logs
docker-compose logs core-ai

# Solución: Re-entrenar modelo
docker-compose exec core-ai python scripts/train_intent.py
docker-compose restart core-ai
```

### Problema: Qdrant no conecta

```bash
# Verificar
docker-compose ps qdrant

# Reiniciar
docker-compose restart qdrant

# Re-cargar KB
docker-compose exec core-ai python scripts/load_kb.py
```

### Problema: WhatsApp no conecta

```bash
# Limpiar sesiones
docker-compose exec gateway-whatsapp rm -rf /sessions/*

# Reiniciar
docker-compose restart gateway-whatsapp

# Escanear nuevo QR en dashboard
```

### Problema: Respuestas lentas

```bash
# Opción 1: Cambiar a modelo más pequeño
# En .env: AI_MODEL=Qwen/Qwen2.5-0.5B-Instruct

# Opción 2: Reducir tokens
# En .env: MAX_TOKENS=256

# Opción 3: Aumentar recursos
# En docker-compose.yml: aumentar RAM de core-ai
```

## 📚 Próximos Pasos

1. **Personalizar KB**: Agregar tus productos y FAQs
2. **Configurar Pagos**: Agregar tokens de MercadoPago/PayPal
3. **Entrenar**: Dejar que aprenda de conversaciones reales
4. **Monitorear**: Ver métricas y logs
5. **Optimizar**: Ajustar parámetros según resultados

## 🆘 Ayuda

- **Documentación completa**: `README.md`
- **Despliegue EasyPanel**: `EASYPANEL_DEPLOY.md`
- **Arquitectura**: `docs/ARCHITECTURE.md`
- **API Reference**: `docs/API.md`

## ✅ Checklist de Inicio

- [ ] Docker Compose funcionando
- [ ] Todos los servicios "Running"
- [ ] Health check exitoso
- [ ] Query de prueba funciona
- [ ] WhatsApp conectado
- [ ] Mensaje de prueba respondido
- [ ] Dashboard accesible
- [ ] Logs sin errores

## 🎉 ¡Felicitaciones!

Tu sistema de IA local está funcionando. Ahora puedes:

- Conectar tu WhatsApp de negocio
- Importar tu catálogo completo
- Dejar que el bot atienda clientes 24/7
- Ver cómo aprende y mejora automáticamente

**¿Necesitas ayuda?** Revisa la documentación completa o contacta soporte.
