# 🚀 Despliegue Seguro con Sistema de Licencias

## Preparación para Producción

### 1. Generar Claves Seguras

```bash
# Generar clave para LICENSE_SECRET_KEY
node -e "console.log('LICENSE_SECRET_KEY=' + require('crypto').randomBytes(32).toString('hex'))"

# Generar clave para ADMIN_SECRET_KEY
node -e "console.log('ADMIN_SECRET_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

**IMPORTANTE**: Guarda estas claves en un lugar seguro (gestor de contraseñas).

### 2. Configurar Variables de Entorno

#### En Easypanel/Docker

```bash
# Variables de licencia
LICENSE_SECRET_KEY=tu_clave_generada_aqui_64_caracteres
ADMIN_SECRET_KEY=tu_clave_admin_generada_aqui_64_caracteres
```

#### En Railway

```bash
railway variables set LICENSE_SECRET_KEY=tu_clave_aqui
railway variables set ADMIN_SECRET_KEY=tu_clave_aqui
```

#### En Vercel

```bash
vercel env add LICENSE_SECRET_KEY
vercel env add ADMIN_SECRET_KEY
```

### 3. Actualizar .gitignore

Asegúrate de que estos archivos NUNCA se suban a Git:

```gitignore
# Archivos de licencia (CRÍTICO)
.license
.trial
/licenses
licenses/

# Variables de entorno
.env
.env.local
.env.production
```

### 4. Verificar Seguridad

```bash
# Verificar que no hay archivos sensibles en Git
git status

# Verificar historial de Git
git log --all --full-history -- .license
git log --all --full-history -- .trial

# Si encuentras archivos sensibles, límpialos:
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .license .trial" \
  --prune-empty --tag-name-filter cat -- --all
```

## Distribución del Software

### Opción 1: Distribución Web (Recomendada)

**Ventajas**:
- Control total sobre actualizaciones
- Verificación de licencia en tiempo real
- Fácil de mantener

**Pasos**:
1. Despliega en servidor (Easypanel/Railway/Vercel)
2. Clientes acceden vía web
3. Sistema de licencias funciona automáticamente

### Opción 2: Distribución como Ejecutable

**Ventajas**:
- Cliente instala en su servidor
- No depende de tu infraestructura
- Mayor precio de venta

**Pasos**:

#### A. Compilar a Binario

```bash
# Instalar pkg
npm install -g pkg

# Compilar para Windows
pkg . --targets node18-win-x64 --output dist/smart-sales-bot-win.exe

# Compilar para Linux
pkg . --targets node18-linux-x64 --output dist/smart-sales-bot-linux

# Compilar para macOS
pkg . --targets node18-macos-x64 --output dist/smart-sales-bot-macos
```

#### B. Ofuscar Código Crítico

```bash
# Instalar ofuscador
npm install -g javascript-obfuscator

# Ofuscar archivos de licencia
javascript-obfuscator src/lib/license-service.ts \
  --output dist/license-service.js \
  --compact true \
  --control-flow-flattening true \
  --dead-code-injection true \
  --string-array true \
  --string-array-encoding 'rc4'
```

#### C. Crear Instalador

```bash
# Para Windows (usando Inno Setup)
# Crear archivo setup.iss

[Setup]
AppName=Smart Sales Bot Pro
AppVersion=1.0.0
DefaultDirName={pf}\SmartSalesBot
DefaultGroupName=Smart Sales Bot Pro
OutputDir=installers
OutputBaseFilename=SmartSalesBotSetup

[Files]
Source: "dist\smart-sales-bot-win.exe"; DestDir: "{app}"
Source: "README.txt"; DestDir: "{app}"

[Icons]
Name: "{group}\Smart Sales Bot Pro"; Filename: "{app}\smart-sales-bot-win.exe"
```

### Opción 3: Distribución Docker

**Ventajas**:
- Fácil de desplegar
- Aislamiento completo
- Multiplataforma

**Dockerfile Optimizado**:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar archivos necesarios
COPY package*.json ./
COPY prisma ./prisma/
COPY . .

# Instalar dependencias
RUN npm ci --only=production

# Generar Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Variables de entorno requeridas
ENV NODE_ENV=production
ENV LICENSE_SECRET_KEY=""
ENV ADMIN_SECRET_KEY=""

# Iniciar aplicación
CMD ["npm", "start"]
```

**docker-compose.yml**:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/smartsalesbot
      - LICENSE_SECRET_KEY=${LICENSE_SECRET_KEY}
      - ADMIN_SECRET_KEY=${ADMIN_SECRET_KEY}
    volumes:
      - license-data:/app/.license-data
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=smartsalesbot
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  license-data:
  postgres-data:
```

## Sistema de Verificación Online (Avanzado)

### 1. Crear Servidor de Licencias

```typescript
// license-server/index.ts
import express from 'express';
import { db } from './db';

const app = express();
app.use(express.json());

// Verificar licencia
app.post('/api/verify', async (req, res) => {
  const { key, machineId } = req.body;

  const license = await db.license.findUnique({
    where: { key }
  });

  if (!license) {
    return res.json({ valid: false, message: 'Licencia no encontrada' });
  }

  if (license.machineId && license.machineId !== machineId) {
    return res.json({ valid: false, message: 'Licencia vinculada a otra máquina' });
  }

  if (new Date() > license.expiresAt) {
    return res.json({ valid: false, message: 'Licencia expirada' });
  }

  if (!license.active) {
    return res.json({ valid: false, message: 'Licencia desactivada' });
  }

  // Actualizar última verificación
  await db.license.update({
    where: { key },
    data: { lastChecked: new Date() }
  });

  return res.json({
    valid: true,
    type: license.type,
    expiresAt: license.expiresAt
  });
});

app.listen(3001, () => {
  console.log('License server running on port 3001');
});
```

### 2. Integrar en Cliente

```typescript
// src/lib/license-service.ts
async function verifyOnline(key: string, machineId: string): Promise<boolean> {
  try {
    const response = await fetch('https://licenses.tudominio.com/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, machineId })
    });

    const data = await response.json();
    return data.valid;
  } catch (error) {
    // Si falla la verificación online, usar verificación local
    console.warn('Verificación online falló, usando local');
    return this.verifyLocal(key);
  }
}
```

## Protección Adicional

### 1. Watermarking de Código

Agrega identificadores únicos por cliente:

```typescript
// Generar watermark único
const watermark = crypto.createHash('sha256')
  .update(email + timestamp)
  .digest('hex')
  .substring(0, 16);

// Insertar en código
const code = `
// License: ${watermark}
export class MyService {
  // ...
}
`;
```

### 2. Telemetría (Opcional)

```typescript
// Enviar estadísticas anónimas
async function sendTelemetry() {
  const stats = {
    machineId: LicenseService.getMachineId(),
    version: '1.0.0',
    lastActive: new Date(),
  };

  await fetch('https://telemetry.tudominio.com/ping', {
    method: 'POST',
    body: JSON.stringify(stats)
  });
}
```

### 3. Kill Switch Remoto

```typescript
// Verificar si la licencia fue revocada remotamente
async function checkRevocation(key: string): Promise<boolean> {
  const response = await fetch(`https://api.tudominio.com/revoked/${key}`);
  const data = await response.json();
  return data.revoked;
}
```

## Checklist de Seguridad

Antes de distribuir, verifica:

- [ ] Claves secretas generadas y seguras
- [ ] Variables de entorno configuradas
- [ ] Archivos .license y .trial en .gitignore
- [ ] Código crítico ofuscado (opcional)
- [ ] Compilado a binario (si aplica)
- [ ] Verificación online implementada (opcional)
- [ ] Logs de activación configurados
- [ ] Sistema de renovación probado
- [ ] Documentación para clientes lista
- [ ] Soporte técnico preparado

## Manejo de Incidentes

### Licencia Comprometida

```bash
# 1. Desactivar licencia en base de datos
UPDATE licenses SET active = false WHERE key = 'XXXX-XXXX-XXXX-XXXX';

# 2. Generar nueva licencia para el cliente
npm run license:generate

# 3. Notificar al cliente
```

### Clave Secreta Comprometida

```bash
# 1. Generar nueva clave
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 2. Actualizar en servidor
# 3. Regenerar todas las licencias activas
# 4. Notificar a todos los clientes
```

### Piratería Detectada

```bash
# 1. Identificar Machine ID del pirata
# 2. Bloquear en servidor (si tienes verificación online)
# 3. Contactar al cliente original
# 4. Tomar acciones legales si es necesario
```

## Monitoreo

### Logs Importantes

```typescript
// Registrar activaciones
console.log('[LICENSE] Activated:', {
  key: licenseKey,
  email: email,
  machineId: machineId,
  timestamp: new Date()
});

// Registrar verificaciones fallidas
console.warn('[LICENSE] Verification failed:', {
  reason: 'expired',
  key: licenseKey,
  timestamp: new Date()
});
```

### Dashboard de Licencias (Opcional)

Crea un panel para ver:
- Licencias activas
- Licencias por expirar
- Intentos de activación fallidos
- Ingresos por tipo de licencia

## Soporte al Cliente

### Email de Bienvenida

```
Asunto: Tu licencia de Smart Sales Bot Pro

Hola [NOMBRE],

¡Gracias por tu compra!

Tu código de licencia es: XXXX-XXXX-XXXX-XXXX

Para activar:
1. Abre Smart Sales Bot Pro
2. Ve a "Activar Licencia"
3. Ingresa tu código y email
4. ¡Listo!

Tu licencia expira el: [FECHA]

¿Necesitas ayuda? Contáctanos:
- Email: soporte@tecnovariedades.com
- WhatsApp: +57 XXX XXX XXXX

Saludos,
Equipo Tecnovariedades D&S
```

### FAQ para Clientes

Incluye en tu documentación:
- Cómo activar la licencia
- Qué hacer si cambian de computadora
- Cómo renovar la suscripción
- Política de reembolsos
- Contacto de soporte

## Conclusión

Con este sistema implementado, tu software está protegido contra:
- ✅ Piratería
- ✅ Uso no autorizado
- ✅ Distribución ilegal
- ✅ Modificación de licencias

Y puedes:
- ✅ Controlar quién usa tu software
- ✅ Generar ingresos recurrentes
- ✅ Ofrecer diferentes planes
- ✅ Actualizar remotamente

---

**Importante**: La seguridad es un proceso continuo. Mantén tu sistema actualizado y monitorea actividad sospechosa.

**Desarrollado por**: Tecnovariedades D&S  
**Versión**: 1.0.0  
**Última actualización**: Noviembre 2024
