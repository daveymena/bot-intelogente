/**
 * Este script reduce el prompt del sistema para evitar exceder el límite de tokens de Groq
 * 
 * INSTRUCCIONES:
 * 1. Hacer backup del archivo actual
 * 2. Reemplazar la función buildSystemPrompt con una versión compacta
 * 3. Reducir de ~5000 tokens a ~200 tokens
 */

console.log(`
⚠️  REDUCCIÓN DE PROMPT DEL SISTEMA ⚠️

El prompt actual excede el límite de tokens de Groq (6000 tokens).

SOLUCIÓN:
Reemplazar manualmente la función buildSystemPrompt en src/lib/ai-service.ts
con esta versión compacta:

\`\`\`typescript
private static buildSystemPrompt(businessContext: string, products: any[]): string {
  // Solo mostrar resumen de productos
  const productsInfo = products.length > 0
    ? \`Productos: \${products.slice(0, 3).map(p => p.name).join(', ')}\${products.length > 3 ? \` y \${products.length - 3} más\` : ''}\`
    : 'Sin productos'

  return \`Eres asistente de ventas de Tecnovariedades D&S.

\${businessContext}
\${productsInfo}

REGLAS:
1. Responde sobre productos del catálogo
2. Lee mensajes anteriores para contexto
3. Productos digitales: tienen links
4. Productos físicos: contacto +57 304 274 8687
5. Máximo 5 líneas
6. Si no tienes producto, di "No tengo ese producto"
7. Si preguntan precio/link sin contexto, pregunta "¿De cuál producto?"\`
}
\`\`\`

PASOS:
1. Abrir src/lib/ai-service.ts
2. Buscar "private static buildSystemPrompt"
3. Reemplazar toda la función (líneas 402-930) con la versión compacta arriba
4. Guardar y reiniciar el servidor
`)
