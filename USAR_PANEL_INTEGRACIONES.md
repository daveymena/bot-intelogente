# 🎯 Cómo Usar el Panel de Integraciones de Pago

## 📍 Acceso Rápido

1. **Iniciar sesión en el Dashboard**
   ```
   http://localhost:3000
   ```

2. **Ir a la sección de Integraciones**
   - Buscar el panel "Integraciones de Pago"
   - O navegar desde el menú principal

## 🚀 Guía Paso a Paso

### Paso 1: Configurar un Método de Pago

#### Ejemplo: Configurar MercadoPago

1. **Seleccionar el Tab "MercadoPago"**
   - Click en la pestaña correspondiente

2. **Habilitar el Método**
   - Activar el switch en la parte superior
   - El formulario se desplegará automáticamente

3. **Completar los Datos**
   ```
   Access Token: APP_USR-1234567890-test-token
   Public Key: APP_USR-public-key-test
   Email: pagos@tuempresa.com
   ```

4. **Mostrar/Ocultar Valores Sensibles**
   - Click en el ícono 👁️ para ver el valor completo
   - Click en 🙈 para ocultarlo nuevamente

5. **Guardar**
   - Click en "Guardar Todo" (botón azul superior derecho)
   - Esperar el toast de confirmación ✅

### Paso 2: Configurar Métodos Locales

#### Ejemplo: Nequi

1. **Tab "Nequi"**
2. **Activar Switch**
3. **Completar:**
   ```
   Número de Celular: 3001234567
   Nombre del Titular: Tu Nombre o Empresa
   ```
4. **Guardar**

#### Ejemplo: Transferencia Bancaria

1. **Tab "Banco"**
2. **Activar Switch**
3. **Completar:**
   ```
   Banco: Bancolombia
   Número de Cuenta: 12345678901 (se ofuscará como ****8901)
   Tipo de Cuenta: Ahorros
   Titular: Tu Nombre
   Cédula/NIT: 1234567890 (se ofuscará como ****7890)
   ```
4. **Guardar**

### Paso 3: Configuración Avanzada ⚙️

1. **Abrir Modal de Configuración**
   - Click en botón "Configuración" (superior derecho)

2. **Ajustar Parámetros**

   **Reintentos Automáticos:**
   - ✅ Activar switch
   - Seleccionar número de intentos: 3 (recomendado)
   - Útil cuando un pago falla temporalmente

   **Timeout de Conexión:**
   - Configurar: 30 segundos (recomendado)
   - Rango: 10-120 segundos
   - Previene bloqueos por pasarelas lentas

   **Webhook URL:**
   ```
   https://tudominio.com/webhook/payments
   ```
   - Recibe notificaciones automáticas de pagos
   - Opcional pero recomendado

   **Email de Notificaciones:**
   ```
   admin@tuempresa.com
   ```
   - Recibe alertas de pagos importantes
   - Notificaciones de errores

   **Modo de Prueba:**
   - ⚠️ Activar solo para desarrollo
   - Simula transacciones sin procesar pagos reales
   - Desactivar en producción

   **Registro de Transacciones:**
   - ✅ Mantener activo
   - Guarda logs detallados
   - Útil para auditoría

3. **Probar Conexiones** (Opcional)
   - Click en "Probar Todas las Conexiones"
   - Esperar resultado (2-3 segundos)
   - Ver qué integraciones funcionan correctamente

4. **Guardar Configuración**
   - Click en "Guardar Configuración"
   - O "Cancelar" para descartar cambios

## 🎨 Características Visuales

### Indicadores de Estado

- **✅ Verde**: Método habilitado y funcionando
- **⚪ Gris**: Método deshabilitado
- **⚠️ Amarillo**: Modo de prueba activo
- **❌ Rojo**: Error en configuración

### Seguridad Visual

- **🔒 Candado**: Campo sensible
- **👁️ Ojo**: Mostrar valor
- **🙈 Ojo tachado**: Ocultar valor
- **\*\*\*\*1234**: Valor ofuscado

### Feedback

- **Toast Verde**: Operación exitosa
- **Toast Rojo**: Error
- **Spinner**: Operación en progreso
- **Check**: Confirmación

## 📋 Checklist de Configuración

### Para Producción

- [ ] Configurar al menos un método de pago principal
- [ ] Verificar que los datos sean correctos
- [ ] Probar conexiones antes de activar
- [ ] Configurar email de notificaciones
- [ ] Desactivar modo de prueba
- [ ] Activar registro de transacciones
- [ ] Configurar webhook URL (si aplica)
- [ ] Guardar toda la configuración

### Para Desarrollo

- [ ] Activar modo de prueba
- [ ] Usar credenciales de sandbox
- [ ] Configurar reintentos automáticos
- [ ] Activar logs detallados
- [ ] Probar cada método individualmente

## 🔧 Solución de Problemas

### No se guardan los cambios

1. Verificar que todos los campos requeridos estén completos
2. Revisar la consola del navegador (F12)
3. Verificar conexión a internet
4. Intentar refrescar la página

### Datos sensibles no se ocultan

1. Guardar primero la configuración
2. Refrescar la página
3. Los datos se ofuscarán automáticamente

### Prueba de conexiones falla

1. Verificar que las credenciales sean correctas
2. Revisar que el método esté habilitado
3. Comprobar conexión a internet
4. Verificar que las APIs estén activas

### Modal no se abre

1. Refrescar la página
2. Limpiar caché del navegador
3. Verificar que no haya errores en consola

## 💡 Consejos y Mejores Prácticas

### Seguridad

1. **Nunca compartas tus API Keys**
   - Son como contraseñas
   - Cada usuario debe tener las suyas

2. **Usa modo de prueba primero**
   - Verifica que todo funcione
   - Luego cambia a producción

3. **Revisa los logs regularmente**
   - Detecta problemas temprano
   - Identifica patrones de error

### Configuración

1. **Habilita solo los métodos que uses**
   - Menos confusión para clientes
   - Más fácil de mantener

2. **Configura reintentos automáticos**
   - Mejora tasa de éxito
   - Reduce pagos fallidos

3. **Usa webhooks si es posible**
   - Notificaciones en tiempo real
   - Automatización de procesos

### Mantenimiento

1. **Prueba conexiones semanalmente**
   - Asegura que todo funcione
   - Detecta problemas antes que clientes

2. **Actualiza credenciales cuando expiren**
   - Algunos tokens tienen vencimiento
   - Renueva antes de que caduquen

3. **Revisa emails de notificación**
   - Mantente informado
   - Responde rápido a problemas

## 🎯 Casos de Uso Comunes

### Caso 1: Tienda Online Básica

**Configuración Recomendada:**
- ✅ MercadoPago (principal)
- ✅ Nequi (alternativo)
- ✅ Transferencia Bancaria (respaldo)
- Reintentos: 3
- Timeout: 30s
- Modo prueba: OFF

### Caso 2: Productos Digitales

**Configuración Recomendada:**
- ✅ Hotmart (principal)
- ✅ PayPal (internacional)
- ✅ MercadoPago (local)
- Reintentos: 5
- Timeout: 45s
- Webhook: Activo

### Caso 3: Servicios Locales

**Configuración Recomendada:**
- ✅ Nequi (principal)
- ✅ Daviplata (alternativo)
- ✅ Transferencia Bancaria (respaldo)
- Reintentos: 2
- Timeout: 20s
- Notificaciones: Activas

## 📞 Soporte

Si tienes problemas:

1. **Revisa esta guía primero**
2. **Consulta los logs del sistema**
3. **Prueba en modo de prueba**
4. **Contacta soporte técnico**

## ✅ Resumen

El Panel de Integraciones de Pago te permite:

- ✅ Configurar múltiples métodos de pago
- ✅ Gestionar credenciales de forma segura
- ✅ Ajustar parámetros avanzados
- ✅ Probar conexiones fácilmente
- ✅ Recibir notificaciones automáticas
- ✅ Mantener logs detallados

**Todo en una interfaz bonita, intuitiva y profesional** 🎨✨

---

**¿Listo para empezar?** 🚀

1. Abre el dashboard
2. Ve a Integraciones de Pago
3. Configura tu primer método
4. ¡Empieza a recibir pagos!
