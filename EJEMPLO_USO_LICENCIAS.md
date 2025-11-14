# 📚 Ejemplos de Uso del Sistema de Licencias

## 1. Proteger una Ruta API

### Ejemplo: Proteger endpoint de envío de mensajes

```typescript
// src/app/api/whatsapp/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import LicenseGuard from '@/lib/license-guard';

export async function POST(request: NextRequest) {
  // Verificar licencia
  const isValid = await LicenseGuard.isValid();
  
  if (!isValid) {
    return NextResponse.json(
      { 
        error: 'Licencia inválida o expirada',
        requiresActivation: true 
      },
      { status: 403 }
    );
  }

  // Verificar límite de mensajes
  const limitCheck = await LicenseGuard.checkLimit('messages');
  
  if (!limitCheck.allowed) {
    return NextResponse.json(
      { error: 'Límite de mensajes alcanzado' },
      { status: 429 }
    );
  }

  // Continuar con la lógica normal
  const body = await request.json();
  // ... enviar mensaje
  
  return NextResponse.json({ success: true });
}
```

## 2. Proteger Funcionalidad en el Frontend

### Ejemplo: Mostrar/ocultar características según licencia

```tsx
// src/components/AdvancedFeatures.tsx
'use client';

import { useEffect, useState } from 'react';
import LicenseGuard from '@/lib/license-guard';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

export function AdvancedFeatures() {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const access = await LicenseGuard.hasAccess('analytics');
    setHasAccess(access);
    setLoading(false);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!hasAccess) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center gap-2 text-gray-600">
          <Lock className="h-5 w-5" />
          <p>Esta característica requiere una licencia Premium</p>
        </div>
        <Button className="mt-2" onClick={() => window.location.href = '/activate-license'}>
          Actualizar Licencia
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Características avanzadas aquí */}
      <h3>Analytics Avanzado</h3>
      {/* ... */}
    </div>
  );
}
```

## 3. Verificar Licencia en el Servidor

### Ejemplo: Verificar antes de iniciar servicios

```typescript
// src/lib/baileys-service.ts
import LicenseGuard from './license-guard';

export class BaileysService {
  static async initialize() {
    // Verificar licencia antes de iniciar WhatsApp
    const isValid = await LicenseGuard.isValid();
    
    if (!isValid) {
      console.error('❌ No se puede iniciar WhatsApp: Licencia inválida');
      throw new Error('Licencia inválida o expirada');
    }

    console.log('✅ Licencia válida, iniciando WhatsApp...');
    // ... inicializar Baileys
  }
}
```

## 4. Mostrar Estado de Licencia en Dashboard

### Ejemplo: Componente de estado

```tsx
// src/app/page.tsx
import { LicenseStatus } from '@/components/LicenseStatus';

export default function Dashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1>Dashboard</h1>
      
      {/* Mostrar estado de licencia */}
      <div className="mb-6">
        <LicenseStatus />
      </div>

      {/* Resto del dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ... */}
      </div>
    </div>
  );
}
```

## 5. Limitar Funcionalidades según Tipo de Licencia

### Ejemplo: Límite de productos

```typescript
// src/app/api/products/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import LicenseGuard from '@/lib/license-guard';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  // Verificar licencia
  const isValid = await LicenseGuard.isValid();
  if (!isValid) {
    return NextResponse.json(
      { error: 'Licencia inválida' },
      { status: 403 }
    );
  }

  // Verificar límite de productos
  const limitCheck = await LicenseGuard.checkLimit('products');
  
  if (limitCheck.limit !== -1) {
    // Contar productos actuales
    const currentCount = await db.product.count();
    
    if (currentCount >= limitCheck.limit) {
      return NextResponse.json(
        { 
          error: `Límite de productos alcanzado (${limitCheck.limit})`,
          message: 'Actualiza tu licencia para agregar más productos',
          upgradeRequired: true
        },
        { status: 429 }
      );
    }
  }

  // Crear producto
  const body = await request.json();
  const product = await db.product.create({ data: body });
  
  return NextResponse.json(product);
}
```

## 6. Notificaciones de Expiración

### Ejemplo: Avisar cuando la licencia está por expirar

```tsx
// src/components/LicenseExpirationAlert.tsx
'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LicenseExpirationAlert() {
  const [showAlert, setShowAlert] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    checkExpiration();
    // Verificar cada hora
    const interval = setInterval(checkExpiration, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkExpiration = async () => {
    const response = await fetch('/api/license/check');
    const data = await response.json();
    
    if (data.valid && data.daysRemaining && data.daysRemaining <= 7) {
      setShowAlert(true);
      setDaysRemaining(data.daysRemaining);
    } else {
      setShowAlert(false);
    }
  };

  if (!showAlert) return null;

  return (
    <Alert className="mb-4 bg-yellow-50 border-yellow-200">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          ⚠️ Tu licencia expira en <strong>{daysRemaining} días</strong>
        </span>
        <Button 
          size="sm" 
          onClick={() => window.location.href = '/activate-license'}
        >
          Renovar Ahora
        </Button>
      </AlertDescription>
    </Alert>
  );
}
```

## 7. Generar Licencia desde Panel Admin

### Ejemplo: Endpoint protegido para admin

```typescript
// src/app/api/admin/generate-license/route.ts
import { NextRequest, NextResponse } from 'next/server';
import LicenseService from '@/lib/license-service';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const session = await getServerSession(request);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, type, machineId } = body;

    // Generar licencia
    const licenseKey = LicenseService.generateLicenseKey(email, type, machineId);

    // Guardar en base de datos
    await db.license.create({
      data: {
        key: licenseKey,
        email,
        type,
        machineId: machineId || null,
        expiresAt: calculateExpirationDate(type),
      },
    });

    // Enviar email al cliente
    await sendLicenseEmail(email, licenseKey, type);

    return NextResponse.json({
      success: true,
      licenseKey,
      message: 'Licencia generada y enviada por email',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al generar licencia' },
      { status: 500 }
    );
  }
}

function calculateExpirationDate(type: string): Date {
  const date = new Date();
  switch (type) {
    case 'trial':
      date.setDate(date.getDate() + 10);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    case 'lifetime':
      date.setFullYear(date.getFullYear() + 100);
      break;
  }
  return date;
}
```

## 8. Hook Personalizado para React

### Ejemplo: useLicense hook

```typescript
// src/hooks/useLicense.ts
import { useEffect, useState } from 'react';

interface LicenseInfo {
  valid: boolean;
  type?: string;
  daysRemaining?: number;
  features?: string[];
}

export function useLicense() {
  const [license, setLicense] = useState<LicenseInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLicense();
  }, []);

  const checkLicense = async () => {
    try {
      const response = await fetch('/api/license/check');
      const data = await response.json();
      setLicense(data);
    } catch (error) {
      console.error('Error checking license:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (feature: string): boolean => {
    return license?.features?.includes(feature) || false;
  };

  const isValid = (): boolean => {
    return license?.valid || false;
  };

  return {
    license,
    loading,
    hasFeature,
    isValid,
    refresh: checkLicense,
  };
}

// Uso en componente:
// const { license, hasFeature, isValid } = useLicense();
```

## 9. Proteger Toda la Aplicación

### Ejemplo: Layout con verificación

```tsx
// src/app/layout.tsx
import { LicenseExpirationAlert } from '@/components/LicenseExpirationAlert';
import { LicenseGuard } from '@/components/LicenseGuard';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <LicenseGuard>
          <LicenseExpirationAlert />
          {children}
        </LicenseGuard>
      </body>
    </html>
  );
}
```

```tsx
// src/components/LicenseGuard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function LicenseGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    checkLicense();
  }, [pathname]);

  const checkLicense = async () => {
    // Permitir rutas públicas
    const publicRoutes = ['/activate-license', '/login', '/register'];
    if (publicRoutes.includes(pathname)) {
      setIsValid(true);
      return;
    }

    try {
      const response = await fetch('/api/license/check');
      const data = await response.json();
      
      if (!data.valid) {
        router.push('/activate-license');
      } else {
        setIsValid(true);
      }
    } catch (error) {
      console.error('Error checking license:', error);
      setIsValid(false);
    }
  };

  if (isValid === null) {
    return <div>Verificando licencia...</div>;
  }

  return <>{children}</>;
}
```

## 10. Testing del Sistema de Licencias

### Ejemplo: Tests automatizados

```typescript
// tests/license.test.ts
import LicenseService from '@/lib/license-service';

describe('License System', () => {
  beforeEach(() => {
    // Limpiar licencias
    const fs = require('fs');
    try {
      fs.unlinkSync('.license');
      fs.unlinkSync('.trial');
    } catch (e) {}
  });

  test('should generate valid license key', () => {
    const key = LicenseService.generateLicenseKey(
      'test@test.com',
      'monthly'
    );
    expect(key).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });

  test('should start trial successfully', async () => {
    const licenseService = LicenseService.getInstance();
    const result = await licenseService.startTrial();
    
    expect(result.success).toBe(true);
    expect(result.expiresAt).toBeDefined();
  });

  test('should activate license', async () => {
    const licenseService = LicenseService.getInstance();
    const key = LicenseService.generateLicenseKey(
      'test@test.com',
      'monthly'
    );
    
    const result = await licenseService.activateLicense(
      key,
      'test@test.com',
      'monthly'
    );
    
    expect(result.success).toBe(true);
    expect(result.license).toBeDefined();
  });

  test('should detect invalid license', async () => {
    const licenseService = LicenseService.getInstance();
    const check = await licenseService.checkLicense();
    
    expect(check.valid).toBe(false);
  });
});
```

---

## Comandos Útiles

```bash
# Generar licencia
npm run license:generate

# Verificar licencia actual
npm run license:check

# Limpiar licencias (testing)
npm run license:clear

# Iniciar app con verificación
npm run dev
```

## Notas Importantes

1. **Siempre verifica la licencia** antes de ejecutar funcionalidades críticas
2. **Usa límites apropiados** según el tipo de licencia
3. **Notifica al usuario** cuando la licencia esté por expirar
4. **Guarda logs** de activaciones y verificaciones
5. **Protege las claves secretas** en variables de entorno

---

**Desarrollado por**: Tecnovariedades D&S
