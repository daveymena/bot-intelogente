# 🤖 Sistema de Auto-Recuperación Inteligente

## 📋 Descripción

Sistema inteligente que monitorea, diagnostica y repara automáticamente problemas en tu aplicación usando IA. Es como tener un ingeniero DevOps 24/7 cuidando tu sistema.

---

## ✨ Características

### 1. **Diagnóstico con IA**
- Usa Groq (Llama 3.1) para analizar errores
- Identifica la causa raíz del problema
- Sugiere soluciones específicas
- Genera acciones correctivas automáticas

### 2. **Auto-Recuperación de WhatsApp**
- Detecta desconexiones
- Limpia sesiones corruptas
- Regenera QR automáticamente
- Reinicia el servicio si es necesario

### 3. **Auto-Recuperación de Base de Datos**
- Verifica conexión
- Detecta productos sin imágenes
- Restaura catálogo si está vacío
- Repara integridad de datos

### 4. **Auto-Recuperación de Pagos**
- Valida configuración de APIs
- Prueba generación de links
- Verifica variables de entorno
- Alerta sobre configuraciones faltantes

### 5. **Auto-Recuperación de IA**
- Prueba conectividad con Groq
- Intenta fallback a OpenAI si falla
- Valida API keys
- Reinicia servicios si es necesario

### 6. **Monitoreo Continuo**
- Chequeos automáticos cada 5 minutos
- Logs detallados de todas las acciones
- Alertas en tiempo real
- Dashboard visual del estado

---

## 🚀 Uso

### Opción 1: Monitoreo Automático (Recomendado)

Inicia el monitoreo continuo que se ejecuta en segundo plano:

```bash
npx tsx scripts/iniciar-auto-recovery.ts
```

Esto iniciará:
- ✅ Recuperación inicial de todos los componentes
- ✅ Monitoreo cada 5 minutos
- ✅ Auto-reparación cuando detecta problemas
- ✅ Logs detallados de todas las acciones

### Opción 2: Recuperación Manual

Ejecuta una recuperación completa cuando lo necesites:

```bash
# Recuperación completa
npx tsx -e "import { AutoRecoveryService } from './src/lib/auto-recovery-service'; AutoRecoveryService.fullSystemRecovery()"

# Recuperar solo WhatsApp
npx tsx -e "import { AutoRecoveryService } from './src/lib/auto-recovery-service'; AutoRecoveryService.recoverWhatsApp()"

# Recuperar solo Base de Datos
npx tsx -e "import { AutoRecoveryService } from './src/lib/auto-recovery-service'; AutoRecoveryService.recoverDatabase()"
```

### Opción 3: API REST

Usa la API para integrar con otros sistemas:

```bash
# Recuperación completa
curl -X POST http://localhost:3000/api/system/auto-recovery \
  -H "Content-Type: application/json" \
  -d '{"action": "full"}'

# Recuperar componente específico
curl -X POST http://localhost:3000/api/system/auto-recovery \
  -H "Content-Type: application/json" \
  -d '{"component": "whatsapp"}'

# Ver logs de recuperación
curl http://localhost:3000/api/system/auto-recovery
```

### Opción 4: Dashboard Visual

Accede al dashboard en tu aplicación:

```
http://localhost:3000/dashboard/system-health
```

Desde ahí puedes:
- Ver estado de todos los componentes
- Ejecutar recuperaciones manuales
- Ver historial de recuperaciones
- Monitorear en tiempo real

---

## 🧪 Pruebas

Ejecuta el script de pruebas para verificar que todo funciona:

```bash
npx tsx scripts/test-auto-recovery.ts
```

Esto probará:
1. ✅ Diagnóstico con IA
2. ✅ Recuperación de WhatsApp
3. ✅ Recuperación de Base de Datos
4. ✅ Recuperación de Pagos
5. ✅ Recuperación de IA
6. ✅ Recuperación completa
7. ✅ Logs de recuperación

---

## 📊 Componentes Monitoreados

### 1. WhatsApp
**Problemas detectados:**
- Desconexión del servicio
- Sesión corrupta
- QR expirado
- Error de autenticación

**Acciones automáticas:**
- Limpiar sesión
- Regenerar QR
- Reiniciar servicio
- Notificar al admin

### 2. Base de Datos
**Problemas detectados:**
- Conexión perdida
- Productos sin imágenes
- Catálogo vacío
- Datos corruptos

**Acciones automáticas:**
- Reconectar a DB
- Restaurar imágenes
- Importar catálogo
- Reparar integridad

### 3. Sistema de Pagos
**Problemas detectados:**
- API keys faltantes
- Links no generados
- Configuración incorrecta
- Servicios caídos

**Acciones automáticas:**
- Validar configuración
- Probar generación de links
- Alertar sobre faltantes
- Usar fallbacks

### 4. Inteligencia Artificial
**Problemas detectados:**
- API key inválida
- Servicio caído
- Rate limit excedido
- Timeout de respuesta

**Acciones automáticas:**
- Validar API key
- Probar conexión
- Usar fallback (OpenAI)
- Reintentar con backoff

---

## 🔧 Configuración

### Variables de Entorno Requeridas

```env
# IA (Requerido)
GROQ_API_KEY=tu_api_key_de_groq

# Base de Datos (Requerido)
DATABASE_URL=tu_connection_string

# Opcionales (para funcionalidades completas)
MERCADOPAGO_ACCESS_TOKEN=tu_token
PAYPAL_CLIENT_ID=tu_client_id
OPENAI_API_KEY=tu_api_key_openai
CLAUDE_API_KEY=tu_api_key_claude
```

### Configuración del Monitoreo

Puedes ajustar la frecuencia del monitoreo:

```typescript
// En scripts/iniciar-auto-recovery.ts
await AutoRecoveryService.startMonitoring(5) // 5 minutos (default)

// Cambiar a 10 minutos
await AutoRecoveryService.startMonitoring(10)

// Cambiar a 1 minuto (para desarrollo)
await AutoRecoveryService.startMonitoring(1)
```

---

## 📝 Logs de Recuperación

Cada recuperación genera un log con:

```typescript
{
  timestamp: Date,        // Cuándo ocurrió
  component: string,      // Qué componente
  error: string,          // Qué error hubo
  diagnosis: string,      // Diagnóstico de IA
  action: string,         // Qué acción se tomó
  success: boolean        // Si funcionó o no
}
```

Los logs se guardan en memoria (últimos 100) y se pueden consultar:

```typescript
const logs = AutoRecoveryService.getRecoveryLogs()
```

---

## 🎯 Casos de Uso

### Caso 1: WhatsApp se desconecta en producción

**Sin auto-recuperación:**
1. Cliente intenta enviar mensaje
2. Mensaje falla
3. Admin recibe queja
4. Admin se conecta al servidor
5. Admin reinicia WhatsApp manualmente
6. 30 minutos de downtime

**Con auto-recuperación:**
1. Sistema detecta desconexión (5 min)
2. IA diagnostica el problema
3. Sistema limpia sesión y regenera QR
4. Admin recibe notificación con QR
5. Admin escanea QR desde su teléfono
6. 5 minutos de downtime

### Caso 2: Base de datos pierde imágenes

**Sin auto-recuperación:**
1. Productos se muestran sin fotos
2. Clientes se quejan
3. Admin investiga el problema
4. Admin ejecuta script manualmente
5. 2 horas de downtime

**Con auto-recuperación:**
1. Sistema detecta productos sin imágenes
2. Ejecuta script de restauración automáticamente
3. Imágenes restauradas en 2 minutos
4. 2 minutos de downtime

### Caso 3: API de IA se cae

**Sin auto-recuperación:**
1. Bot deja de responder
2. Clientes abandonan
3. Admin se entera horas después
4. Admin cambia a API alternativa
5. Varias horas de downtime

**Con auto-recuperación:**
1. Sistema detecta fallo de Groq
2. Automáticamente cambia a OpenAI
3. Bot sigue funcionando
4. 0 minutos de downtime

---

## 🚨 Alertas y Notificaciones

El sistema puede configurarse para enviar alertas:

```typescript
// Agregar en auto-recovery-service.ts
private static async sendAlert(component: string, error: string) {
  // Enviar email
  await sendEmail({
    to: 'admin@tudominio.com',
    subject: `⚠️ Auto-Recuperación: ${component}`,
    body: `Se detectó un problema en ${component}: ${error}`
  })

  // Enviar WhatsApp
  await sendWhatsApp({
    to: '+573001234567',
    message: `🚨 Sistema auto-recuperándose: ${component}`
  })

  // Enviar Slack/Discord
  await sendSlack({
    channel: '#alerts',
    message: `⚠️ Auto-recuperación activada para ${component}`
  })
}
```

---

## 📈 Métricas y Estadísticas

El sistema registra:
- Número total de recuperaciones
- Tasa de éxito por componente
- Tiempo promedio de recuperación
- Errores más comunes
- Componentes más problemáticos

Puedes exportar estas métricas:

```typescript
const stats = AutoRecoveryService.getStats()
console.log(stats)
// {
//   totalRecoveries: 45,
//   successRate: 0.89,
//   avgRecoveryTime: 120, // segundos
//   mostCommonError: 'WhatsApp disconnection',
//   mostProblematicComponent: 'WhatsApp'
// }
```

---

## 🔐 Seguridad

El sistema de auto-recuperación:
- ✅ No expone credenciales en logs
- ✅ Requiere autenticación para API
- ✅ Limita intentos de recuperación
- ✅ Registra todas las acciones
- ✅ Notifica al admin de cambios críticos

---

## 🎓 Mejores Prácticas

1. **Monitoreo Continuo**
   - Mantén el script de monitoreo corriendo 24/7
   - Usa PM2 o similar para mantenerlo vivo

2. **Logs Centralizados**
   - Envía logs a un servicio externo (Logtail, Papertrail)
   - Configura alertas para errores críticos

3. **Backups Regulares**
   - El auto-recovery no reemplaza backups
   - Mantén backups de DB y configuración

4. **Testing Regular**
   - Ejecuta pruebas semanalmente
   - Simula fallos para verificar recuperación

5. **Documentación**
   - Documenta problemas recurrentes
   - Mejora el sistema basado en logs

---

## 🚀 Integración con Easypanel

Para usar en producción con Easypanel:

1. **Agregar al Dockerfile:**
```dockerfile
# Instalar dependencias de auto-recovery
RUN npm install

# Copiar scripts
COPY scripts/ ./scripts/
COPY src/lib/auto-recovery-service.ts ./src/lib/
```

2. **Agregar al package.json:**
```json
{
  "scripts": {
    "auto-recovery": "tsx scripts/iniciar-auto-recovery.ts",
    "start:with-recovery": "concurrently \"npm start\" \"npm run auto-recovery\""
  }
}
```

3. **Configurar en Easypanel:**
   - Comando de inicio: `npm run start:with-recovery`
   - Variables de entorno: Todas las requeridas
   - Health checks: Activados

---

## ✅ Checklist de Implementación

- [ ] Instalar dependencias
- [ ] Configurar variables de entorno
- [ ] Probar recuperación manual
- [ ] Ejecutar tests
- [ ] Iniciar monitoreo automático
- [ ] Verificar logs
- [ ] Configurar alertas
- [ ] Documentar problemas comunes
- [ ] Integrar con dashboard
- [ ] Deployar a producción

---

## 📞 Soporte

Si tienes problemas con el sistema de auto-recuperación:

1. Revisa los logs: `AutoRecoveryService.getRecoveryLogs()`
2. Ejecuta las pruebas: `npx tsx scripts/test-auto-recovery.ts`
3. Verifica variables de entorno
4. Revisa la documentación de cada componente

---

**🎉 ¡Sistema de Auto-Recuperación Listo!**

Tu aplicación ahora puede auto-repararse cuando detecta problemas.
