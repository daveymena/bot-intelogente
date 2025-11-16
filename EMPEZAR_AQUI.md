# 🚀 EMPEZAR AQUÍ - Sistema de IA Neuronal

## 📋 ¿Qué Tienes?

Un **sistema completo de IA neuronal** que:
- ✅ Genera 1,000+ conversaciones realistas
- ✅ Entrena red neuronal local
- ✅ Maneja 8 mega-flujos de ventas
- ✅ Se integra con tu bot actual
- ✅ Aprende continuamente

## ⚡ Inicio Rápido (Elige tu Camino)

### 🟢 Camino 1: Solo Dataset (5 minutos)

**Para**: Generar conversaciones sin instalar Python

```bash
# 1. Configurar Groq API en .env
GROQ_API_KEY=gsk_tu_key_aqui

# 2. Generar dataset
scripts\generar-dataset-simple.bat
```

**Resultado**: 1,000+ conversaciones en `data/training/`

---

### 🔵 Camino 2: Sistema Completo (30 minutos)

**Para**: Sistema neuronal completo funcionando

```bash
# 1. Instalar todo automáticamente
scripts\instalar-todo-windows.bat

# 2. Iniciar Core AI
scripts\iniciar-core-ai.bat

# 3. Generar dataset (en otra ventana)
npx tsx scripts/generar-dataset-completo.ts

# 4. Entrenar red neuronal
npx tsx scripts/entrenar-red-neuronal-completa.ts
```

**Resultado**: Sistema neuronal completo funcionando

---

### 🟣 Camino 3: Menú Interactivo (Recomendado)

**Para**: Guía paso a paso con menú

```bash
# Ejecutar menú interactivo
scripts\iniciar-sistema-completo.bat
```

**Opciones del menú**:
1. Instalar todo
2. Iniciar Core AI
3. Generar dataset
4. Entrenar red neuronal
5. Probar sistema
6. Ver documentación

---

## 📚 Documentación por Nivel

### 🟢 Nivel Básico (Solo Dataset)

1. **GUIA_RAPIDA_SIN_DOCKER.md**
   - Generar dataset sin Docker
   - Usar con Groq/Ollama
   - Integrar con tu bot actual

### 🔵 Nivel Intermedio (Sistema Completo)

2. **INSTALACION_COMPLETA_WINDOWS.md**
   - Instalar Python 3.11
   - Instalar dependencias
   - Configurar todo

3. **ENTRENAMIENTO_COMPLETO_README.md**
   - Generar dataset masivo
   - Entrenar red neuronal
   - Validar sistema

### 🟣 Nivel Avanzado (Integración)

4. **INTEGRACION_CORE_AI.md**
   - Integrar con Baileys
   - Usar Hybrid AI Service
   - Sincronizar datos

5. **RESUMEN_FINAL_SISTEMA_NEURONAL.md**
   - Arquitectura completa
   - Métricas y monitoreo
   - Optimización

---

## 🎯 Requisitos Mínimos

### Para Solo Dataset (Camino 1):
- ✅ Node.js (ya lo tienes)
- ✅ Groq API key (gratis)
- ⏱️ 5 minutos

### Para Sistema Completo (Camino 2 y 3):
- ✅ Node.js (ya lo tienes)
- ✅ Python 3.11
- ✅ 4GB RAM
- ✅ 10GB disco
- ✅ Groq API key (gratis)
- ⏱️ 30 minutos

---

## 🔧 Instalación Paso a Paso

### Opción A: Automática (Recomendado)

```bash
# Un solo comando instala todo
scripts\instalar-todo-windows.bat
```

### Opción B: Manual

#### 1. Instalar Python 3.11

```bash
# Descargar de: https://www.python.org/downloads/
# IMPORTANTE: Marcar "Add Python to PATH"
# Usar Python 3.11.x (no 3.12)
```

#### 2. Crear Entorno Virtual

```bash
cd ai-local-system\core-ai
python -m venv venv
venv\Scripts\activate
```

#### 3. Instalar Dependencias

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### 4. Entrenar Modelo Inicial

```bash
python scripts/train_intent.py
python scripts/load_kb.py
```

#### 5. Iniciar Servidor

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## 🧪 Probar que Funciona

### Test 1: Health Check

```bash
curl http://localhost:8000/health
```

**Respuesta esperada**:
```json
{
  "status": "healthy",
  "services": {
    "intent_classifier": true,
    "embedding_service": true,
    ...
  }
}
```

### Test 2: Query de Prueba

```bash
curl -X POST http://localhost:8000/query ^
  -H "Content-Type: application/json" ^
  -d "{\"user_id\":\"test\",\"text\":\"Hola\"}"
```

**Respuesta esperada**:
```json
{
  "intent": "greeting",
  "confidence": 0.95,
  "reply": "¡Hola! Bienvenido a Tecnovariedades D&S...",
  "actions": {}
}
```

---

## 📊 Los 8 Mega-Flujos

El sistema genera conversaciones para:

1. **Tecnología/Contraentrega** (50 variaciones)
   - Cliente preguntón, desconfiado
   - Objeciones: estafa, garantía, precio

2. **Dropshipping** (40 variaciones)
   - Tiempos, seguimiento, garantías

3. **Servicios/Citas** (30 variaciones)
   - Agendamiento, cambios, cancelaciones

4. **Soporte Técnico** (35 variaciones)
   - Diagnóstico, reparación, cotización

5. **Productos Digitales** (45 variaciones)
   - Megapacks, cursos, entrega inmediata

6. **Fiados/Crédito** (25 variaciones)
   - Validación, plazos, pagos

7. **Cliente Agresivo** (30 variaciones)
   - Objeciones fuertes, desconfianza

8. **Cliente Indeciso** (40 variaciones)
   - Comparaciones, dudas constantes

**Total: ~295 conversaciones × variaciones = 1,000+**

---

## 🎓 Flujo de Trabajo Recomendado

### Día 1: Setup (30 min)
```bash
1. scripts\instalar-todo-windows.bat
2. scripts\iniciar-core-ai.bat
3. Verificar que funciona
```

### Día 2: Dataset (1 hora)
```bash
1. Configurar GROQ_API_KEY
2. npx tsx scripts/generar-dataset-completo.ts
3. Revisar data/training/
```

### Día 3: Entrenamiento (30 min)
```bash
1. npx tsx scripts/entrenar-red-neuronal-completa.ts
2. Verificar accuracy
3. Probar queries
```

### Día 4: Integración (1 hora)
```bash
1. Integrar hybrid-ai-service.ts
2. Conectar con Baileys
3. Probar con mensajes reales
```

### Día 5+: Optimización
```bash
1. Monitorear métricas
2. Ajustar confidence threshold
3. Re-entrenar con datos reales
```

---

## 🐛 Problemas Comunes

### Python no se encuentra

```bash
# Solución: Reinstalar Python marcando "Add to PATH"
# O agregar manualmente a PATH
```

### Error al instalar dependencias

```bash
# Solución: Instalar Visual C++ Build Tools
# https://visualstudio.microsoft.com/visual-cpp-build-tools/
```

### Core AI no inicia

```bash
# Verificar que el entorno virtual está activo
cd ai-local-system\core-ai
venv\Scripts\activate

# Verificar dependencias
pip list
```

### Groq API no responde

```bash
# Verificar API key
echo %GROQ_API_KEY%

# Probar manualmente
curl https://api.groq.com/openai/v1/models ^
  -H "Authorization: Bearer %GROQ_API_KEY%"
```

---

## 💡 Consejos

### Para Desarrollo
- Usa **Camino 1** (solo dataset) para empezar rápido
- Prueba con pocas variaciones primero
- Revisa las conversaciones generadas

### Para Producción
- Usa **Camino 2** (sistema completo)
- Genera dataset completo (1,000+ conversaciones)
- Entrena con datos reales de tu bot
- Monitorea métricas continuamente

### Para Optimización
- Ajusta temperatura de generación (0.7-1.0)
- Aumenta variaciones por flujo
- Agrega más objeciones específicas
- Re-entrena semanalmente

---

## 📞 Comandos Rápidos

```bash
# Instalar todo
scripts\instalar-todo-windows.bat

# Iniciar Core AI
scripts\iniciar-core-ai.bat

# Generar dataset
scripts\generar-dataset-simple.bat

# Menú interactivo
scripts\iniciar-sistema-completo.bat

# Probar sistema
curl http://localhost:8000/health
```

---

## 🎉 Próximos Pasos

Después de instalar y probar:

1. ✅ **Generar dataset** con tus productos reales
2. ✅ **Entrenar red neuronal** con el dataset
3. ✅ **Integrar con Baileys** usando hybrid-ai-service
4. ✅ **Probar con usuarios reales**
5. ✅ **Monitorear y optimizar**

---

## 📚 Documentación Completa

- `INSTALACION_COMPLETA_WINDOWS.md` - Instalación detallada
- `GUIA_RAPIDA_SIN_DOCKER.md` - Uso sin Docker
- `ENTRENAMIENTO_COMPLETO_README.md` - Entrenamiento
- `INTEGRACION_CORE_AI.md` - Integración
- `RESUMEN_FINAL_SISTEMA_NEURONAL.md` - Resumen completo

---

## ✅ Checklist

- [ ] Python 3.11 instalado
- [ ] Dependencias instaladas
- [ ] Modelo inicial entrenado
- [ ] Core AI funcionando
- [ ] Groq API configurada
- [ ] Dataset generado
- [ ] Red neuronal entrenada
- [ ] Sistema probado
- [ ] Integrado con bot

---

**¿Listo para empezar?**

```bash
# Ejecuta esto ahora:
scripts\iniciar-sistema-completo.bat
```

**¡Y tendrás IA neuronal funcionando en 30 minutos!** 🧠🚀
