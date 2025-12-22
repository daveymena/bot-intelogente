# 🚀 EJECUTAR AHORA - Ollama + PostgreSQL

## ⚡ Comando Rápido

```bash
test-y-migrar-completo.bat
```

Este comando hará TODO automáticamente:
1. ✅ Verificar Ollama en Easypanel
2. ✅ Aplicar schema a PostgreSQL
3. ✅ Migrar productos
4. ✅ Probar ambos modelos (llama3 y mistral)

## 📊 Qué Esperar

### Tiempo estimado: 10-15 minutos

- **Verificación Ollama**: 5 segundos
- **Schema PostgreSQL**: 10-30 segundos
- **Migración productos**: 1-2 minutos
- **Tests de modelos**: 8-12 minutos
  - llama3: 4 preguntas (~4 minutos)
  - mistral: 4 preguntas (~4 minutos)

## 🎯 Resultados

Al finalizar verás:

### 1. Migración de Datos
```
✅ Registros migrados:
   - Usuarios: X
   - Productos: X
   - Conversaciones: X
   - Mensajes: X
   - Total: X
```

### 2. Tests de Modelos
```
🤖 llama3:latest
   ✅ Pregunta 1: Laptop para diseño gráfico
   ✅ Pregunta 2: Computador económico
   ✅ Pregunta 3: Curso vs Megapack
   ✅ Pregunta 4: Moto para ciudad

🤖 mistral:latest
   ✅ Pregunta 1: Laptop para diseño gráfico
   ✅ Pregunta 2: Computador económico
   ✅ Pregunta 3: Curso vs Megapack
   ✅ Pregunta 4: Moto para ciudad
```

### 3. Métricas de Rendimiento
```
📊 llama3:
   - Tiempo promedio: X.XX segundos
   - Calidad: ⭐⭐⭐⭐⭐
   - Coherencia: Alta

📊 mistral:
   - Tiempo promedio: X.XX segundos
   - Calidad: ⭐⭐⭐⭐
   - Velocidad: Alta
```

## 🎨 Decisión Final

Después de ver los resultados, decide:

### Opción A: Usar llama3 (Recomendado)
```env
OLLAMA_MODEL=llama3:latest
```
✅ Mejor para conversaciones complejas  
✅ Más preciso y natural  
✅ Mejor comprensión del contexto  

### Opción B: Usar mistral
```env
OLLAMA_MODEL=mistral:latest
```
✅ Más rápido  
✅ Bueno para respuestas simples  
✅ Menor uso de recursos  

### Opción C: Usar ambos (Híbrido)
```env
OLLAMA_MODEL=llama3:latest
OLLAMA_MODEL_SECONDARY=mistral:latest
```
✅ Lo mejor de ambos mundos  
✅ Fallback automático  
✅ Selección inteligente  

## 🔧 Configuración Actual

Ya está configurado en tu `.env`:
```env
OLLAMA_BASE_URL=https://davey-ollama.mapf5v.easypanel.host
OLLAMA_MODEL=llama3:latest
OLLAMA_MODEL_SECONDARY=mistral:latest
DATABASE_URL=postgresql://postgres:6715320D@davey_postgres-db:5432/davey?sslmode=disable
```

## ⚠️ Si Hay Errores

### Error: No se puede conectar a PostgreSQL
```bash
# Solución: Usa la URL interna para Easypanel
DATABASE_URL=postgresql://postgres:6715320D@davey_postgres-db:5432/davey?sslmode=disable
```

### Error: Ollama no responde
```bash
# Verifica que el servicio esté activo en Easypanel
curl https://davey-ollama.mapf5v.easypanel.host/api/tags
```

### Error: No hay productos en SQLite
```bash
# Normal si es primera vez, continúa con los tests
```

## 📝 Después de Ejecutar

1. **Revisa los resultados** en la consola
2. **Compara las respuestas** de ambos modelos
3. **Decide qué modelo usar** (llama3 recomendado)
4. **Verifica los productos** en PostgreSQL:
   ```bash
   npx prisma studio
   ```
5. **Reinicia el bot** para usar la nueva configuración

## 🎯 Siguiente Paso

Una vez que decidas qué modelo usar:

```bash
# Reiniciar el bot con la nueva configuración
npm run dev
```

O en Easypanel:
- Actualiza las variables de entorno
- Rebuild la aplicación

---

**¿Listo?** Ejecuta: `test-y-migrar-completo.bat`
