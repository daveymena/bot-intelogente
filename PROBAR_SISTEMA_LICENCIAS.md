# 🧪 Cómo Probar el Sistema de Licencias

## Prueba Rápida (5 minutos)

### 1. Configurar Variables de Entorno

```bash
# Crear archivo .env.local si no existe
echo "LICENSE_SECRET_KEY=TestKey2024SecretForDevelopment" >> .env.local
echo "ADMIN_SECRET_KEY=AdminTestKey2024ForDevelopment" >> .env.local
```

### 2. Iniciar la Aplicación

```bash
npm run dev
```

Deberías ver en la consola:
```
🔐 Verificando licencia...
❌ LICENCIA INVÁLIDA O EXPIRADA
   No hay licencia activa. Inicia el período de prueba o activa una licencia.
```

### 3. Probar Período de Prueba

1. Abre tu navegador en: `http://localhost:3000/activate-license`

2. Verás la página de activación con dos pestañas:
   - **Activar Licencia**
   - **Prueba Gratuita**

3. Haz clic en la pestaña **"Prueba Gratuita"**

4. Haz clic en el botón **"Iniciar Prueba Gratuita"**

5. Deberías ver:
   ```
   ✅ Período de prueba iniciado. Expira el [FECHA]
   ```

6. Serás redirigido automáticamente al dashboard

7. Reinicia el servidor:
   ```bash
   # Ctrl+C para detener
   npm run dev
   ```

8. Ahora deberías ver:
   ```
   🔐 Verificando licencia...
   ✅ Licencia válida (trial)
      Días restantes: 10
   ```

### 4. Verificar Estado de Licencia

```bash
npm run license:check
```

Deberías ver:
```
🔐 VERIFICACIÓN DE LICENCIA
============================================================

📊 ESTADO ACTUAL:

✅ Estado: VÁLIDA
📦 Tipo: TRIAL
⏱️  Días restantes: 10
📅 Expira: [FECHA]

🖥️  Machine ID: abc123...
```

### 5. Generar una Licencia de Prueba

```bash
npm run license:generate
```

Sigue las instrucciones:
```
📧 Email del cliente: test@test.com
📦 Tipo: 2 (monthly)
🖥️  Vincular a máquina: n

✅ LICENCIA GENERADA EXITOSAMENTE
🔑 Clave: ABCD-1234-EFGH-5678
```

### 6. Activar la Licencia Generada

1. Ve a: `http://localhost:3000/activate-license`

2. Haz clic en la pestaña **"Activar Licencia"**

3. Ingresa:
   - **Clave**: `ABCD-1234-EFGH-5678` (la que generaste)
   - **Email**: `test@test.com`

4. Haz clic en **"Activar Licencia"**

5. Deberías ver:
   ```
   ✅ Licencia activada exitosamente hasta [FECHA]
   ```

6. Reinicia el servidor y verifica:
   ```bash
   npm run dev
   ```

   Deberías ver:
   ```
   ✅ Licencia válida (monthly)
      Días restantes: 30
   ```

### 7. Limpiar y Empezar de Nuevo

```bash
# Limpiar todas las licencias
npm run license:clear

# Reiniciar
npm run dev
```

## Pruebas Avanzadas

### Prueba 1: Verificar Machine ID

```bash
npm run license:check
```

Copia el Machine ID mostrado. Este ID es único para tu computadora.

### Prueba 2: Intentar Usar Trial Dos Veces

1. Inicia trial:
   ```bash
   npm run dev
   # Ir a /activate-license → Iniciar Prueba
   ```

2. Limpia el trial:
   ```bash
   npm run license:clear
   ```

3. Intenta iniciar trial de nuevo:
   - Debería fallar con: "Ya tienes un período de prueba activo"

### Prueba 3: Licencia Vinculada a Máquina

1. Genera licencia con Machine ID específico:
   ```bash
   npm run license:generate
   # Email: test@test.com
   # Tipo: 2
   # Vincular: s
   # Machine ID: [tu machine id]
   ```

2. Activa la licencia normalmente

3. Intenta modificar el archivo `.license` manualmente
   - No funcionará porque está encriptado

### Prueba 4: Expiración de Licencia

1. Genera una licencia trial (10 días)

2. Modifica manualmente la fecha en el código para simular expiración:
   ```typescript
   // En license-service.ts, temporalmente cambia:
   expiresAt.setDate(expiresAt.getDate() + 10);
   // Por:
   expiresAt.setDate(expiresAt.getDate() - 1); // Ya expirada
   ```

3. Verifica que el sistema detecta la expiración

### Prueba 5: Protección de Rutas API

1. Crea un archivo de prueba:
   ```typescript
   // test-license-protection.ts
   import LicenseGuard from './src/lib/license-guard';

   async function test() {
     console.log('Verificando licencia...');
     const isValid = await LicenseGuard.isValid();
     console.log('¿Es válida?', isValid);

     const hasAnalytics = await LicenseGuard.hasAccess('analytics');
     console.log('¿Tiene analytics?', hasAnalytics);

     const limitCheck = await LicenseGuard.checkLimit('messages');
     console.log('Límite de mensajes:', limitCheck);
   }

   test();
   ```

2. Ejecuta:
   ```bash
   npx tsx test-license-protection.ts
   ```

### Prueba 6: Componente de Estado

1. Agrega el componente al dashboard:
   ```tsx
   // src/app/page.tsx
   import { LicenseStatus } from '@/components/LicenseStatus';

   export default function Dashboard() {
     return (
       <div>
         <LicenseStatus />
         {/* resto del dashboard */}
       </div>
     );
   }
   ```

2. Verifica que muestra el estado correctamente

3. Prueba con diferentes tipos de licencia

## Checklist de Pruebas

Marca cada prueba completada:

### Básicas
- [ ] Sistema inicia sin licencia
- [ ] Puede iniciar período de prueba
- [ ] Trial dura 10 días
- [ ] No puede usar trial dos veces
- [ ] Puede generar licencias
- [ ] Puede activar licencias
- [ ] Licencia se verifica al iniciar

### Seguridad
- [ ] Machine ID es único
- [ ] Archivos están encriptados
- [ ] No se puede modificar .license manualmente
- [ ] Licencia expira correctamente
- [ ] Detecta licencia inválida

### UI/UX
- [ ] Página de activación funciona
- [ ] Componente de estado muestra info correcta
- [ ] Redirección automática funciona
- [ ] Mensajes de error son claros
- [ ] Formato de clave es correcto (XXXX-XXXX-XXXX-XXXX)

### API
- [ ] GET /api/license/check funciona
- [ ] POST /api/license/activate funciona
- [ ] POST /api/license/trial funciona
- [ ] POST /api/license/generate funciona (con admin key)

### Integración
- [ ] LicenseGuard.isValid() funciona
- [ ] LicenseGuard.hasAccess() funciona
- [ ] LicenseGuard.checkLimit() funciona
- [ ] Protección de rutas funciona

## Problemas Comunes

### Error: "Licencia corrupta o inválida"

**Causa**: Archivo .license dañado o clave secreta incorrecta

**Solución**:
```bash
npm run license:clear
npm run dev
```

### Error: "Machine ID no coincide"

**Causa**: Intentando usar licencia de otra máquina

**Solución**: Genera nueva licencia con el Machine ID correcto

### Error: "Ya tienes un período de prueba activo"

**Causa**: Ya usaste el trial en esta máquina

**Solución**: 
- Para testing: `npm run license:clear`
- Para producción: Comprar licencia

### Error: "Formato de clave inválido"

**Causa**: Clave no tiene formato XXXX-XXXX-XXXX-XXXX

**Solución**: Verifica que copiaste la clave completa y correctamente

## Logs Útiles

### Ver logs del servidor
```bash
npm run dev
# Observa los mensajes de licencia en la consola
```

### Ver estado detallado
```bash
npm run license:check
```

### Ver Machine ID
```bash
node -e "const LicenseService = require('./src/lib/license-service').default; console.log(LicenseService.getMachineId());"
```

## Siguiente Paso

Una vez que todas las pruebas pasen:

1. ✅ Configura claves secretas de producción
2. ✅ Define precios finales
3. ✅ Prepara página de ventas
4. ✅ Configura pasarela de pago
5. ✅ ¡Empieza a vender!

## Soporte

Si encuentras algún problema:

1. Revisa los logs del servidor
2. Ejecuta `npm run license:check`
3. Verifica las variables de entorno
4. Limpia y reinicia: `npm run license:clear && npm run dev`

---

**¡Éxito con tu sistema de licencias!** 🎉

**Desarrollado por**: Tecnovariedades D&S  
**Versión**: 1.0.0
