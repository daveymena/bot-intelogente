# Migración de la Plataforma Bot-Inteligente

Este proyecto ha sido migrado a una arquitectura modular y multi-agente, tal como fue solicitado.

## Estructura
- `src/app.js`: Punto de entrada principal.
- `src/config`: Configuración de entorno y proveedores de IA.
- `src/core`: Lógica central (Router, Clasificador de Intenciones, Selector de Agentes).
- `src/agents`: Lógica de agentes específicos (Ventas, Soporte, Técnico, Admin).
- `src/services`: Lógica de negocio (IA, Productos, Clientes, Métricas, Memoria).
- `src/integrations`: Integraciones externas (WhatsApp/Baileys, Groq, OpenClaw).
- `src/database`: Conexión a base de datos y esquema.
- `src/prompts`: Plantillas de prompts para la IA.
- `src/utils`: Utilidades (Logger, Sanitizador).

## Prerrequisitos
- Node.js 20 LTS
- PostgreSQL 15+
- Docker Desktop

## Configuración
1. **Instalar Dependencias**: `npm install`

2. **Variables de Entorno**: El archivo `.env` ha sido actualizado para apuntar a la base de datos PostgreSQL de EasyPanel (`157.173.97.41`).
3. **Base de Datos**:
   - El sistema está configurado para usar la base de datos existente en EasyPanel.
   - **Importante**: Asegúrate de que tu IP esté permitida si te conectas localmente, o ejecuta el bot desde dentro de la red de EasyPanel.
   - Usa `node scripts/test-db-connection.js` para verificar la conectividad.
   - Verifica si la base de datos existente tiene las tablas requeridas (`tenants`, `clients`, `conversations`). Si no, es posible que necesites aplicar `src/database/schema.sql`.

## Ejecutando el Bot
- **Desarrollo**: `npm run bot:dev` (Usa la BD de EasyPanel)
- **Producción**: `npm run bot:start`
- **Docker**: `docker-compose up --build` (Actualizado para usar la BD de EasyPanel, contenedor local de Postgres deshabilitado)


## Características
- **Multi-Agente**: Enruta automáticamente basado en la intención (Ventas, Soporte, etc.).
- **Memoria Estructurada**: Guarda el historial de conversaciones y contexto del cliente.
- **Integración de IA**: Soporta Groq y OpenClaw (configurable en `.env`).
- **Protección de Datos**: Sanitización y consultas parametrizadas.
- **Métricas**: Seguimiento básico de métricas vía `metricsService`.

## Notas
- Para cambiar el proveedor de IA, cambia `AI_PROVIDER` en `.env` a `openclaw` o `groq`.
- Asegúrate de que la carpeta `auth_info_baileys` sea persistente para la sesión de WhatsApp.

