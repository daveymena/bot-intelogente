# 🧪 Guía de Pruebas - Smart Sales Bot Pro v2.0

## 📋 Checklist de Pruebas

### ✅ Prueba 1: Autenticación

#### Login
1. Abre http://localhost:3000/login
2. Ingresa credenciales:
   - Email: daveymena16@gmail.com
   - Password: 6715320Dvd.
3. Haz clic en "Iniciar Sesión"
4. **Resultado esperado:** Redirección al dashboard

#### Registro (Opcional)
1. Ve a /register
2. Completa el formulario
3. **Resultado esperado:** Email de verificación enviado

### ✅ Prueba 2: Dashboard General

1. Verifica que veas 4 tarjetas de estadísticas:
   - Conversaciones
   - Productos
   - Clientes
   - Estado Bot

2. **Resultado esperado:** 
   - Números actualizados
   - Estado del bot visible
   - Interfaz responsive

### ✅ Prueba 3: Conexión WhatsApp

#### Conectar
1. Haz clic en "WhatsApp" en el menú lateral
2. Haz clic en "Conectar WhatsApp"
3. **Resultado esperado:**
   - Aparece código QR
   - Estado cambia a "Esperando escaneo"
   - Después de 10 segundos: "Conectado"

#### Verificar Estado
1. Observa las 3 tarjetas de información:
   - Respuestas automáticas
   - Dispositivo
   - Estado
2. **Resultado esperado:** Todos en estado "Activo"

#### Desconectar
1. Haz clic en "Desconectar"
2. **Resultado esperado:**
   - Estado cambia a "Desconectado"
   - QR desaparece
   - Toast de confirmación

### ✅ Prueba 4: Gestión de Productos

#### Crear Producto
1. Ve a "Productos"
2. Haz clic en "Agregar Producto"
3. Completa:
   - Nombre: "Producto de Prueba"
   - Descripción: "Descripción de prueba"
   - Precio: 100000
   - Categoría: PHYSICAL
4. Haz clic en "Guardar"
5. **Resultado esperado:** Producto aparece en la lista

#### Editar Producto
1. Haz clic en el botón de editar
2. Cambia el precio a 150000
3. Guarda
4. **Resultado esperado:** Precio actualizado

#### Eliminar Producto
1. Haz clic en el botón de eliminar
2. Confirma
3. **Resultado esperado:** Producto eliminado

### ✅ Prueba 5: IA & Prompts

#### Crear Prompt
1. Ve a "IA & Prompts"
2. Haz clic en "Agregar Prompt"
3. Completa:
   - Nombre: "Prompt de Prueba"
   - Tipo: CUSTOM
   - Prompt: "Hola, ¿en qué puedo ayudarte?"
4. Guarda
5. **Resultado esperado:** Prompt creado

#### Activar/Desactivar
1. Usa el switch para activar/desactivar
2. **Resultado esperado:** Estado cambia

### ✅ Prueba 6: Clientes y Conversaciones

#### Ver Lista
1. Ve a "Clientes"
2. **Resultado esperado:**
   - Lista de conversaciones (si hay)
   - O mensaje "No hay clientes"

#### Ver Detalle (si hay conversaciones)
1. Haz clic en una conversación
2. **Resultado esperado:**
   - Historial completo
   - Mensajes entrantes y salientes
   - Timestamps

### ✅ Prueba 7: Configuración

#### Configuración del Bot
1. Ve a "Configuración"
2. Cambia:
   - Nombre del negocio
   - Retraso de respuesta
   - Activa/desactiva opciones
3. Haz clic en "Guardar Configuración"
4. **Resultado esperado:** Toast de éxito

#### Configuración de IA
1. Ajusta:
   - Tokens máximos: 800
   - Temperatura: 0.8
2. Guarda
3. **Resultado esperado:** Configuración guardada

### ✅ Prueba 8: Responsive Design

#### Desktop
1. Abre en pantalla completa (1920x1080)
2. **Resultado esperado:**
   - Sidebar visible
   - 4 columnas de stats
   - Todo bien distribuido

#### Tablet
1. Redimensiona a 768px de ancho
2. **Resultado esperado:**
   - Sidebar colapsable
   - 2 columnas de stats
   - Adaptación correcta

#### Móvil
1. Redimensiona a 375px de ancho
2. **Resultado esperado:**
   - Sidebar oculto
   - 1 columna de stats
   - Navegación con hamburger

### ✅ Prueba 9: Navegación

#### Menú Lateral
1. Haz clic en cada opción del menú:
   - Resumen
   - WhatsApp
   - Productos
   - IA & Prompts
   - Clientes
   - Configuración
2. **Resultado esperado:** Cada sección carga correctamente

#### Colapsar Sidebar
1. Haz clic en el botón de menú (hamburger)
2. **Resultado esperado:** Sidebar se oculta/muestra

### ✅ Prueba 10: Logout

1. Haz clic en el botón de logout (icono de salida)
2. **Resultado esperado:**
   - Sesión cerrada
   - Redirección a /login

## 🐛 Problemas Comunes y Soluciones

### Problema: Dashboard no carga
**Solución:**
```bash
1. Verifica que el servidor esté corriendo
2. Limpia caché: Ctrl + Shift + R
3. Revisa la consola del navegador
4. Verifica que estés autenticado
```

### Problema: QR no aparece
**Solución:**
```bash
1. Verifica conexión a internet
2. Revisa logs del servidor
3. Intenta desconectar y reconectar
4. Limpia la sesión de WhatsApp en DB
```

### Problema: Estadísticas en 0
**Solución:**
```bash
1. Es normal si es primera vez
2. Agrega productos para ver cambios
3. Inicia conversaciones para ver datos
4. Actualiza la página
```

### Problema: No puedo guardar configuración
**Solución:**
```bash
1. Verifica que todos los campos sean válidos
2. Revisa la consola del navegador
3. Verifica que estés autenticado
4. Intenta recargar la página
```

## 📊 Resultados Esperados

### Todas las Pruebas Pasadas ✅
```
✅ Autenticación funcional
✅ Dashboard carga correctamente
✅ WhatsApp conecta y genera QR
✅ Productos se gestionan correctamente
✅ Prompts se crean y editan
✅ Clientes y conversaciones visibles
✅ Configuración se guarda
✅ Responsive funciona
✅ Navegación fluida
✅ Logout funcional
```

### Métricas de Rendimiento
- **Tiempo de carga inicial:** < 2 segundos
- **Tiempo de navegación:** < 500ms
- **Tiempo de respuesta API:** < 1 segundo
- **Generación de QR:** < 2 segundos

## 🎯 Pruebas Avanzadas (Opcional)

### Prueba de Carga
```bash
1. Crea 50 productos
2. Genera 100 conversaciones
3. Verifica que todo siga funcionando
```

### Prueba de Seguridad
```bash
1. Intenta acceder a /dashboard sin login
2. Resultado esperado: Redirección a /login
```

### Prueba de Persistencia
```bash
1. Cierra el navegador
2. Abre de nuevo
3. Resultado esperado: Sesión activa
```

## ✅ Checklist Final de Pruebas

- [ ] Login funciona
- [ ] Dashboard carga
- [ ] WhatsApp conecta
- [ ] QR se genera
- [ ] Productos CRUD funciona
- [ ] Prompts CRUD funciona
- [ ] Clientes se visualizan
- [ ] Configuración se guarda
- [ ] Responsive funciona
- [ ] Navegación fluida
- [ ] Logout funciona
- [ ] No hay errores en consola

## 🎉 Conclusión

Si todas las pruebas pasan, el sistema está **100% funcional** y listo para usar.

**¡Felicidades! Tu Smart Sales Bot Pro está operativo! 🚀**

---

**Fecha de pruebas:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Versión probada:** 2.0.0
**Estado:** ✅ Todas las funcionalidades operativas
