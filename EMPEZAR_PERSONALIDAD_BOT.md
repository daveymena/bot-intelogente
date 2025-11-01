# 🚀 Inicio Rápido - Generador de Personalidad del Bot

## ⚡ 3 Pasos para Empezar

### 1️⃣ Aplicar Cambios a la Base de Datos

```bash
npm run db:push
```

Esto agrega el campo necesario para guardar personalidades personalizadas.

### 2️⃣ Acceder al Generador

1. Inicia tu servidor: `npm run dev`
2. Accede al dashboard: http://localhost:3000
3. Inicia sesión
4. Haz clic en **"Personalidad Bot"** en el menú lateral

### 3️⃣ Crear tu Primera Personalidad

**Opción A - Rápida (30 segundos):**
- Elige una de las 6 plantillas predefinidas
- Haz clic en "Usar Este"
- ¡Listo!

**Opción B - Personalizada (2 minutos):**
1. Ve a "Generar con IA"
2. Describe tu bot ideal
3. Haz clic en "Generar"
4. Revisa y edita si quieres
5. Guarda

---

## 🎯 Ejemplos de Descripciones

### Para Tienda de Tecnología
```
Bot para tienda de laptops y componentes. Debe ser técnico
pero accesible, ayudar según necesidades (gaming, trabajo,
estudio). Tono profesional pero amigable.
```

### Para Cursos Online
```
Bot para cursos de desarrollo personal. Motivador e inspirador,
enfocado en transformación. Usa storytelling. Tono energético
y positivo.
```

### Para Servicios Premium
```
Bot para consultoría premium. Clientes empresarios de alto nivel.
Sofisticado, discreto, enfocado en ROI. Lenguaje elegante.
```

---

## 📋 Plantillas Disponibles

1. **💼 Vendedor Profesional** - Cierra ventas con técnicas persuasivas
2. **🔧 Soporte Técnico** - Resuelve problemas paso a paso
3. **🎯 Asesor Consultivo** - Guía hacia la mejor decisión
4. **😊 Amigo Cercano** - Conversación casual y natural
5. **👔 Experto Premium** - Para clientes exigentes
6. **📚 Educador Digital** - Especialista en cursos

---

## ✅ Verificar que Funciona

1. Guarda una personalidad
2. Ve a WhatsApp
3. Envía un mensaje de prueba
4. El bot responderá con la nueva personalidad

---

## 🔧 Probar el Generador de IA

```bash
npx tsx scripts/test-personality-generator.ts
```

Esto genera 3 personalidades de ejemplo para que veas cómo funciona.

---

## 📚 Documentación Completa

- **Guía de Uso**: `GENERADOR_PERSONALIDAD_IMPLEMENTADO.md`
- **Documentación Técnica**: `GENERADOR_PERSONALIDAD_BOT.md`

---

## 💡 Tips Rápidos

- Sé específico en tu descripción
- Incluye el tipo de productos que vendes
- Menciona el tono deseado (profesional, casual, técnico)
- Prueba diferentes personalidades y compara resultados
- Edita manualmente para ajustes finos

---

## 🎉 ¡Listo!

Tu generador de personalidad está implementado y funcionando.

**Siguiente paso:** Ejecuta `npm run db:push` y empieza a personalizar.
