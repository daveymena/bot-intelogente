# 🗄️ Aplicar Migración de Base de Datos

## ✅ Modelo Agregado

Se agregó el modelo `StoreSettings` a Prisma con todos los campos necesarios para configurar la tienda.

## 📝 Ejecutar Migración

```bash
cd botexperimento
npx prisma migrate dev --name add_store_settings
```

Esto creará la tabla en la base de datos.

## 🔄 Generar Cliente de Prisma

```bash
npx prisma generate
```

Esto actualizará el cliente de Prisma con el nuevo modelo.

## ✅ Verificar

```bash
npx prisma studio
```

Abre Prisma Studio para ver la nueva tabla `StoreSettings`.

---

**IMPORTANTE:** Ejecuta estos comandos ANTES de continuar con la implementación.
