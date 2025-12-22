# 🔐 Sistema de Licencias - Smart Sales Bot Pro

## Inicio Rápido

### 1. Configuración Inicial

```bash
# 1. Copiar archivo de ejemplo
cp .env.license.example .env.local

# 2. Editar .env.local y cambiar las claves secretas
# LICENSE_SECRET_KEY=tu_clave_secreta_aqui
# ADMIN_SECRET_KEY=tu_clave_admin_aqui

# 3. Generar claves seguras (opcional)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Primer Uso

```bash
# Iniciar la aplicación
npm run dev

# Visitar http://localhost:3000/activate-license

# Opción A: Iniciar período de prueba (10 días gratis)
# Opción B: Activar con código de licencia
```

### 3. Generar Licencias (Para Vender)

```bash
# Ejecutar generador interactivo
npm run license:generate

# Seguir las instrucciones:
# - Email del cliente
# - Tipo de licencia (trial/monthly/yearly/lifetime)
# - Vincular a máquina específica (opcional)

# Resultado: Código como ABCD-1234-EFGH-5678
```

## Características Principales

### ✅ Seguridad Multicapa

1. **Machine ID**: Vincula licencia a hardware específico
2. **Encriptación AES-256**: Protege datos de licencia
3. **Firma HMAC-SHA256**: Previene falsificación
4. **Verificación periódica**: Valida cada hora

### ✅ Tipos de Licencia

| Tipo | Duración | Características | Precio Sugerido |
|------|----------|----------------|-----------------|
| Trial | 10 días | Acceso completo | Gratis |
| Monthly | 30 días | Todo + Analytics | $50.000 COP |
| Yearly | 365 días | Todo + Soporte | $500.000 COP |
| Lifetime | Permanente | Todo + Custom | $1.500.000 COP |

### ✅ Protección Anti-Piratería

- ❌ No se puede copiar a otra máquina
- ❌ No se puede modificar archivos de licencia
- ❌ No se puede usar trial múltiples veces
- ❌ No se puede falsificar códigos

## Comandos Disponibles

```bash
# Generar nueva licencia
npm run license:generate

# Verificar licencia actual
npm run license:check

# Limpiar licencias (solo para testing)
npm run license:clear

# Iniciar aplicación
npm run dev
```

## Flujo de Venta

### Para el Cliente

```
1. Descarga/Instala la app
   ↓
2. Inicia período de prueba (10 días)
   ↓
3. Usa todas las funcionalidades
   ↓
4. Decide comprar antes de expirar
   ↓
5. Realiza pago
   ↓
6. Recibe código por email
   ↓
7. Activa licencia en la app
   ↓
8. Sistema activado ✅
```

### Para Ti (Vendedor)

```
1. Cliente solicita compra
   ↓
2. Procesas pago (MercadoPago/PayPal/etc)
   ↓
3. Ejecutas: npm run license:generate
   ↓
4. Ingresas email del cliente
   ↓
5. Seleccionas tipo de licencia
   ↓
6. Sistema genera código
   ↓
7. Envías código por email
   ↓
8. Cliente activa y listo ✅
```

## Integración en tu Código

### Proteger una Ruta API

```typescript
import LicenseGuard from '@/lib/license-guard';

export async function POST(request: NextRequest) {
  // Verificar licencia
  if (!await LicenseGuard.isValid()) {
    return NextResponse.json(
      { error: 'Licencia inválida' },
      { status: 403 }
    );
  }
  
  // Tu código aquí...
}
```

### Mostrar Estado en Dashboard

```tsx
import { LicenseStatus } from '@/components/LicenseStatus';

export default function Dashboard() {
  return (
    <div>
      <LicenseStatus />
      {/* Resto del dashboard */}
    </div>
  );
}
```

### Verificar Características

```typescript
import LicenseGuard from '@/lib/license-guard';

// Verificar si tiene acceso a analytics
const hasAnalytics = await LicenseGuard.hasAccess('analytics');

if (hasAnalytics) {
  // Mostrar analytics
}
```

## Archivos Importantes

```
src/lib/license-service.ts          - Servicio principal
src/lib/license-guard.ts            - Protección de rutas
src/middleware/license-middleware.ts - Middleware global
src/app/activate-license/page.tsx   - Página de activación
src/components/LicenseStatus.tsx    - Componente de estado
scripts/generate-license.ts         - Generador de licencias
.license                            - Licencia activa (encriptada)
.trial                              - Estado de trial (encriptado)
```

## API Endpoints

### GET /api/license/check
Verifica estado de licencia actual

### POST /api/license/activate
Activa una licencia con código

**Body**:
```json
{
  "key": "XXXX-XXXX-XXXX-XXXX",
  "email": "cliente@ejemplo.com"
}
```

### POST /api/license/trial
Inicia período de prueba de 10 días

### POST /api/license/generate
Genera nueva licencia (solo admin)

**Headers**:
```
X-Admin-Key: tu_clave_admin
```

## Preguntas Frecuentes

### ¿Cómo genero mi primera licencia?

```bash
npm run license:generate
```

### ¿Puedo usar la misma licencia en varias máquinas?

No, cada licencia está vinculada a una máquina específica (Machine ID).

### ¿Qué pasa si formateo mi computadora?

El Machine ID puede cambiar. Genera una nueva licencia para el cliente.

### ¿Cómo evito que hackeen el sistema?

- Usa claves secretas fuertes (32+ caracteres)
- No compartas el código fuente
- Considera compilar a binario con `pkg`
- Implementa verificación online (opcional)

### ¿Puedo ofrecer descuentos?

Sí, simplemente genera licencias con duración extendida o tipo especial.

### ¿Cómo renueva un cliente?

Genera un nuevo código y el cliente lo ingresa. El tiempo se extiende automáticamente.

## Seguridad Adicional (Opcional)

### 1. Ofuscación de Código

```bash
npm install -g javascript-obfuscator
javascript-obfuscator src/lib/license-service.ts --output dist/
```

### 2. Compilación a Binario

```bash
npm install -g pkg
pkg . --targets node18-win-x64 --output smart-sales-bot.exe
```

### 3. Verificación Online

Implementa un servidor que valide licencias en tiempo real:

```typescript
async function verifyOnline(key: string) {
  const response = await fetch('https://tu-servidor.com/verify', {
    method: 'POST',
    body: JSON.stringify({ key })
  });
  return response.json();
}
```

## Soporte

### Documentación Completa
- `SISTEMA_LICENCIAS_COMPLETO.md` - Guía detallada
- `EJEMPLO_USO_LICENCIAS.md` - Ejemplos de código

### Contacto
- Email: soporte@tecnovariedades.com
- WhatsApp: +57 XXX XXX XXXX

## Licencia del Sistema

Este sistema de licencias es propiedad de Tecnovariedades D&S.
Todos los derechos reservados © 2024.

---

**Versión**: 1.0.0  
**Última actualización**: Noviembre 2024  
**Desarrollado por**: Tecnovariedades D&S
