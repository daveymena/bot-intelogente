# Fix: Foto del Producto No Se Envía

## 🐛 Problema

Cuando se busca "curso de piano", el bot muestra la información pero:
- ❌ NO envía la foto automáticamente
- ❌ Dice "Te envié una foto" pero no la envía
- ❌ Muestra 3 productos en lugar de 1

## 🔍 Causa Raíz

El SearchAgent está devolviendo **3 productos** en lugar de **1 solo producto**. Cuando devuelve múltiples productos, usa `showProductList()` que NO envía fotos. Solo cuando devuelve 1 producto, delega al ProductAgent que SÍ envía fotos.

## ✅ Solución Aplicada

### 1. Mejorada Lógica de Filtrado (Ya aplicado)

En `src/agents/search-agent.ts`:
- Si score >= 20 y todas las keywords coinciden → **1 solo producto**
- Si hay diferencia de score >= 10 → **1 solo producto**
- Agregados logs para debugging

### 2. Logs Mejorados (Ya aplicado)

```typescript
✅ 1 producto encontrado - Delegando a ProductAgent (CON FOTO)
📋 3 productos encontrados - Mostrando lista (SIN FOTOS)
```

## 🧪 Cómo Verificar

### 1. Reiniciar el servidor

```bash
npm run dev
```

### 2. Buscar en los logs

Cuando envíes "curso de piano", deberías ver:

```
[SearchAgent] 🔑 Keywords extraídas: curso, piano
[SearchAgent] 📦 Encontrados X productos candidatos
[SearchAgent] 🎯 Top 5 productos con score:
   1. Curso Completo de Piano Online (score: 20, matched: 2/2)
   2. Mega Pack 24 (score: 10, matched: 1/2)
   ...
✅ Match perfecto encontrado: Curso Completo de Piano Online (score: 20)
[SearchAgent] 📦 Encontrados 1 productos (Tipo: specific)
✅ 1 producto encontrado - Delegando a ProductAgent (CON FOTO)
[ProductAgent] 📸 Decisión de foto: ENVIAR - Primera vez mostrando producto
```

### 3. Resultado Esperado en WhatsApp

```
[FOTO DEL CURSO DE PIANO]

📦 Curso Completo de Piano Online

🎵 Curso de Piano Completo: Desde Cero hasta Nivel Avanzado 🎹

✅ +80 lecciones en video HD
✅ 157 recursos descargables
...

💰 Precio: 60.000 COP

¿Te interesa este curso?
```

## 🔧 Si Sigue Sin Funcionar

### Verificar 1: ¿Cuántos productos devuelve?

Busca en los logs:
```
[SearchAgent] 📦 Encontrados X productos (Tipo: specific)
```

- Si X = 1 → ✅ Correcto, debería enviar foto
- Si X > 1 → ❌ Problema: No está filtrando correctamente

### Verificar 2: ¿Qué score tienen?

Busca:
```
[SearchAgent] 🎯 Top 5 productos con score:
   1. Curso Completo de Piano Online (score: ??, matched: ?/?)
```

- Si score >= 20 y matched = 2/2 → ✅ Debería devolver solo ese
- Si score < 20 → ❌ Problema: Keywords no coinciden bien

### Verificar 3: ¿Se delega a ProductAgent?

Busca:
```
✅ 1 producto encontrado - Delegando a ProductAgent (CON FOTO)
```

- Si aparece → ✅ Correcto
- Si aparece "📋 3 productos encontrados" → ❌ No está filtrando

## 🎯 Solución Alternativa

Si el problema persiste, podemos hacer que `showProductList()` también envíe la foto del primer producto:

```typescript
private showProductList(products: Product[]): AgentResponse {
  const firstProduct = products[0];
  
  // Si solo hay 1 producto, enviar con foto
  if (products.length === 1 && firstProduct.images?.length) {
    return {
      text: this.formatProductDescription(firstProduct),
      sendPhotos: true,
      photos: firstProduct.images,
      confidence: 0.9
    };
  }
  
  // Múltiples productos, sin fotos
  let text = `¡Hola! Tengo varias opciones disponibles! 💻\n\n`;
  // ...
}
```

## 📝 Checklist de Debugging

- [ ] Servidor reiniciado
- [ ] Logs revisados
- [ ] Keywords extraídas correctamente: `curso, piano`
- [ ] Score del curso de piano >= 20
- [ ] Matched keywords: 2/2
- [ ] Devuelve 1 solo producto
- [ ] Se delega a ProductAgent
- [ ] ProductAgent decide enviar foto
- [ ] Foto se envía en WhatsApp

## 🚀 Próximo Paso

1. **Reiniciar servidor**: `npm run dev`
2. **Enviar**: "curso de piano"
3. **Revisar logs**: Buscar los mensajes clave
4. **Verificar WhatsApp**: Debe llegar la foto

---

**Última actualización**: 22 de Noviembre de 2025
