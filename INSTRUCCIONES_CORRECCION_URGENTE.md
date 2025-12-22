# 🚨 INSTRUCCIONES: CORRECCIÓN URGENTE DE PRECIOS Y FOTOS

## ❌ PROBLEMAS ACTUALES

1. **Bot inventa precios**
   - Dice que reparación de celulares vale $40,000
   - Cuando el precio real es $20,000

2. **No envía fotos en formato CARD**
   - No envía las imágenes de los productos
   - No usa el formato profesional estructurado

## ✅ SOLUCIÓN IMPLEMENTADA

He creado 3 sistemas nuevos:

### 1. `RealDataEnforcer` (src/lib/real-data-enforcer.ts)
- **Función**: Garantiza que SIEMPRE se usen datos reales de la BD
- **Características**:
  - Consulta la BD antes de cada respuesta
  - Verifica precios automáticamente
  - Detecta y corrige precios inventados
  - Formatea precios correctamente

### 2. `CardPhotoSender` (src/lib/card-photo-sender.ts)
- **Función**: Envía productos con fotos en formato CARD profesional
- **Características**:
  - Formato estructurado con emojis
  - Precio destacado
  - Descripción clara
  - Call to action
  - Máximo 3 fotos por producto

### 3. `BaileysRealDataPatch` (src/lib/baileys-real-data-patch.ts)
- **Función**: Integra los sistemas anteriores en el flujo de Baileys
- **Características**:
  - Intercepta respuestas antes de enviar
  - Verifica y corrige precios
  - Envía fotos automáticamente
  - Fallback a texto si no hay fotos

## 🚀 CÓMO APLICAR LA CORRECCIÓN

### Opción 1: Automática (RECOMENDADA)

```bash
APLICAR_CORRECCION_URGENTE.bat
```

Este script:
1. Verifica precios reales en la BD
2. Compila los nuevos archivos TypeScript
3. Cierra el servidor actual
4. Reinicia con las correcciones aplicadas

### Opción 2: Manual

1. **Verificar precios reales**:
   ```bash
   node verificar-precios-reales.js
   ```

2. **Aplicar corrección**:
   ```bash
   node aplicar-correccion-urgente-precios-fotos.js
   ```

3. **Reiniciar servidor**:
   ```bash
   INICIAR_CON_OLLAMA_LLAMA31.bat
   ```

## 🧪 CÓMO PROBAR

### Test 1: Verificar precio correcto

**Envía**: "busco curso de reparación de celulares"

**Debe responder**:
- ✅ Precio: $20,000 COP (si es megapack individual)
- ✅ Enviar foto del producto
- ✅ Formato CARD profesional

**NO debe decir**:
- ❌ $40,000 COP
- ❌ Precio inventado

### Test 2: Verificar fotos CARD

**Envía**: "muéstrame el megapack de diseño"

**Debe hacer**:
- ✅ Enviar foto del producto
- ✅ Caption con formato CARD:
  ```
  📚 *Mega Pack 03: Diseño Gráfico*
  ━━━━━━━━━━━━━━━━━━━━
  
  💰 *PRECIO:* $20,000 COP
  
  📝 [Descripción]
  
  ✅ *INCLUYE:*
     • Acceso inmediato
     • Entrega por WhatsApp
     • Soporte incluido
  
  👉 *¿Te interesa?* Escribe "comprar"
  ━━━━━━━━━━━━━━━━━━━━
  ```

### Test 3: Verificar megapack de 40

**Envía**: "cuánto cuesta el megapack completo de 40 cursos"

**Debe responder**:
- ✅ Precio: $60,000 COP
- ✅ Enviar foto
- ✅ Formato CARD

## 📊 PRECIOS CORRECTOS (REFERENCIA)

Según la base de datos:

| Producto | Precio Real |
|----------|-------------|
| Megapacks individuales (1-39) | $20,000 COP |
| Megapack completo (40 cursos) | $60,000 COP |
| Curso de Piano | Verificar en BD |

## 🔧 INTEGRACIÓN EN EL CÓDIGO

Los nuevos sistemas se integran automáticamente en:

1. **baileys-stable-service.ts**
   - Usa `BaileysRealDataPatch` para verificar respuestas
   - Envía fotos con `CardPhotoSender`

2. **conversacionController.ts**
   - Consulta `RealDataEnforcer` antes de responder
   - Valida precios automáticamente

3. **super-sales-ai.ts**
   - Usa datos reales de `RealDataEnforcer`
   - Genera respuestas con precios correctos

## ⚠️ IMPORTANTE

### Antes de aplicar:
- [ ] Cierra el servidor actual
- [ ] Haz backup de la base de datos (opcional)
- [ ] Verifica que tengas Node.js corriendo

### Después de aplicar:
- [ ] Prueba con los 3 tests mencionados arriba
- [ ] Verifica que los precios sean correctos
- [ ] Verifica que las fotos se envíen
- [ ] Verifica el formato CARD

## 🐛 TROUBLESHOOTING

### Problema: "Producto no encontrado"
**Solución**: Verifica que el producto exista en la BD
```bash
node verificar-precios-reales.js
```

### Problema: "No se envían fotos"
**Solución**: Verifica que el producto tenga imágenes
```bash
node scripts/verificar-fotos-completo.ts
```

### Problema: "Precio sigue incorrecto"
**Solución**: 
1. Verifica que el servidor se haya reiniciado
2. Limpia caché del navegador
3. Revisa logs del servidor

## 📞 SOPORTE

Si después de aplicar la corrección sigues viendo problemas:

1. **Revisa los logs** del servidor
2. **Ejecuta**: `node aplicar-correccion-urgente-precios-fotos.js`
3. **Verifica** que los archivos nuevos existan:
   - `src/lib/real-data-enforcer.ts`
   - `src/lib/card-photo-sender.ts`
   - `src/lib/baileys-real-data-patch.ts`

## ✅ CHECKLIST DE VERIFICACIÓN

Después de aplicar la corrección:

- [ ] Servidor reiniciado
- [ ] Test 1 pasado (precio correcto)
- [ ] Test 2 pasado (fotos CARD)
- [ ] Test 3 pasado (megapack 40)
- [ ] No hay errores en logs
- [ ] Fotos se envían correctamente
- [ ] Formato CARD se ve bien

**Si todos los checks están ✅ → ¡Corrección exitosa! 🎉**

---

*Última actualización: 13 de Diciembre de 2025*
