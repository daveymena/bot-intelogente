# ⚡ COMANDOS RÁPIDOS - BOT LOCAL PERFECTO

## 🚀 IMPLEMENTACIÓN

### Crear el Bot Local
```bash
# Crear el archivo del bot local
code src/lib/enhanced-local-bot.ts

# Copiar el código de la Parte 4
# GUIA_IMPLEMENTACION_BOT_LOCAL_PERFECTO_PARTE4.md
```

### Integrar en el Sistema
```bash
# Editar el servicio de IA
code src/lib/ai-service.ts

# Seguir instrucciones de la Parte 5
# GUIA_IMPLEMENTACION_BOT_LOCAL_PERFECTO_PARTE5_FINAL.md
```

---

## 🧪 TESTING

### Pruebas Completas
```bash
# Ejecutar todas las pruebas
npx tsx scripts/test-enhanced-local-bot.ts

# Pruebas específicas de patrones
npx tsx scripts/test-patron-saludos.ts
npx tsx scripts/test-patron-pagos.ts
npx tsx scripts/test-patron-envio.ts
```

### Pruebas Interactivas
```bash
# Modo interactivo para probar mensajes
npx tsx scripts/test-bot-interactivo.ts

# Probar con mensajes reales
npx tsx scripts/test-mensajes-reales.ts
```

---

## 📊 MÉTRICAS Y MONITOREO

### Ver Métricas en Tiempo Real
```bash
# Dashboard de métricas
npx tsx scripts/ver-metricas-bot.ts

# Métricas detalladas
npx tsx scripts/ver-metricas-detalladas.ts

# Exportar métricas a JSON
npx tsx scripts/exportar-metricas.ts
```

### Análisis de Rendimiento
```bash
# Comparar antes vs después
npx tsx scripts/comparar-rendimiento.ts

# Ver distribución local vs IA
npx tsx scripts/ver-distribucion.ts

# Análisis de costos
npx tsx scripts/analizar-costos.ts
```

---

## 🔧 MANTENIMIENTO

### Agregar Nuevos Patrones
```bash
# Editar el bot local
code src/lib/enhanced-local-bot.ts

# Agregar en la sección correspondiente:
# - detectGreetings()
# - detectPaymentQuestions()
# - detectShippingQuestions()
# etc.
```

### Actualizar Respuestas
```bash
# Editar respuestas locales
code src/lib/enhanced-local-bot.ts

# Buscar la función generateResponse()
# Modificar las respuestas según necesidad
```

### Optimizar Patrones
```bash
# Ver patrones más usados
npx tsx scripts/ver-patrones-populares.ts

# Ver patrones no detectados
npx tsx scripts/ver-patrones-fallidos.ts

# Sugerir nuevos patrones
npx tsx scripts/sugerir-patrones.ts
```

---

## 🐛 DIAGNÓSTICO

### Verificar Sistema
```bash
# Diagnóstico completo
npx tsx scripts/diagnosticar-bot-local.ts

# Verificar integración
npx tsx scripts/verificar-integracion.ts

# Verificar patrones
npx tsx scripts/verificar-patrones.ts
```

### Solucionar Problemas
```bash
# Ver logs del bot
npx tsx scripts/ver-logs-bot.ts

# Ver mensajes no detectados
npx tsx scripts/ver-mensajes-no-detectados.ts

# Analizar fallos
npx tsx scripts/analizar-fallos.ts
```

---

## 📈 OPTIMIZACIÓN

### Mejorar Detección
```bash
# Analizar mensajes reales
npx tsx scripts/analizar-mensajes-reales.ts

# Generar patrones automáticamente
npx tsx scripts/generar-patrones-auto.ts

# Optimizar expresiones regulares
npx tsx scripts/optimizar-regex.ts
```

### Mejorar Respuestas
```bash
# Analizar satisfacción
npx tsx scripts/analizar-satisfaccion.ts

# Sugerir mejoras
npx tsx scripts/sugerir-mejoras-respuestas.ts

# A/B testing de respuestas
npx tsx scripts/ab-test-respuestas.ts
```

---

## 🔄 ACTUALIZACIÓN

### Actualizar el Bot
```bash
# Backup del código actual
cp src/lib/enhanced-local-bot.ts src/lib/enhanced-local-bot.backup.ts

# Actualizar con nueva versión
code src/lib/enhanced-local-bot.ts

# Probar cambios
npx tsx scripts/test-enhanced-local-bot.ts
```

### Rollback
```bash
# Restaurar versión anterior
cp src/lib/enhanced-local-bot.backup.ts src/lib/enhanced-local-bot.ts

# Verificar que funciona
npx tsx scripts/verificar-sistema-completo.ts
```

---

## 📊 REPORTES

### Generar Reportes
```bash
# Reporte diario
npx tsx scripts/reporte-diario.ts

# Reporte semanal
npx tsx scripts/reporte-semanal.ts

# Reporte mensual
npx tsx scripts/reporte-mensual.ts
```

### Exportar Datos
```bash
# Exportar métricas a CSV
npx tsx scripts/exportar-metricas-csv.ts

# Exportar a JSON
npx tsx scripts/exportar-metricas-json.ts

# Exportar a Excel
npx tsx scripts/exportar-metricas-excel.ts
```

---

## 🎯 COMANDOS ÚTILES

### Desarrollo
```bash
# Iniciar servidor en desarrollo
npm run dev

# Ver logs en tiempo real
npm run dev | grep "LOCAL_BOT"

# Reiniciar servidor
Ctrl+C && npm run dev
```

### Producción
```bash
# Build del proyecto
npm run build

# Iniciar en producción
npm start

# Ver logs de producción
pm2 logs
```

---

## 📝 SCRIPTS PERSONALIZADOS

### Crear Script de Prueba
```typescript
// scripts/mi-prueba-personalizada.ts
import { EnhancedLocalBot } from '../src/lib/enhanced-local-bot';

async function test() {
  const bot = new EnhancedLocalBot();
  
  const mensaje = "¿Cuáles son los métodos de pago?";
  const respuesta = await bot.processMessage(mensaje);
  
  console.log('Mensaje:', mensaje);
  console.log('Respuesta:', respuesta);
  console.log('Fue local:', respuesta.wasLocal);
}

test();
```

### Ejecutar Script Personalizado
```bash
npx tsx scripts/mi-prueba-personalizada.ts
```

---

## 🔍 BÚSQUEDA Y FILTRADO

### Buscar en Logs
```bash
# Buscar mensajes locales
grep "LOCAL_RESPONSE" logs/bot.log

# Buscar mensajes con IA
grep "GROQ_RESPONSE" logs/bot.log

# Buscar errores
grep "ERROR" logs/bot.log
```

### Filtrar Métricas
```bash
# Ver solo respuestas locales
npx tsx scripts/ver-metricas.ts --solo-local

# Ver solo respuestas con IA
npx tsx scripts/ver-metricas.ts --solo-ia

# Ver por rango de fechas
npx tsx scripts/ver-metricas.ts --desde 2024-01-01 --hasta 2024-01-31
```

---

## 🎨 PERSONALIZACIÓN

### Cambiar Tono de Respuestas
```bash
# Editar configuración
code src/lib/enhanced-local-bot.ts

# Buscar: RESPONSE_TONE
# Opciones: formal, casual, amigable, profesional
```

### Cambiar Idioma
```bash
# Editar respuestas
code src/lib/enhanced-local-bot.ts

# Traducir todas las respuestas
# (Mantener la estructura de patrones)
```

---

## 🚨 EMERGENCIA

### Sistema No Responde
```bash
# 1. Verificar que el bot está activo
npx tsx scripts/verificar-bot-activo.ts

# 2. Ver últimos logs
tail -n 100 logs/bot.log

# 3. Reiniciar servidor
npm run dev
```

### Respuestas Incorrectas
```bash
# 1. Ver qué patrón se detectó
npx tsx scripts/debug-patron.ts "mensaje problemático"

# 2. Verificar la respuesta generada
npx tsx scripts/debug-respuesta.ts "mensaje problemático"

# 3. Ajustar patrón o respuesta
code src/lib/enhanced-local-bot.ts
```

---

## 📚 DOCUMENTACIÓN

### Ver Documentación
```bash
# Índice principal
code INDICE_GUIA_BOT_LOCAL_PERFECTO.md

# Resumen ejecutivo
code RESUMEN_EJECUTIVO_BOT_LOCAL_PERFECTO.md

# Guía completa (5 partes)
code GUIA_IMPLEMENTACION_BOT_LOCAL_PERFECTO_PARTE*.md
```

### Generar Documentación
```bash
# Generar docs de patrones
npx tsx scripts/generar-docs-patrones.ts

# Generar docs de métricas
npx tsx scripts/generar-docs-metricas.ts

# Generar docs completas
npx tsx scripts/generar-docs-completas.ts
```

---

## 🎉 COMANDOS FAVORITOS

```bash
# Top 5 comandos más útiles:

# 1. Probar el bot completo
npx tsx scripts/test-enhanced-local-bot.ts

# 2. Ver métricas en tiempo real
npx tsx scripts/ver-metricas-bot.ts

# 3. Diagnosticar problemas
npx tsx scripts/diagnosticar-bot-local.ts

# 4. Ver patrones populares
npx tsx scripts/ver-patrones-populares.ts

# 5. Generar reporte
npx tsx scripts/reporte-diario.ts
```

---

**Tip:** Guarda este archivo en tus favoritos para acceso rápido 📌
