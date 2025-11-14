# 🔧 SOLUCIÓN ERROR BUILD EASYPANEL

## Problema
El build en Easypanel falla con exit code 1.

## Causas Posibles

### 1. Archivo SQLite en el repositorio
El archivo `prisma/dev.db` puede estar causando conflictos.

### 2. Dockerfile necesita optimización
El Dockerfile puede tener problemas con Prisma o dependencias.

## SOLUCIÓN INMEDIATA

### Paso 1: Verificar que no hay SQLite en Git
```bash
git ls-files | grep "\.db"
```

Si aparece algún archivo .db, eliminarlo:
```bash
git rm --cached prisma/dev.db
git rm --cached dev.db
git commit -m "chore: Eliminar archivos SQLite del repositorio"
git push origin main
```

### Paso 2: Verificar Dockerfile
El Dockerfile debe:
- Usar PostgreSQL (no SQLite)
- Generar Prisma Client correctamente
- No copiar archivos .db

### Paso 3: Verificar prisma/schema.prisma
Debe tener:
```prisma
datasource db {
  provider = "postgresql"  // NO "sqlite"
  url      = env("DATABASE_URL")
}
```

### Paso 4: En Easypanel Terminal
Después del deploy, ejecutar:
```bash
npx prisma generate
npx prisma db push
```

## VERIFICACIÓN

1. El schema.prisma debe usar `provider = "postgresql"`
2. No debe haber archivos .db en el repositorio
3. DATABASE_URL debe apuntar a PostgreSQL
4. El .gitignore debe incluir `*.db`

## Si el error persiste

Necesitamos ver el log completo del error en Easypanel para diagnosticar el problema específico.

Revisa los logs en:
- Easypanel → Tu proyecto → Logs
- Busca líneas que digan "ERROR" o "FAILED"
