# 🔧 Agregar Relaciones Manualmente - Instrucciones Exactas

## Paso 1: Editar el Modelo User

Abre `prisma/schema.prisma` en VS Code y busca esta línea:

```prisma
  salesFlowConfig       SalesFlowConfig?
  
  @@map("users")
}
```

Cámbiala por:

```prisma
  salesFlowConfig       SalesFlowConfig?
  notificationTokens    NotificationToken[]
  
  @@map("users")
}
```

## Paso 2: Editar el Modelo Payment

Busca esta línea en el mismo archivo:

```prisma
  user              User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("payments")
}
```

Cámbiala por:

```prisma
  user              User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  notificationTokens NotificationToken[]
  
  @@map("payments")
}
```

## Paso 3: Guardar y Ejecutar Comandos

Guarda el archivo y ejecuta:

```bash
npx prisma generate
npx prisma db push
npx tsx scripts/test-notification-system.ts
```

## Resumen de Cambios

Solo agregas **1 línea** en cada modelo:

**En User:** `notificationTokens    NotificationToken[]`
**En Payment:** `notificationTokens NotificationToken[]`

¡Eso es todo! 🚀
