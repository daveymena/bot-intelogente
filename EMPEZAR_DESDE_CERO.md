# 🚀 Empezar Desde Cero - Guía Completa

## 📋 Situación Actual

Tu base de datos no existe todavía. Necesitas configurar todo el sistema desde cero.

---

## ✅ SOLUCIÓN RÁPIDA (Recomendada)

### Ejecuta este archivo:
```bash
configurar-sistema-completo.bat
```

Este script hará TODO automáticamente:
1. ✅ Detiene procesos de Node.js
2. ✅ Genera cliente de Prisma
3. ✅ Crea la base de datos
4. ✅ Crea usuario administrador
5. ✅ Verifica que todo funcione

---

## 📝 SOLUCIÓN MANUAL (Paso a Paso)

Si prefieres hacerlo manualmente:

### Paso 1: Generar Cliente de Prisma
```bash
npx prisma generate
```

### Paso 2: Crear Base de Datos
```bash
npx prisma db push
```

### Paso 3: Crear Usuario Admin
```bash
npx tsx scripts/create-admin.ts
```

Cuando te pregunte:
- **Email**: Tu email (ej: admin@tuempresa.com)
- **Contraseña**: Tu contraseña segura
- **Nombre**: Tu nombre

### Paso 4: Verificar Usuarios
```bash
node ver-usuarios-simple.js
```

### Paso 5: Iniciar el Servidor
```bash
npm run dev
```

---

## 🔐 CREDENCIALES DE ACCESO

Después de ejecutar el script, podrás acceder con:

- **URL**: http://localhost:3000
- **Email**: El que configuraste
- **Contraseña**: La que configuraste

---

## 📊 ESTRUCTURA DE LA BASE DE DATOS

El sistema creará estas tablas automáticamente:

### Tablas Principales
- ✅ **users** - Usuarios del sistema
- ✅ **products** - Catálogo de productos
- ✅ **conversations** - Conversaciones de WhatsApp
- ✅ **messages** - Mensajes enviados/recibidos
- ✅ **whatsapp_connections** - Conexiones de WhatsApp
- ✅ **message_queue** - Cola de mensajes (nuevo)
- ✅ **bot_settings** - Configuración del bot
- ✅ **ai_prompts** - Prompts de IA

---

## 🎯 DESPUÉS DE CONFIGURAR

### 1. Iniciar Sesión
```
http://localhost:3000
```

### 2. Conectar WhatsApp
1. Ve a "Conexión WhatsApp"
2. Haz clic en "Conectar WhatsApp"
3. Escanea el código QR
4. ¡Listo!

### 3. Agregar Productos
1. Ve a "Productos"
2. Haz clic en "Agregar Producto"
3. Llena la información
4. Guarda

### 4. Configurar Bot
1. Ve a "Configuración"
2. Configura tu API Key de Groq
3. Personaliza las respuestas
4. Guarda cambios

---

## 🔧 CARACTERÍSTICAS ACTIVADAS

Después de la configuración, tendrás:

### ✅ Sistema de Cola de Mensajes
- Mensajes se guardan si bot desconectado
- Procesamiento automático al reconectar
- Máximo 3 intentos por mensaje
- Limpieza automática (7 días)

### ✅ Reconexión Automática
- Frontend: 3 intentos automáticos
- Backend: Reconexión continua
- Indicadores visuales
- Notificaciones en tiempo real

### ✅ Envío de Fotos Corregido
- Lee correctamente desde `public/fotos/`
- Soporta múltiples formatos
- Validación de archivos

### ✅ Bot Inteligente
- Respuestas con IA (Groq)
- Reconocimiento de productos
- Contexto de conversación (24h)
- Respuestas persuasivas

---

## 📁 ARCHIVOS IMPORTANTES

### Scripts de Configuración
- `configurar-sistema-completo.bat` - Configura todo automáticamente
- `ver-usuarios.bat` - Ver usuarios en la base de datos
- `aplicar-migracion-cola.bat` - Aplicar migración de cola

### Scripts de Utilidad
- `scripts/create-admin.ts` - Crear usuario admin
- `scripts/seed-products.ts` - Agregar productos de ejemplo
- `ver-usuarios-simple.js` - Ver usuarios (Node.js)

### Documentación
- `APLICAR_CAMBIOS_AHORA.md` - Guía de cambios recientes
- `SISTEMA_COLA_MENSAJES.md` - Detalles de la cola
- `RECONEXION_AUTOMATICA_IMPLEMENTADA.md` - Detalles de reconexión

---

## ❌ SOLUCIÓN DE PROBLEMAS

### Error: "Base de datos no existe"
**Solución:**
```bash
npx prisma db push
```

### Error: "No hay usuarios"
**Solución:**
```bash
npx tsx scripts/create-admin.ts
```

### Error: "Property 'messageQueue' does not exist"
**Solución:**
```bash
npx prisma generate
```

### Error: "Cannot find module '@prisma/client'"
**Solución:**
```bash
npm install
npx prisma generate
```

---

## 🎉 VERIFICACIÓN FINAL

Después de configurar, verifica que todo funcione:

### ✅ Checklist
- [ ] Base de datos creada (`prisma/dev.db` existe)
- [ ] Usuario admin creado (puedes iniciar sesión)
- [ ] Servidor inicia sin errores (`npm run dev`)
- [ ] Dashboard accesible (http://localhost:3000)
- [ ] WhatsApp se puede conectar
- [ ] Bot responde mensajes

---

## 📞 COMANDOS ÚTILES

### Ver usuarios
```bash
node ver-usuarios-simple.js
```

### Reiniciar base de datos (CUIDADO: Borra todo)
```bash
npx prisma migrate reset
```

### Ver estructura de base de datos
```bash
npx prisma studio
```

### Verificar conexión de WhatsApp
```bash
npx tsx scripts/verificar-conexion.ts
```

---

## 🚀 INICIO RÁPIDO

### Opción 1: Todo Automático (Recomendado)
```bash
configurar-sistema-completo.bat
npm run dev
```

### Opción 2: Manual
```bash
npx prisma generate
npx prisma db push
npx tsx scripts/create-admin.ts
npm run dev
```

---

## 💡 PRÓXIMOS PASOS

1. ✅ Ejecuta `configurar-sistema-completo.bat`
2. ✅ Inicia sesión en http://localhost:3000
3. ✅ Conecta WhatsApp
4. ✅ Agrega productos
5. ✅ Prueba el bot
6. ✅ Disfruta de tu sistema automatizado

---

## 🎯 RESULTADO ESPERADO

Después de seguir esta guía:

- ✅ Sistema completamente funcional
- ✅ Base de datos configurada
- ✅ Usuario admin creado
- ✅ Cola de mensajes activa
- ✅ Reconexión automática habilitada
- ✅ Bot listo para usar

**¡Tu sistema estará 100% operativo!** 🎉
