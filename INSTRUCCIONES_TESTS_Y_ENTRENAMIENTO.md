# INSTRUCCIONES - TESTS Y ENTRENAMIENTO BOT LOCAL

**Objetivo**: Ejecutar tests del bot local, verificar entrenamiento y cerrar puertos innecesarios.

---

## 🚀 INICIO RÁPIDO

### Opción 1: Ejecutar Todo Automáticamente
```bash
ejecutar-entrenamiento-y-tests.bat
```

Este script ejecutará:
1. ✓ Test ejecutivo del bot
2. ✓ Test de preguntas y respuestas
3. ✓ Test de IA simple
4. ✓ Test de búsqueda inteligente
5. ✓ Test de flujo de pago

---

## 📋 TESTS INDIVIDUALES

### Test 1: Ejecutivo
Verifica el estado general del sistema.

```bash
node test-ejecutivo-bot-local.js
```

**Qué verifica**:
- Estado del entrenamiento
- Productos en catálogo
- Servicios disponibles
- Configuración actual

**Resultado esperado**: ✓ Sistema listo para pruebas

---

### Test 2: Preguntas y Respuestas
Simula conversaciones reales con el bot.

```bash
node test-bot-local-preguntas.js
```

**Qué verifica**:
- Búsqueda de laptops
- Consulta de motos
- Cursos digitales
- Intención de compra
- Saludos

**Resultado esperado**: Bot responde correctamente a cada tipo de pregunta

---

### Test 3: IA Simple
Prueba la integración con Groq.

```bash
node test-ia-simple.js
```

**Qué verifica**:
- Conexión a Groq API
- Generación de respuestas
- Tiempo de respuesta

**Resultado esperado**: Respuestas en < 2 segundos

---

### Test 4: Búsqueda Inteligente
Verifica la búsqueda semántica de productos.

```bash
node test-busqueda-inteligente.js
```

**Qué verifica**:
- Búsqueda por nombre
- Búsqueda por categoría
- Búsqueda por presupuesto
- Recomendaciones

**Resultado esperado**: Encuentra productos correctamente

---

### Test 5: Flujo de Pago
Valida el flujo completo de compra.

```bash
node test-flujo-pago-completo.js
```

**Qué verifica**:
- Detección de intención de pago
- Métodos de pago disponibles
- Generación de links
- Confirmación de transacción

**Resultado esperado**: Flujo de pago completo funciona

---

## 🔌 GESTIÓN DE PUERTOS

### Ver Puertos Activos
```bash
verificar-puertos-activos.bat
```

Muestra:
- Todos los puertos en uso
- Procesos Node activos
- Instrucciones para cerrar puertos

---

### Cerrar Puertos Innecesarios
```bash
cerrar-puertos-innecesarios.bat
```

Opciones:
1. Ver puertos activos
2. Cerrar TODOS los procesos Node
3. Cerrar puerto específico
4. Mantener solo puerto 4000 (Bot Local)
5. Salir

---

### Cerrar Puerto Específico Manualmente

**Paso 1**: Encontrar el PID
```bash
netstat -ano | findstr :PUERTO
```

**Paso 2**: Cerrar el proceso
```bash
taskkill /PID [PID] /F
```

**Ejemplo** (cerrar puerto 3000):
```bash
netstat -ano | findstr :3000
taskkill /PID 12345 /F
```

---

## 📊 INTERPRETACIÓN DE RESULTADOS

### ✓ Test Exitoso
```
✓ Sistema listo para pruebas
✓ 68 ejemplos de entrenamiento
✓ Servicios de IA disponibles
✓ Base de datos configurada
```

### ⚠️ Advertencia
```
⚠ Entrenamiento necesita actualización
⚠ Productos sin clasificación
⚠ Reporte de entrenamiento vacío
```

### ✗ Error
```
✗ Archivo de entrenamiento NO encontrado
✗ Error al leer catálogo
✗ Conexión a IA fallida
```

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Problema: "No hay procesos Node activos"
**Solución**: Iniciar el servidor con `npm run dev`

### Problema: "Puerto ya en uso"
**Solución**: 
```bash
netstat -ano | findstr :PUERTO
taskkill /PID [PID] /F
```

### Problema: "Error de conexión a IA"
**Solución**: Verificar `GROQ_API_KEY` en `.env`

### Problema: "Productos no encontrados"
**Solución**: Clasificar productos por categoría en la BD

### Problema: "Entrenamiento vacío"
**Solución**: Actualizar `src/lib/training-data.ts`

---

## 📈 FLUJO RECOMENDADO

### Día 1: Validación Inicial
```bash
# 1. Ejecutar test ejecutivo
node test-ejecutivo-bot-local.js

# 2. Ejecutar test de preguntas
node test-bot-local-preguntas.js

# 3. Revisar resultados
# Resultado esperado: ✓ Sistema listo
```

### Día 2: Tests Específicos
```bash
# 1. Test de IA
node test-ia-simple.js

# 2. Test de búsqueda
node test-busqueda-inteligente.js

# 3. Test de pago
node test-flujo-pago-completo.js
```

### Día 3: Mejoras
```bash
# 1. Clasificar productos
# 2. Actualizar entrenamiento
# 3. Ejecutar todos los tests nuevamente
```

---

## 🎯 CHECKLIST DE VALIDACIÓN

- [ ] Test ejecutivo pasado
- [ ] Test de preguntas pasado
- [ ] Test de IA pasado
- [ ] Test de búsqueda pasado
- [ ] Test de pago pasado
- [ ] Puertos innecesarios cerrados
- [ ] Solo puerto 4000 activo (Bot Local)
- [ ] Productos clasificados
- [ ] Entrenamiento actualizado
- [ ] Sistema listo para producción

---

## 📞 SOPORTE

Si encuentras problemas:

1. **Revisar logs**: `npm run dev` muestra logs en tiempo real
2. **Ejecutar diagnóstico**: `node test-ejecutivo-bot-local.js`
3. **Verificar configuración**: Revisar `.env`
4. **Cerrar y reiniciar**: `cerrar-puertos-innecesarios.bat`

---

## 📝 NOTAS IMPORTANTES

- Los tests no modifican la base de datos
- Los tests son seguros de ejecutar múltiples veces
- Los resultados se muestran en consola
- Los logs se guardan automáticamente
- El sistema está optimizado para desarrollo

---

**Última actualización**: 15 de Noviembre de 2025  
**Estado**: ✓ Listo para pruebas
