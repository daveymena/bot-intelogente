# ⚡ COMANDOS RÁPIDOS - LIMPIEZA DE WHATSAPP

## 🎯 Para Limpiar LOCAL (Ya lo hiciste ✅)

```bash
# Limpiar todo
npx tsx scripts/limpiar-todo-whatsapp.ts

# Verificar limpieza
npx tsx scripts/verificar-limpieza.ts
```

---

## 🌐 Para Limpiar PRODUCCIÓN (Easypanel)

### Paso 1: Subir Scripts a Git

```bash
git add .
git commit -m "feat: scripts de limpieza para producción"
git push origin main
```

### Paso 2: Desplegar en Easypanel

1. Ve a Easypanel → Tu proyecto
2. Espera el auto-deploy o haz clic en **Deploy**
3. Espera a que termine (status: Running)

### Paso 3: Abrir Terminal en Easypanel

1. En tu aplicación → Busca **Terminal** o **Console**
2. Se abrirá una terminal dentro del contenedor

### Paso 4: Ejecutar Limpieza (CON CONFIRMACIÓN)

```bash
# Script seguro con confirmaciones
npx tsx scripts/limpiar-produccion-seguro.ts
```

**El script te pedirá:**
1. Confirmar que quieres continuar (escribe "SI")
2. Confirmar producción (escribe "CONFIRMAR PRODUCCION")

### Paso 5: Verificar

```bash
npx tsx scripts/verificar-limpieza.ts
```

### Paso 6: Reiniciar Aplicación

En Easypanel:
- Haz clic en **Restart**
- Espera a que se reinicie

---

## 🚀 Comando Todo-en-Uno (Producción)

```bash
# En la terminal de Easypanel
npx tsx scripts/limpiar-produccion-seguro.ts && npx tsx scripts/verificar-limpieza.ts
```

---

## 📊 Verificar Estado (Cualquier Ambiente)

```bash
# Ver estado completo
npx tsx scripts/verificar-limpieza.ts

# Ver solo usuarios
npx tsx scripts/ver-usuarios.ts
```

---

## 🆘 Si Algo Sale Mal

```bash
# Diagnosticar WhatsApp
npx tsx scripts/diagnosticar-whatsapp-completo.ts

# Ver logs de la base de datos
npx prisma studio
```

---

## ⚠️ IMPORTANTE

- **Local**: Los cambios solo afectan tu base de datos local
- **Producción**: Debes ejecutar los scripts en Easypanel
- **Backup**: Siempre haz backup antes de limpiar producción
- **Confirmación**: El script seguro pide doble confirmación

---

## 📝 Diferencias entre Scripts

| Script | Confirmación | Ambiente | Uso |
|--------|--------------|----------|-----|
| `limpiar-todo-whatsapp.ts` | ❌ No | Cualquiera | Rápido, sin preguntas |
| `limpiar-produccion-seguro.ts` | ✅ Doble | Detecta auto | Seguro, con confirmaciones |
| `verificar-limpieza.ts` | ❌ No | Cualquiera | Solo lectura |

---

## 🎯 Recomendación

**Para Producción**: Usa siempre `limpiar-produccion-seguro.ts`
- ✅ Detecta automáticamente el ambiente
- ✅ Pide confirmación doble
- ✅ Muestra estado antes y después
- ✅ Más seguro

**Para Local**: Puedes usar cualquiera
- `limpiar-todo-whatsapp.ts` es más rápido
- `limpiar-produccion-seguro.ts` es más seguro

---

## 📋 Checklist Rápido

### Local (Ya hecho ✅)
- [x] Ejecutar limpieza
- [x] Verificar estado
- [x] Sistema limpio

### Producción (Por hacer)
- [ ] Subir scripts a Git
- [ ] Desplegar en Easypanel
- [ ] Abrir terminal en Easypanel
- [ ] Ejecutar `limpiar-produccion-seguro.ts`
- [ ] Confirmar operación
- [ ] Verificar limpieza
- [ ] Reiniciar aplicación
- [ ] Conectar WhatsApp
- [ ] Probar funcionamiento

---

**Fecha**: ${new Date().toLocaleString('es-CO')}
