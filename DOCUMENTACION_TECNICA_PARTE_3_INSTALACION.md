# 📚 DOCUMENTACIÓN TÉCNICA COMPLETA - PARTE 3: INSTALACIÓN

## 🚀 GUÍA DE INSTALACIÓN COMPLETA

---

## 📋 REQUISITOS PREVIOS

### Software Necesario

```bash
# 1. Node.js (v18 o superior)
node --version  # Debe mostrar v18.x o superior

# 2. npm (v9 o superior)
npm --version   # Debe mostrar v9.x o superior

# 3. Git
git --version

# 4. PostgreSQL (para producción)
psql --version  # Opcional en desarrollo
```

### Cuentas Necesarias

- ✅ Cuenta de Groq (https://console.groq.com)
- ✅ Número de WhatsApp (para el bot)
- ⚠️ Cuenta de MercadoPago (opcional, para pagos)
- ⚠️ Cuenta de OpenAI (opcional, para fallback)

---

## 📥 INSTALACIÓN PASO A PASO

### 1. Clonar el Repositorio

```bash
# Clonar el proyecto
git clone <url-del-repositorio>
cd bot-whatsapp

# O si empiezas desde cero
mkdir bot-whatsapp
cd bot-whatsapp
npm init -y
```

### 2. Instalar Dependencias

```bash
# Instalar todas las dependencias
npm install

# Esto instalará:
# - Next.js 15
# - Baileys (WhatsApp)
# - Groq SDK
# - Prisma
# - Socket.IO
# - Y todas las demás dependencias
```

### 3. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env
nano .env  # o usa tu editor favorito
```

#### Contenido del .env

```env
# ============================================
# BASE DE DATOS
# ============================================

# Para desarrollo (SQLite - más fácil)
DATABASE_URL="file:./dev.db"

# Para producción (PostgreSQL)
# DATABASE_URL="postgresql://usuario:password@localhost:5432/nombre_db"

# ============================================
# INTELIGENCIA ARTIFICIAL
# ============================================

# Groq (Principal) - OBLIGATORIO
GROQ_API_KEY="gsk_tu_api_key_aqui"

# Groq Backups (Recomendado)
GROQ_API_KEY_2="gsk_backup_1"
GROQ_API_KEY_3="gsk_backup_2"
GROQ_API_KEY_4="gsk_backup_3"

# Modelo de Groq
GROQ_MODEL="llama-3.3-70b-versatile"

# Fallback (Opcional)
AI_FALLBACK_ENABLED="true"
OPENAI_API_KEY="sk_opcional"
CLAUDE_API_KEY="sk-ant-opcional"

# ============================================
# PAGOS (Opcional)
# ============================================

MERCADOPAGO_ACCESS_TOKEN="tu_token_aqui"

# ============================================
# NEXT.JS
# ============================================

NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:4000"

# ============================================
# AUTENTICACIÓN
# ============================================

JWT_SECRET="cambia-esto-por-algo-super-seguro-y-aleatorio"

# ============================================
# SERVIDOR
# ============================================

NODE_ENV="development"
PORT="4000"
```

### 4. Configurar la Base de Datos

```bash
# Generar el cliente de Prisma
npm run db:generate

# Crear las tablas (desarrollo con SQLite)
npm run db:push

# O si usas PostgreSQL (producción)
npm run db:migrate
```

### 5. Crear Usuario Administrador

```bash
# Ejecutar script de creación de admin
npx tsx scripts/create-admin-user.ts

# O usar el script específico
node crear-usuario-admin-smart-sales.js
```

Esto creará un usuario con:
- Email: admin@example.com
- Password: admin123
- Role: ADMIN

⚠️ **IMPORTANTE:** Cambia la contraseña después del primer login.

---

## 🎯 PRIMER INICIO

### Modo Desarrollo

```bash
# Iniciar el servidor en modo desarrollo
npm run dev

# Esto iniciará:
# - Next.js en http://localhost:4000
# - Socket.IO server
# - Hot reload activado
```

### Verificar que Todo Funciona

1. **Abrir el navegador:**
   ```
   http://localhost:4000
   ```

2. **Login:**
   - Email: admin@example.com
   - Password: admin123

3. **Verificar Dashboard:**
   - Deberías ver el dashboard principal
   - Sección de WhatsApp Connection
   - Gestión de productos

---

## 📱 CONECTAR WHATSAPP

### Paso 1: Ir a WhatsApp Connection

1. En el dashboard, ir a la sección "WhatsApp"
2. Click en "Conectar WhatsApp"

### Paso 2: Escanear QR

1. Se generará un código QR
2. Abrir WhatsApp en tu teléfono
3. Ir a: Configuración → Dispositivos vinculados
4. Click en "Vincular un dispositivo"
5. Escanear el QR del dashboard

### Paso 3: Verificar Conexión

- El estado debe cambiar a "Conectado"
- Aparecerá el número de WhatsApp conectado
- El bot está listo para recibir mensajes

---

## 🗄️ CONFIGURACIÓN DE POSTGRESQL (Producción)

### Instalar PostgreSQL

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

#### macOS
```bash
brew install postgresql
brew services start postgresql
```

#### Windows
Descargar desde: https://www.postgresql.org/download/windows/

### Crear Base de Datos

```bash
# Conectar a PostgreSQL
sudo -u postgres psql

# Crear base de datos
CREATE DATABASE bot_whatsapp;

# Crear usuario
CREATE USER bot_user WITH PASSWORD 'tu_password_seguro';

# Dar permisos
GRANT ALL PRIVILEGES ON DATABASE bot_whatsapp TO bot_user;

# Salir
\q
```

### Actualizar .env

```env
DATABASE_URL="postgresql://bot_user:tu_password_seguro@localhost:5432/bot_whatsapp"
```

### Migrar Base de Datos

```bash
# Ejecutar migraciones
npm run db:migrate:deploy

# Verificar
npm run db:studio
```

---

## 🔧 SCRIPTS ÚTILES

### Desarrollo

```bash
# Iniciar en modo desarrollo
npm run dev

# Ver logs en tiempo real
npm run dev | grep "🤖"

# Reiniciar servidor
Ctrl + C
npm run dev
```

### Base de Datos

```bash
# Ver base de datos en GUI
npm run db:studio

# Resetear base de datos (⚠️ CUIDADO)
npm run db:reset

# Generar cliente de Prisma
npm run db:generate

# Crear migración
npm run db:migrate

# Aplicar migraciones (producción)
npm run db:migrate:deploy
```

### Productos

```bash
# Ver productos
npx tsx scripts/ver-productos.ts

# Importar productos desde CSV
npx tsx scripts/import-productos-completos.ts

# Verificar imágenes
npx tsx scripts/verificar-imagenes-productos.ts
```

### Testing

```bash
# Test de sistema completo
npx tsx scripts/test-sistema-completo.ts

# Test de calificación
npx tsx scripts/test-calificacion-mejorada.ts

# Test de búsqueda
npx tsx scripts/test-busqueda-portatil.ts
```

---

## 🐛 TROUBLESHOOTING COMÚN

### Error: "Cannot find module"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 4000 already in use"

```bash
# Cambiar puerto en .env
PORT="3000"

# O matar el proceso
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4000 | xargs kill -9
```

### Error: "Prisma Client not generated"

```bash
npm run db:generate
```

### Error: "WhatsApp no conecta"

1. Verificar que el puerto 4000 esté abierto
2. Limpiar sesiones antiguas:
   ```bash
   rm -rf auth_sessions/*
   ```
3. Reiniciar el servidor
4. Intentar conectar de nuevo

### Error: "Groq API Key invalid"

1. Verificar que la API key esté correcta en .env
2. Verificar que no tenga espacios al inicio/final
3. Obtener una nueva key en: https://console.groq.com

---

## ✅ CHECKLIST DE INSTALACIÓN

- [ ] Node.js 18+ instalado
- [ ] npm 9+ instalado
- [ ] Repositorio clonado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo .env configurado
- [ ] Groq API Key configurada
- [ ] Base de datos configurada
- [ ] Prisma client generado
- [ ] Migraciones ejecutadas
- [ ] Usuario admin creado
- [ ] Servidor iniciado (`npm run dev`)
- [ ] Dashboard accesible (http://localhost:4000)
- [ ] Login exitoso
- [ ] WhatsApp conectado
- [ ] Primer mensaje de prueba enviado

---

## 📝 PRÓXIMA PARTE

En la **PARTE 4** veremos:
- Estructura completa del proyecto
- Organización de archivos
- Convenciones de código
- Arquitectura de carpetas

---

**Fecha de creación:** Noviembre 2024  
**Versión:** 1.0.0
