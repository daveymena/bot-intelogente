# 🚨 ACCIÓN INMEDIATA: Corregir Búsqueda Específica

## ❌ PROBLEMA

Usuario pregunta: **"Estoy interesado en el curso de piano"**

Bot responde con productos **INCORRECTOS**:
- Mega Pack 21: Pack Sublimado ❌
- Mega Pack 13: Ingeniería ❌
- Mega Pack 36: Pedagogía ❌

**NINGUNO ES EL CURSO DE PIANO**

## ✅ SOLUCIÓN RÁPIDA

### 1. Importar Productos (SI LA BD ESTÁ VACÍA)

```bash
IMPORTAR_PRODUCTOS_AHORA.bat
```

O manualmente:
```bash
node agregar-megapacks-completo-fixed.js
```

### 2. Verificar Corrección en el Código

El código YA ESTÁ CORREGIDO en `product-intelligence-service.ts`:

```typescript
// Línea ~350: Cuando encuentra producto de alta prioridad
if (found && match.priority >= 95) {
    console.log(`✅ [ESPECÍFICO] ${found.name}`)
    // RETORNA INMEDIATAMENTE - NO SIGUE BUSCANDO
    return found
}
```

### 3. Reiniciar Servidor

```bash
# Cerrar puertos
CERRAR_PUERTOS_AHORA.bat

# Iniciar sistema
INICIAR_TODO.bat
```

## 🧪 PROBAR

```bash
# Test de búsqueda
node test-busqueda-curso-piano-urgente.js
```

O probar directamente en WhatsApp:
1. "curso de piano" → Debe mostrar SOLO el curso de piano
2. "laptop asus" → Debe mostrar SOLO laptops Asus
3. "qué cursos tienes" → Debe mostrar LISTA de cursos

## 📋 CHECKLIST

- [ ] Importar productos a la BD
- [ ] Verificar que hay productos con `node ver-todos-productos-ahora.js`
- [ ] Reiniciar servidor
- [ ] Probar búsqueda específica
- [ ] Verificar que muestra UN SOLO producto correcto

## 🎯 RESULTADO ESPERADO

```
Usuario: "Estoy interesado en el curso de piano"

Bot: 🎹 Curso Completo de Piano
💰 15.000 COP
📝 Aprende piano desde cero

¿Te gustaría comprarlo?
```

**UN PRODUCTO - EL CORRECTO** ✅
