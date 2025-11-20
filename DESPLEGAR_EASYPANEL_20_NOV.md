# 🚀 Desplegar en Easypanel - 20 Nov 2025

## 📋 Cambios Incluidos

✅ Memoria compartida entre agentes
✅ Prioridad de intenciones corregida  
✅ Búsqueda de productos específicos mejorada
✅ Extracción de producto en mensaje de pago
✅ Scoring inteligente para productos únicos

## 🔧 Pasos para Desplegar

### 1️⃣ Subir Cambios a Git

```bash
# Ejecutar el script
subir-cambios-20-nov.bat
```

O manualmente:
```bash
git add .
git commit -m "fix: Correcciones críticas sistema de agentes"
git push origin main
```

### 2️⃣ Actualizar en Easypanel

1. **Ir a Easypanel**: https://easypanel.io
2. **Abrir tu proyecto**: Smart Sales Bot Pro
3. **Ir a "Source"** (menú lateral)
4. **Click en "Rebuild"** o "Deploy"
5. **Esperar** a que termine el build (2-5 minutos)

### 3️⃣ Verificar Despliegue

Una vez desplegado, verifica:

```bash
# Ver logs en Easypanel
# Buscar estas líneas:
✅ Orquestador inicializado
✅ Memoria compartida inicializada
```

### 4️⃣ Probar en WhatsApp

Envía estos mensajes de prueba:

1. **Test Búsqueda Específica**:
   ```
   Cliente: "me interesa el curso de piano"
   Esperado: Muestra "Curso Completo de Piano Online"
   ```

2. **Test Método de Pago**:
   ```
   Cliente: "me interesa el curso de piano"
   Cliente: "quiero pagar por mercadopago"
   Esperado: Genera link de MercadoPago del curso de piano
   ```

3. **Test Producto con Nombre Único**:
   ```
   Cliente: "quiero una laptop"
   Esperado: Muestra laptop específica (no Mega Pack)
   ```

## ⚠️ Notas Importantes

### Variables de Entorno
Asegúrate de que estas variables estén configuradas en Easypanel:

```env
# IA
GROQ_API_KEY=tu_api_key_aqui

# Base de datos
DATABASE_URL=postgresql://...

# WhatsApp (opcional, se crea automáticamente)
# Las sesiones se guardan en auth_sessions/
```

### Archivos Ignorados
Estos archivos NO se suben a Git (están en .gitignore):
- `auth_sessions/` - Sesiones de WhatsApp
- `.env` - Variables de entorno locales
- `node_modules/` - Dependencias

### Persistencia de Sesión WhatsApp
En Easypanel, necesitas configurar un **volumen persistente** para `auth_sessions/`:

1. Ve a "Mounts" en Easypanel
2. Agrega un volumen:
   - **Path**: `/app/auth_sessions`
   - **Type**: Persistent Volume
   - **Size**: 1GB

Esto evita que tengas que escanear el QR cada vez que se reinicia el contenedor.

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
# En Easypanel, ejecutar:
npm install
npm run build
```

### Error: "Database connection failed"
- Verifica que `DATABASE_URL` esté configurada correctamente
- Ejecuta las migraciones: `npm run db:migrate:deploy`

### WhatsApp no conecta
- Verifica que el volumen persistente esté configurado
- Limpia la sesión: Elimina archivos en `auth_sessions/`
- Escanea el QR nuevamente desde el dashboard

## ✅ Checklist Final

- [ ] Cambios subidos a Git
- [ ] Rebuild ejecutado en Easypanel
- [ ] Build completado sin errores
- [ ] Variables de entorno configuradas
- [ ] Volumen persistente para WhatsApp configurado
- [ ] WhatsApp conectado
- [ ] Tests de búsqueda funcionando
- [ ] Tests de pago funcionando

## 📞 Soporte

Si algo falla:
1. Revisa los logs en Easypanel
2. Verifica las variables de entorno
3. Asegúrate de que la base de datos esté accesible
4. Verifica que el volumen persistente esté montado

---

**Última actualización**: 20 Noviembre 2025
**Versión**: 2.1.0 - Sistema de Agentes Mejorado
