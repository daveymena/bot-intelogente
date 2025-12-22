# Comandos para Ejecutar en Easypanel

## ✅ El código ya está en GitHub

Ya hiciste `git push origin main` y está actualizado.

## 📋 Pasos en Easypanel

### 1. Ir a la Consola de Easypanel

1. Abre Easypanel
2. Ve a tu aplicación `bot-whatsapp`
3. Click en **"Terminal"** o **"Console"**

### 2. Hacer Pull del Repositorio

```bash
git pull origin main
```

### 3. Instalar Dependencias (si es necesario)

```bash
npm install
```

### 4. Aplicar Migración de Base de Datos

```bash
npx prisma migrate deploy
```

**Esto creará el campo `customCategory` en la base de datos.**

### 5. Regenerar Cliente de Prisma

```bash
npx prisma generate
```

### 6. Rebuild de la Aplicación

Desde el panel de Easypanel:
- Click en **"Rebuild"** o **"Redeploy"**
- Espera a que termine el build

### 7. Verificar que Funciona

Prueba el bot en WhatsApp:

**Test 1: Búsqueda General**
```
Enviar: "portátiles"
Esperado: Bot pregunta uso y presupuesto
```

**Test 2: Búsqueda Específica**
```
Enviar: "curso de piano"
Esperado: Bot muestra ese curso específico
```

**Test 3: Métodos de Pago**
```
Enviar: "quiero pagar por Nequi"
Esperado: Bot envía número Nequi
```

---

## 🔍 Si hay Errores

### Error: "Can't reach database"
- Estás ejecutando desde local
- Debes ejecutar desde la consola de Easypanel

### Error: "Migration already applied"
- La migración ya existe
- Puedes continuar con el rebuild

### Error: "Build failed"
- Revisa los logs en Easypanel
- Verifica que todas las dependencias estén instaladas

---

## ✅ Cambios Implementados

### 1. Sistema de Subcategorías
- 113 productos organizados
- Búsqueda precisa sin confusiones

### 2. Agente Intérprete
- Reinterpreta consultas ambiguas
- Detecta intención real
- Sin malentendidos

### 3. Categorías Personalizadas
- Campo `customCategory` en base de datos
- Cliente puede crear sus propias categorías

---

## 📊 Archivos Nuevos en el Repositorio

- `src/agents/interpreter-agent.ts` - Agente intérprete
- `src/agents/orchestrator.ts` - Integración del intérprete
- `src/agents/deep-reasoning-agent.ts` - Usa interpretación
- `prisma/schema.prisma` - Campo `customCategory`
- `scripts/asignar-subcategorias-automatico.ts` - Script de subcategorías
- `scripts/corregir-subcategorias.ts` - Script de correcciones

---

## 🎯 Resultado Esperado

Después del rebuild, el bot:

✅ Entiende intención real del cliente  
✅ Sin confusiones entre productos  
✅ Respuestas precisas y contextuales  
✅ Mejor experiencia de usuario  
✅ Más conversiones y ventas  

---

**Nota:** La migración SOLO puede ejecutarse desde Easypanel porque necesita acceso a la base de datos interna (`provedor-ia_bot-whatsapp-db:5432`).
