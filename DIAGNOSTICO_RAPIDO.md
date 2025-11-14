# 🔍 Diagnóstico Rápido: "Dos Opciones" de Cursos

## 🎯 El Problema

Bot dice: "Tengo dos opciones de cursos de piano"  
Realidad: Solo hay uno (o está duplicado en la BD)

## ⚡ Solución Rápida

```bash
# 1. Verificar si hay duplicados
verificar-duplicados.bat

# 2. Si hay duplicados, eliminarlos:
npx prisma studio
# → Ir a tabla "Product"
# → Buscar "piano"
# → Eliminar duplicados

# 3. Reiniciar servidor
npm run dev

# 4. Probar
# "Estoy interesado en el curso de piano"
```

## 📊 Posibles Causas

### Causa 1: Productos Duplicados en BD ⚠️
- Mismo curso registrado 2+ veces
- Mismo nombre, diferentes IDs

### Causa 2: IA Inventa Opciones ❌
- Dice "dos opciones" aunque solo encuentra una
- **Solución:** Ya mejoré el prompt para evitar esto

### Causa 3: Búsqueda Encuentra Múltiples ✅
- Hay realmente 2 cursos diferentes de piano
- **Esto es correcto**

## 🔎 Verificar Ahora

```bash
verificar-duplicados.bat
```

Esto te dirá:
- ✅ Cuántos productos hay
- ✅ Si hay duplicados
- ✅ Cuántos cursos de piano existen

## ✅ Mejoras Aplicadas

He actualizado el sistema para que:

1. ✅ Cuente productos encontrados
2. ✅ Advierta a la IA: "Solo hay 1 producto, NO digas 'dos opciones'"
3. ✅ Muestre información más detallada

## 📝 Logs para Verificar

Busca en los logs:

```
[IntelligentBot] 📊 Contexto: {
  producto: 'Curso Completo de Piano Online',
  ...
}
```

Si aparece el mismo producto 2 veces → Hay duplicados

## 🚀 Próximo Paso

**Ejecuta:** `verificar-duplicados.bat`

Eso te dirá exactamente qué está pasando.

---

**Lee `SOLUCION_PRODUCTOS_DUPLICADOS.md` para más detalles.**
