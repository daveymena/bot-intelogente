# Guía: Asistente de Código Kiro

## ¿Qué es?

El **Kiro Code Assistant** es una interfaz integrada en tu dashboard que te permite darle instrucciones a Kiro para que ejecute cambios en el código automáticamente.

## ¿Cómo funciona?

### 1. Acceso al Asistente

El componente `KiroCodeAssistant` se puede agregar a cualquier página del dashboard:

```tsx
import { KiroCodeAssistant } from '@/components/dashboard/KiroCodeAssistant';

export default function CodigoPage() {
  return (
    <div>
      <h1>Asistente de Código</h1>
      <KiroCodeAssistant />
    </div>
  );
}
```

### 2. Flujo de Trabajo

1. **Escribes la instrucción** en lenguaje natural
2. **Envías a Kiro** haciendo clic en el botón
3. **Kiro procesa** la instrucción y ejecuta los cambios
4. **Recibes confirmación** con los archivos modificados

### 3. Ejemplos de Instrucciones

#### Agregar Funcionalidad
```
Agrega un campo 'stock' al modelo Product en Prisma y actualiza 
el formulario de productos para incluirlo
```

#### Modificar UI
```
Cambia el color del botón principal de azul a verde y aumenta 
el tamaño de la fuente a 16px
```

#### Crear Endpoint
```
Crea un endpoint /api/products/export que exporte todos los 
productos a un archivo Excel
```

#### Corregir Bug
```
Arregla el bug donde el bot envía mensajes duplicados cuando 
el usuario pregunta por productos
```

#### Agregar Validación
```
Agrega validación de email en el formulario de registro y 
muestra un mensaje de error si el formato es inválido
```

## Arquitectura Técnica

### Frontend (Dashboard)

**Componente**: `src/components/dashboard/KiroCodeAssistant.tsx`

- Interfaz de usuario para escribir instrucciones
- Historial de cambios realizados
- Estados: pending, processing, completed, failed
- Muestra archivos modificados

### Backend (API)

**Endpoint**: `src/app/api/kiro/execute/route.ts`

- `POST /api/kiro/execute` - Recibe instrucciones
- `GET /api/kiro/execute` - Consulta estado de solicitudes
- Guarda instrucciones en `.kiro-requests.json`

### Archivo de Solicitudes

**Ubicación**: `.kiro-requests.json` (raíz del proyecto)

```json
[
  {
    "id": "1699999999999",
    "instruction": "Agrega campo stock al modelo Product",
    "timestamp": "2024-11-11T10:30:00.000Z",
    "status": "pending"
  }
]
```

## Integración con Kiro

### Opción 1: Monitoreo Automático

Kiro puede monitorear el archivo `.kiro-requests.json` y ejecutar automáticamente:

```bash
# Kiro revisa cada minuto si hay nuevas solicitudes
kiro watch .kiro-requests.json
```

### Opción 2: Comando Manual

Puedes ejecutar manualmente las solicitudes pendientes:

```bash
# Procesar todas las solicitudes pendientes
kiro process-requests

# Procesar una solicitud específica
kiro process-request --id 1699999999999
```

### Opción 3: Webhook

Configurar un webhook que notifique a Kiro cuando hay nuevas solicitudes:

```typescript
// En el endpoint POST
await fetch('http://kiro-webhook-url/execute', {
  method: 'POST',
  body: JSON.stringify({ instruction, requestId }),
});
```

## Agregar al Dashboard

### Opción A: Página Dedicada

Crea una nueva página en el dashboard:

```tsx
// src/app/codigo/page.tsx
import { KiroCodeAssistant } from '@/components/dashboard/KiroCodeAssistant';

export default function CodigoPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Asistente de Código</h1>
      <KiroCodeAssistant />
    </div>
  );
}
```

### Opción B: Modal en Dashboard Principal

Agrega un botón que abra el asistente en un modal:

```tsx
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { KiroCodeAssistant } from '@/components/dashboard/KiroCodeAssistant';
import { Code2 } from 'lucide-react';

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">
      <Code2 className="mr-2 h-4 w-4" />
      Asistente Kiro
    </Button>
  </DialogTrigger>
  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
    <KiroCodeAssistant />
  </DialogContent>
</Dialog>
```

### Opción C: Tab en Configuración

Agrega como una pestaña en la página de configuración:

```tsx
<Tabs defaultValue="general">
  <TabsList>
    <TabsTrigger value="general">General</TabsTrigger>
    <TabsTrigger value="bot">Bot</TabsTrigger>
    <TabsTrigger value="kiro">Asistente Kiro</TabsTrigger>
  </TabsList>
  
  <TabsContent value="kiro">
    <KiroCodeAssistant />
  </TabsContent>
</Tabs>
```

## Seguridad

### Autenticación

Solo usuarios autenticados pueden acceder:

```typescript
// En el endpoint
import { getServerSession } from 'next-auth';

const session = await getServerSession();
if (!session) {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
}
```

### Roles

Solo administradores pueden usar el asistente:

```typescript
if (session.user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
}
```

### Rate Limiting

Limita el número de solicitudes por usuario:

```typescript
const MAX_REQUESTS_PER_HOUR = 10;
// Implementar lógica de rate limiting
```

## Mejoras Futuras

### 1. Preview de Cambios

Mostrar un diff de los cambios antes de aplicarlos:

```typescript
interface ChangeRequest {
  // ... campos existentes
  preview?: {
    file: string;
    before: string;
    after: string;
  }[];
}
```

### 2. Rollback

Permitir deshacer cambios:

```typescript
<Button onClick={() => rollbackChange(request.id)}>
  Deshacer Cambios
</Button>
```

### 3. Aprobación Manual

Requerir aprobación antes de aplicar cambios:

```typescript
status: 'pending' | 'awaiting_approval' | 'approved' | 'processing' | 'completed'
```

### 4. Chat Interactivo

Conversación con Kiro para refinar instrucciones:

```typescript
<ChatInterface requestId={request.id} />
```

### 5. Templates

Instrucciones predefinidas comunes:

```typescript
const templates = [
  'Agregar campo a modelo',
  'Crear nuevo endpoint',
  'Modificar estilos',
  'Agregar validación',
];
```

## Comandos Rápidos

```bash
# Ver solicitudes pendientes
cat .kiro-requests.json

# Limpiar solicitudes completadas
node scripts/clean-kiro-requests.js

# Exportar historial
node scripts/export-kiro-history.js
```

## Troubleshooting

### Las solicitudes no se procesan

1. Verifica que el archivo `.kiro-requests.json` existe
2. Revisa los permisos del archivo
3. Confirma que Kiro está monitoreando el archivo

### Error al guardar instrucción

1. Verifica permisos de escritura en el directorio
2. Revisa el formato JSON del archivo
3. Confirma que hay espacio en disco

### Cambios no se reflejan

1. Reinicia el servidor después de cambios en archivos
2. Limpia la caché del navegador
3. Verifica que los archivos se modificaron correctamente

## Soporte

Para más ayuda, consulta:
- `GUIA_COMPLETA.md` - Documentación general
- `ESTRUCTURA_PROYECTO.md` - Arquitectura del proyecto
- `README.md` - Información básica

---

**Nota**: Este sistema está diseñado para facilitar el desarrollo, pero siempre revisa los cambios antes de desplegarlos a producción.
