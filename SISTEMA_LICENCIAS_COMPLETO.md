# 🔐 Sistema de Licencias y Seguridad

## Descripción General

Sistema completo de protección y licenciamiento para Smart Sales Bot Pro que incluye:

- ✅ Licencias con códigos de activación
- ✅ Validación de hardware (Machine ID)
- ✅ Período de prueba de 10 días
- ✅ Encriptación AES-256
- ✅ Verificación periódica automática
- ✅ Protección contra piratería
- ✅ Sistema de renovación

## Tipos de Licencias

### 1. Trial (Prueba)
- **Duración**: 10 días
- **Características**: Acceso completo
- **Limitaciones**: Una sola vez por máquina
- **Costo**: Gratis

### 2. Monthly (Mensual)
- **Duración**: 30 días
- **Características**: Acceso completo + Analytics
- **Renovación**: Automática con nuevo código
- **Costo**: Definir precio

### 3. Yearly (Anual)
- **Duración**: 365 días
- **Características**: Acceso completo + Analytics + Soporte prioritario
- **Renovación**: Anual
- **Costo**: Definir precio (descuento vs mensual)

### 4. Lifetime (Permanente)
- **Duración**: 100 años (prácticamente permanente)
- **Características**: Todo incluido + Características personalizadas
- **Renovación**: No requiere
- **Costo**: Definir precio premium

## Cómo Funciona

### Para el Cliente

1. **Inicio de Prueba**:
   ```
   - Abre la aplicación
   - Clic en "Iniciar Prueba Gratuita"
   - Sistema se activa por 10 días
   ```

2. **Activación de Licencia**:
   ```
   - Compra una licencia
   - Recibe código por email: XXXX-XXXX-XXXX-XXXX
   - Ingresa código y email en la app
   - Sistema se activa inmediatamente
   ```

3. **Renovación**:
   ```
   - Antes de expirar, compra nueva licencia
   - Ingresa nuevo código
   - Tiempo se extiende automáticamente
   ```

### Para Ti (Vendedor)

1. **Generar Licencia**:
   ```bash
   npm run generate-license
   ```

2. **Proceso Interactivo**:
   ```
   📧 Email del cliente: cliente@ejemplo.com
   📦 Tipo: 2 (monthly)
   🖥️  Vincular a máquina: n (para cualquier máquina)
   
   ✅ Licencia generada: ABCD-1234-EFGH-5678
   ```

3. **Enviar al Cliente**:
   - Email con código de licencia
   - Instrucciones de activación
   - Fecha de expiración

## Seguridad Implementada

### 1. Machine ID (Identificación de Hardware)
```typescript
// Genera un ID único basado en:
- MAC Address de red
- Hostname
- Plataforma (Windows/Linux/Mac)
- Arquitectura (x64/arm)
- Modelo de CPU
```

**Ventaja**: La licencia queda vinculada a una máquina específica, evitando que se comparta.

### 2. Encriptación AES-256
```typescript
// Todos los datos de licencia se guardan encriptados
- Clave secreta en variable de entorno
- Algoritmo AES-256-CBC
- Vector de inicialización aleatorio
```

**Ventaja**: Imposible modificar archivos de licencia manualmente.

### 3. Validación de Firma
```typescript
// Cada licencia tiene una firma HMAC-SHA256
- Basada en datos del cliente
- Clave secreta del servidor
- Imposible de falsificar
```

### 4. Verificación Periódica
```typescript
// El sistema verifica la licencia:
- Al iniciar el servidor
- Cada hora en el dashboard
- En cada request API crítico
```

### 5. Archivos Protegidos
```
.license      - Licencia activa (encriptada)
.trial        - Estado de prueba (encriptada)
.gitignore    - Excluye archivos de licencia
```

## Comandos Disponibles

### Generar Licencia (Para Ti)
```bash
npm run generate-license
```

### Verificar Licencia Actual
```bash
npm run check-license
```

### Limpiar Licencia (Testing)
```bash
npm run clear-license
```

## API Endpoints

### GET /api/license/check
Verifica el estado de la licencia actual.

**Response**:
```json
{
  "valid": true,
  "message": "Licencia válida",
  "daysRemaining": 25,
  "type": "monthly",
  "license": {
    "type": "monthly",
    "email": "cliente@ejemplo.com",
    "expiresAt": "2024-12-31T23:59:59.000Z",
    "features": ["whatsapp", "ai_responses", "analytics"]
  },
  "machineId": "abc123..."
}
```

### POST /api/license/activate
Activa una licencia con un código.

**Request**:
```json
{
  "key": "ABCD-1234-EFGH-5678",
  "email": "cliente@ejemplo.com",
  "type": "monthly"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Licencia activada exitosamente hasta 31/12/2024",
  "license": { ... }
}
```

### POST /api/license/trial
Inicia el período de prueba de 10 días.

**Response**:
```json
{
  "success": true,
  "message": "Período de prueba iniciado. Expira el 15/12/2024",
  "expiresAt": "2024-12-15T23:59:59.000Z"
}
```

### POST /api/license/generate
Genera una nueva licencia (solo admin).

**Headers**:
```
X-Admin-Key: tu_clave_secreta_admin
```

**Request**:
```json
{
  "email": "cliente@ejemplo.com",
  "type": "monthly",
  "machineId": "opcional_para_vincular"
}
```

## Configuración

### Variables de Entorno

Agrega a tu `.env`:

```bash
# Clave secreta para encriptación de licencias
LICENSE_SECRET_KEY=TuClaveSecretaSuperSegura2024

# Clave para generar licencias (solo tú debes tenerla)
ADMIN_SECRET_KEY=TuClaveAdminSuperSecreta2024
```

**IMPORTANTE**: Cambia estas claves en producción y guárdalas de forma segura.

## Integración en el Dashboard

```tsx
import { LicenseStatus } from '@/components/LicenseStatus';

export default function Dashboard() {
  return (
    <div>
      {/* Mostrar estado de licencia */}
      <LicenseStatus />
      
      {/* Resto del dashboard */}
    </div>
  );
}
```

## Flujo de Venta

### 1. Cliente Interesado
```
Cliente descarga/instala la app
↓
Inicia período de prueba (10 días)
↓
Usa todas las funcionalidades
```

### 2. Conversión a Pago
```
Día 7-8: Sistema muestra advertencia de expiración
↓
Cliente decide comprar
↓
Realiza pago (MercadoPago/PayPal/etc)
↓
Tú generas licencia con su email
↓
Envías código por email
↓
Cliente activa licencia en la app
```

### 3. Renovación
```
Día 25 de 30: Sistema avisa que expira pronto
↓
Cliente renueva suscripción
↓
Tú generas nueva licencia
↓
Cliente ingresa nuevo código
↓
Tiempo se extiende
```

## Precios Sugeridos (Colombia)

### Mensual
- **Precio**: $50.000 COP/mes
- **Beneficio**: Prueba sin compromiso
- **Target**: Pequeños negocios

### Anual
- **Precio**: $500.000 COP/año (ahorro de $100.000)
- **Beneficio**: 2 meses gratis + soporte prioritario
- **Target**: Negocios establecidos

### Lifetime
- **Precio**: $1.500.000 COP (pago único)
- **Beneficio**: Sin renovaciones + características personalizadas
- **Target**: Empresas grandes

## Protección Adicional

### 1. Ofuscación de Código
```bash
# Instalar ofuscador
npm install -g javascript-obfuscator

# Ofuscar archivos críticos antes de distribuir
javascript-obfuscator src/lib/license-service.ts --output dist/license-service.js
```

### 2. Compilación a Binario
```bash
# Instalar pkg
npm install -g pkg

# Compilar a ejecutable
pkg . --targets node18-win-x64 --output smart-sales-bot.exe
```

### 3. Verificación Online (Opcional)
Puedes agregar verificación contra tu servidor:

```typescript
// Verificar licencia contra API remota
async function verifyOnline(licenseKey: string) {
  const response = await fetch('https://tu-servidor.com/api/verify-license', {
    method: 'POST',
    body: JSON.stringify({ key: licenseKey })
  });
  return response.json();
}
```

## Manejo de Casos Especiales

### Cliente Cambia de Computadora
```
1. Cliente contacta soporte
2. Verificas su compra original
3. Generas nueva licencia con nuevo Machine ID
4. Desactivas licencia anterior (opcional)
```

### Licencia Expirada
```
1. Sistema deja de funcionar automáticamente
2. Muestra mensaje de renovación
3. Cliente renueva y obtiene nuevo código
4. Sistema se reactiva
```

### Reembolso
```
1. Cliente solicita reembolso
2. Verificas caso
3. Desactivas licencia remotamente (si implementas verificación online)
4. Procesas reembolso
```

## Testing

### Probar Sistema de Licencias

```bash
# 1. Limpiar licencias existentes
rm .license .trial

# 2. Iniciar app
npm run dev

# 3. Ir a http://localhost:3000/activate-license

# 4. Probar período de prueba
# Clic en "Iniciar Prueba Gratuita"

# 5. Generar licencia de prueba
npm run generate-license
# Email: test@test.com
# Tipo: 2 (monthly)

# 6. Activar licencia generada
# Ingresar código en la app

# 7. Verificar en dashboard
# Debe mostrar "Licencia válida"
```

## Soporte y Mantenimiento

### Logs de Licencias
```typescript
// Los logs se guardan automáticamente
console.log('Licencia activada:', licenseKey);
console.log('Cliente:', email);
console.log('Expira:', expiresAt);
```

### Base de Datos de Licencias (Opcional)
Puedes guardar todas las licencias generadas en tu base de datos:

```prisma
model License {
  id          String   @id @default(cuid())
  key         String   @unique
  email       String
  type        String
  machineId   String?
  generatedAt DateTime @default(now())
  activatedAt DateTime?
  expiresAt   DateTime
  active      Boolean  @default(true)
}
```

## Preguntas Frecuentes

### ¿Puedo usar la misma licencia en varias máquinas?
No, cada licencia está vinculada a una máquina específica (Machine ID).

### ¿Qué pasa si formateo mi computadora?
El Machine ID puede cambiar. Contacta soporte para generar nueva licencia.

### ¿Puedo transferir mi licencia a otra persona?
Sí, genera una nueva licencia con el email del nuevo usuario.

### ¿Cómo evito que hackeen el sistema?
- Usa claves secretas fuertes
- No compartas el código fuente
- Considera ofuscación/compilación
- Implementa verificación online

### ¿Puedo ofrecer descuentos?
Sí, simplemente genera licencias con duración extendida o tipo especial.

## Próximos Pasos

1. ✅ Sistema de licencias implementado
2. ⏳ Configurar pasarela de pago automática
3. ⏳ Panel de administración de licencias
4. ⏳ Sistema de verificación online
5. ⏳ Notificaciones automáticas de expiración
6. ⏳ Dashboard de ventas y métricas

## Contacto y Soporte

Para soporte técnico o consultas sobre licencias:
- Email: soporte@tecnovariedades.com
- WhatsApp: +57 XXX XXX XXXX

---

**Desarrollado por**: Tecnovariedades D&S
**Versión**: 1.0.0
**Última actualización**: Noviembre 2024
