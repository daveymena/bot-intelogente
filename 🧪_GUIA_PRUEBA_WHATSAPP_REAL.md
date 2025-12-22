# 🧪 GUÍA DE PRUEBA EN WHATSAPP REAL

## 🚀 PASO 1: INICIAR SISTEMA

### Opción A: Usar script
```bash
🚀_INICIAR_SISTEMA_AHORA.bat
```

### Opción B: Comando manual
```bash
npm run dev
```

**Esperar a ver:**
```
✓ Ready in 3.5s
Server running on http://localhost:3000
[Baileys] 🏆 Arquitectura Profesional cargada
```

---

## 📱 PASO 2: CONECTAR WHATSAPP

1. Abrir navegador: **http://localhost:3000**
2. Hacer login con tu usuario
3. Ir a sección "WhatsApp"
4. Escanear código QR con tu teléfono
5. Esperar mensaje: **"✅ WhatsApp conectado"**

---

## 🧪 PASO 3: PRUEBAS DE BÚSQUEDA

### Test 1: Megapack de Idiomas (PROBLEMA CORREGIDO)
**Enviar desde otro teléfono:**
```
Me interesa el mega pack de Idiomas
```

**Respuesta esperada:**
```
✅ Megapack de Idiomas Completo

💰 Precio: [precio real] COP

📝 Descripción:
[descripción real del producto de idiomas]

📦 Categoría: DIGITAL
⚡ Entrega: Inmediata (producto digital)

¿Quieres el link de compra? 😊
```

**❌ NO debe responder:**
```
Mega Pack 35: Álbumes digitales  ← ESTO ES INCORRECTO
```

---

### Test 2: Variaciones de Búsqueda
Probar estas variaciones para verificar que todas funcionan:

```
1. "megapack de idiomas"
2. "pack de idiomas"
3. "cursos de idiomas"
4. "quiero aprender idiomas"
5. "mega pack idiomas"
```

**Todas deben responder con el Megapack de Idiomas correcto**

---

### Test 3: Otros Megapacks
Verificar que no se confundan:

```
1. "megapack de diseño" → Debe responder con Megapack Diseño
2. "pack de álbumes" → Debe responder con Megapack Álbumes
3. "megapack de música" → Debe responder con Megapack Música
```

---

### Test 4: Productos Específicos
Verificar que productos únicos funcionen:

```
1. "curso de piano" → Curso de Piano (no megapack)
2. "laptop ASUS" → Laptop ASUS específica
3. "moto Pulsar" → Moto Bajaj Pulsar
```

---

## 📊 PASO 4: MONITOREAR LOGS

### En la consola del servidor, buscar:

```
[BOT PRO] ========================================
[BOT PRO] Cliente: +573XXXXXXXXX
[BOT PRO] Mensaje: "Me interesa el mega pack de Idiomas"
[BOT PRO] Memoria: nueva
[BOT PRO] Intención: buscar_producto
[RAG] Keywords extraídos: megapack, pack, idiomas
[RAG] ✅ Producto encontrado: Megapack de Idiomas (score: 100)
[BOT PRO] Estado: saludo → interesado
[BOT PRO] Respuesta generada
[BOT PRO] ========================================
```

### ✅ Verificar:
- Keywords incluyen "idiomas" ✅
- Score es alto (>80) ✅
- Producto correcto encontrado ✅
- No menciona "álbumes" ✅

---

## 🐛 PASO 5: TROUBLESHOOTING

### Si responde con producto incorrecto:

1. **Verificar logs de scoring:**
   ```
   [RAG] Scoring:
   - Megapack Idiomas: 100 puntos
   - Megapack Álbumes: 50 puntos
   ```

2. **Verificar keywords extraídos:**
   ```
   [RAG] Keywords extraídos: megapack, pack, idiomas
   ```
   - Si NO aparece "idiomas", hay problema en extractKeywords()

3. **Verificar producto en base de datos:**
   ```bash
   node scripts/verificar-productos-idiomas.js
   ```

---

### Si no responde:

1. **Verificar conexión WhatsApp:**
   - Dashboard debe mostrar "Conectado"
   - Logs deben mostrar "[Baileys] ✅ Mensaje recibido"

2. **Verificar errores en consola:**
   ```
   [BOT PRO] ❌ Error: ...
   ```

3. **Reiniciar servidor:**
   ```bash
   Ctrl+C
   npm run dev
   ```

---

## ✅ CHECKLIST DE PRUEBA

- [ ] Sistema iniciado correctamente
- [ ] WhatsApp conectado (QR escaneado)
- [ ] Test 1: "Me interesa el mega pack de Idiomas" → Responde con Megapack Idiomas ✅
- [ ] Test 2: Variaciones funcionan correctamente
- [ ] Test 3: Otros megapacks no se confunden
- [ ] Test 4: Productos específicos funcionan
- [ ] Logs muestran scoring correcto
- [ ] No hay errores en consola

---

## 📸 CAPTURAS RECOMENDADAS

Para documentar que funciona:

1. **Captura de conversación WhatsApp:**
   - Mensaje enviado: "Me interesa el mega pack de Idiomas"
   - Respuesta del bot con producto correcto

2. **Captura de logs:**
   - Keywords extraídos
   - Scoring de productos
   - Producto encontrado

3. **Captura de dashboard:**
   - Estado "Conectado"
   - Conversación registrada

---

## 🎯 CRITERIOS DE ÉXITO

### ✅ Prueba EXITOSA si:
1. Bot responde con Megapack de Idiomas (NO álbumes)
2. Información es real de base de datos
3. Precio y descripción correctos
4. Logs muestran score >80 para producto correcto
5. No hay errores en consola

### ❌ Prueba FALLIDA si:
1. Bot responde con Megapack Álbumes
2. Bot no responde
3. Información inventada (no de BD)
4. Errores en consola
5. Score bajo para producto correcto

---

## 📞 SOPORTE

Si algo no funciona:

1. **Revisar logs completos** en consola
2. **Verificar archivo:** `src/lib/professional-bot-architecture.ts`
3. **Ejecutar test automatizado:** `node test-megapack-idiomas.js`
4. **Verificar base de datos** tiene productos de idiomas

---

**Fecha:** 17 de diciembre de 2025
**Sistema:** Smart Sales Bot Pro
**Versión:** Arquitectura Profesional v2.0
**Corrección:** Búsqueda Megapack Idiomas
