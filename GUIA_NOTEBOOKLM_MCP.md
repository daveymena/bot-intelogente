# 📚 Guía: Integración NotebookLM con OpenClaw

## 🎯 ¿Qué es NotebookLM MCP?

NotebookLM MCP es un servidor que conecta tu bot de WhatsApp con Google NotebookLM, permitiendo:

- **Respuestas con cero alucinaciones** - Basadas en tus documentos reales
- **Citaciones automáticas** - Cada respuesta incluye fuentes
- **Gestión de conocimiento** - Organiza documentación del negocio
- **Generación de contenido** - Audio, video, infografías, reportes

## 🚀 Instalación

### Paso 1: Configuración MCP

El archivo `.kiro/settings/mcp.json` ya está configurado con:

```json
{
  "mcpServers": {
    "notebooklm": {
      "command": "npx",
      "args": ["-y", "@roomi-fields/notebooklm-mcp@latest"],
      "env": {
        "NODE_ENV": "production"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Paso 2: Autenticación con Google

1. Abre Kiro y busca en el panel de comandos: **"MCP: Reconnect Server"**
2. Selecciona **"notebooklm"**
3. Se abrirá Chrome automáticamente
4. Inicia sesión con tu cuenta de Google
5. ¡Listo! La sesión se guarda automáticamente

## 🛠️ Herramientas Disponibles

NotebookLM MCP proporciona estas herramientas que OpenClaw puede usar:

### 1. **Preguntas y Respuestas** 📖
```typescript
// OpenClaw puede llamar:
notebooklm_ask({
  question: "¿Cuáles son las políticas de envío?",
  notebook_id: "tecnovariedades-docs",
  citation_format: "inline"
})
```

**Formatos de citación:**
- `none` - Sin citaciones
- `inline` - Citaciones en el texto
- `footnotes` - Notas al pie
- `json` - Formato estructurado
- `expanded` - Citaciones expandidas

### 2. **Gestión de Fuentes** 📄
```typescript
// Agregar documentos
notebooklm_add_source({
  notebook_id: "tecnovariedades-docs",
  type: "file", // file, url, text, youtube, drive
  content: "path/to/document.pdf"
})

// Listar fuentes
notebooklm_list_sources({
  notebook_id: "tecnovariedades-docs"
})
```

### 3. **Generación de Contenido** 🎨

#### Audio (Podcast)
```typescript
notebooklm_generate_audio({
  notebook_id: "tecnovariedades-docs",
  language: "es",
  custom_instructions: "Enfócate en productos digitales"
})
```

#### Video
```typescript
notebooklm_generate_video({
  notebook_id: "tecnovariedades-docs",
  format: "explainer", // brief, explainer
  visual_style: "corporate", // classroom, documentary, animated, corporate, cinematic, minimalist
  language: "es"
})
```

#### Infografía
```typescript
notebooklm_generate_infographic({
  notebook_id: "tecnovariedades-docs",
  format: "vertical", // horizontal, vertical
  language: "es"
})
```

#### Reporte
```typescript
notebooklm_generate_report({
  notebook_id: "tecnovariedades-docs",
  format: "detailed", // summary, detailed
  language: "es"
})
```

### 4. **Gestión de Notebooks** 📚
```typescript
// Listar todos los notebooks
notebooklm_list_notebooks()

// Buscar notebooks
notebooklm_search_notebooks({
  keyword: "productos"
})

// Crear notebook
notebooklm_create_notebook({
  name: "Documentación Tecnovariedades",
  description: "Toda la info del negocio"
})
```

## 🎯 Casos de Uso con OpenClaw

### Caso 1: Respuestas Basadas en Documentación

**Usuario:** "¿Cuáles son los métodos de pago?"

**OpenClaw decide:**
1. Detecta que es una pregunta sobre políticas del negocio
2. Llama a `notebooklm_ask` con el notebook de documentación
3. Obtiene respuesta con citaciones
4. Formatea la respuesta para WhatsApp

### Caso 2: Información de Productos

**Usuario:** "¿El Mega Pack 11 incluye certificado?"

**OpenClaw decide:**
1. Identifica que es pregunta sobre producto específico
2. Llama a `notebooklm_ask` con notebook de productos
3. Obtiene respuesta precisa con fuentes
4. Responde al cliente con confianza

### Caso 3: Generación de Contenido

**Usuario (Admin):** "Genera un audio explicando nuestros productos digitales"

**OpenClaw decide:**
1. Detecta solicitud de generación de contenido
2. Llama a `notebooklm_generate_audio`
3. Descarga el audio generado
4. Lo envía por WhatsApp

## 📝 Configuración Recomendada

### Crear Notebooks por Categoría

1. **tecnovariedades-productos** - Catálogo completo de productos
2. **tecnovariedades-politicas** - Políticas de envío, pago, devoluciones
3. **tecnovariedades-faq** - Preguntas frecuentes
4. **tecnovariedades-guias** - Guías de uso y tutoriales

### Agregar Documentos

Sube a cada notebook:
- PDFs de catálogos
- Documentos de políticas
- URLs de tu sitio web
- Videos de YouTube explicativos
- Archivos de Google Drive

## 🔧 Integración con OpenClaw

OpenClaw ya tiene acceso a NotebookLM como herramienta. Simplemente:

1. **Pregúntale a OpenClaw:** "Consulta en NotebookLM sobre [tema]"
2. **OpenClaw decide automáticamente** cuándo usar NotebookLM
3. **Respuestas precisas** sin alucinaciones

### Ejemplo de Conversación

```
Cliente: "¿Los cursos digitales tienen certificado?"

OpenClaw (internamente):
- Detecta pregunta sobre productos digitales
- Llama: notebooklm_ask({
    question: "¿Los cursos digitales incluyen certificado?",
    notebook_id: "tecnovariedades-productos"
  })
- Recibe: "No, los cursos digitales son 100% pregrabados y no incluyen certificado"
- Responde al cliente con esta información precisa
```

## ⚡ Ventajas

1. **Cero Alucinaciones** - Solo responde con info real de tus documentos
2. **Siempre Actualizado** - Actualiza los notebooks y OpenClaw usa la info nueva
3. **Citaciones** - Cada respuesta incluye de dónde viene la información
4. **Multimodal** - Genera audio, video, infografías automáticamente
5. **Escalable** - Agrega más documentos sin cambiar código

## 🚨 Notas Importantes

1. **Cuenta Dedicada** - Usa una cuenta de Google dedicada para automatización
2. **Límites de Google** - NotebookLM tiene límites de uso, monitorea el consumo
3. **Sesión Persistente** - La autenticación se guarda, no necesitas login cada vez
4. **Revisión Humana** - Siempre revisa respuestas críticas antes de enviar

## 📊 Monitoreo

OpenClaw registra cada llamada a NotebookLM:
- Pregunta realizada
- Notebook consultado
- Tiempo de respuesta
- Citaciones incluidas

Revisa los logs en la consola para ver cómo OpenClaw usa NotebookLM.

## 🔄 Actualización

Para actualizar NotebookLM MCP:

```bash
# El servidor se actualiza automáticamente con npx
# Pero puedes forzar actualización:
npx -y @roomi-fields/notebooklm-mcp@latest --version
```

## 🆘 Solución de Problemas

### Error: "No se puede conectar a NotebookLM"
- Verifica que Chrome esté instalado
- Reconecta el servidor MCP
- Vuelve a autenticarte con Google

### Error: "Notebook no encontrado"
- Lista los notebooks disponibles: `notebooklm_list_notebooks()`
- Verifica el ID del notebook
- Crea el notebook si no existe

### Respuestas lentas
- NotebookLM puede tardar 5-10 segundos
- OpenClaw esperará automáticamente
- Considera usar notebooks más pequeños

## 📚 Recursos

- [Repositorio GitHub](https://github.com/roomi-fields/notebooklm-mcp)
- [Documentación MCP](https://modelcontextprotocol.io/)
- [NotebookLM de Google](https://notebooklm.google.com/)

---

**¡Ahora OpenClaw tiene acceso a todo el conocimiento de tu negocio sin alucinaciones!** 🎉
