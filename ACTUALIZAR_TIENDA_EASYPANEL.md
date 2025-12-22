# 🚀 ACTUALIZAR TIENDA EN EASYPANEL

## Opción 1: Deploy Completo (Recomendado)

```bash
npx tsx scripts/deploy-tienda-easypanel.ts
```

Esto hace:
1. ✅ Instala dependencias
2. ✅ Compila TypeScript
3. ✅ Ejecuta migraciones de BD
4. ✅ Actualiza tienda en Easypanel
5. ✅ Verifica estado

## Opción 2: Solo Actualizar Tienda

```bash
npx tsx scripts/actualizar-tienda-easypanel.ts
```

Requiere:
- `EASYPANEL_URL` en .env
- `EASYPANEL_TOKEN` en .env

## Opción 3: Manual en Easypanel

1. Ir a Easypanel
2. Ir a tu aplicación
3. Hacer redeploy
4. Esperar a que se actualice

## Verificar que se actualizó

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/tienda/status
```

Debe mostrar:
```json
{
  "success": true,
  "ultimaActualizacion": "2025-11-15T...",
  "version": "1.0.0"
}
```

## Variables de Entorno Necesarias

```env
EASYPANEL_URL=https://tu-dominio.com
EASYPANEL_TOKEN=tu_token_secreto
DATABASE_URL=postgresql://...
```

## Troubleshooting

### Error: "EASYPANEL_TOKEN no configurado"
→ Agregar `EASYPANEL_TOKEN` a `.env`

### Error: "No autorizado"
→ Verificar que el token es correcto

### Error: "No encontrado: src/app/tienda"
→ Verificar que la tienda existe en el proyecto

## Después de Actualizar

1. ✅ Verificar en Easypanel que se actualizó
2. ✅ Probar la tienda en producción
3. ✅ Verificar que los productos se muestran
4. ✅ Probar checkout
5. ✅ Verificar pagos

## Commits Relacionados

```
e267a6f - feat: agregar scripts de actualización de tienda en Easypanel
```

## Archivos Creados

- `scripts/actualizar-tienda-easypanel.ts` - Script de actualización
- `scripts/deploy-tienda-easypanel.ts` - Script de deploy completo
- `src/app/api/tienda/actualizar/route.ts` - Endpoint de actualización
- `src/app/api/tienda/status/route.ts` - Endpoint de estado
