# 🚀 PLAN: Sistema Completo con Ollama Único

## Objetivo
Configurar Ollama como **único proveedor de IA** con capacidades completas de:
- ✅ Memoria conversacional
- ✅ Historial completo
- ✅ Formato CARD (imagen + info)
- ✅ Vendedor profesional (AIDA)
- ✅ Manejo de objeciones
- ✅ Razonamiento profundo
- ✅ Flexibilidad conversacional
- ✅ Redirección a ventas

## Configuración Ollama

```env
USE_OLLAMA=true
OLLAMA_BASE_URL=https://ollama-ollama.ginee6.easypanel.host
OLLAMA_MODEL=gemma2:2b
OLLAMA_MAX_TOKENS=800
```

## Archivos a Modificar

### 1. `.env` ✅
- Activar `USE_OLLAMA=true`
- Configurar URL y modelo
- Desactivar Groq

### 2. `src/conversational-module/ai/groqClient.ts`
- Modificar para usar Ollama cuando `USE_OLLAMA=true`
- Mantener fallback a Groq si falla

### 3. `src/lib/ollama-orchestrator-professional-v2.ts`
- Ya existe, verificar que esté completo
- Asegurar memoria conversacional
- Formato CARD

### 4. `src/conversational-module/ai/promptBuilder-simple.ts`
- Actualizar prompts para Ollama
- Incluir ejemplos de formato CARD
- AIDA integrado

### 5. `src/conversational-module/flows/`
- Actualizar todos los flujos para usar Ollama
- Formato consistente

## Características Requeridas

### Memoria Conversacional
```typescript
// Ya implementado en:
- conversation-context-hybrid.ts
- conversation-context-db-service.ts
```

### Formato CARD
```
🎹 Curso Piano Profesional Completo
💰 Precio: $60,000 COP

📘 Incluye:
✅ +80 clases en video HD
✅ Descargables desde Google Drive
✅ Acceso de por vida
✅ Módulos desde cero hasta nivel profesional
✅ Soporte del profesor

🔗 Comprar ahora: [link]

🧠 AIDA:
✨ Atención: Es uno de los cursos más completos
🔥 Interés: Aprendes desde cero
⭐ Deseo: Miles de alumnos ya lo usan
👉 Acción: ¿Quieres ver un video de ejemplo?
```

### Vendedor Profesional
- AIDA en cada respuesta
- Preguntas de cierre
- Manejo de objeciones
- Redirección a venta

### Flexibilidad
- Responder preguntas generales
- Redirigir sutilmente a productos
- No ser rígido
- Mantener contexto

## Próximos Pasos

1. ✅ Configurar `.env` con Ollama
2. ⏳ Actualizar `groqClient.ts` para usar Ollama
3. ⏳ Crear prompt maestro para Ollama
4. ⏳ Probar con ejemplos reales
5. ⏳ Ajustar según resultados

## Comandos

```bash
# Probar Ollama
npx tsx test-ollama-conexion.js

# Iniciar servidor
npm run dev

# Probar bot
# Enviar: "Hola"
# Enviar: "me interesa el curso de piano"
```

## Notas Importantes

- Ollama gemma2:2b es rápido pero limitado
- Necesita prompts muy claros y estructurados
- Memoria conversacional ya está implementada
- Sistema de fotos ya funciona
- Saludos dinámicos ya activos

---

**Estado**: ⏳ EN PROGRESO  
**Prioridad**: 🔴 ALTA
