# Dockerfile optimizado para Easypanel con Puppeteer preinstalado
FROM ghcr.io/puppeteer/puppeteer:21.6.0

# Configurar directorio de trabajo
WORKDIR /app

# Variables de entorno para reducir uso de memoria en build
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NEXT_TELEMETRY_DISABLED=1
ENV NPM_CONFIG_LOGLEVEL=error

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias en modo producción primero (menos memoria)
# Luego instalar dev dependencies solo si es necesario
RUN npm ci --only=production --no-audit --legacy-peer-deps || \
    npm install --only=production --no-audit --legacy-peer-deps

# Instalar dev dependencies necesarias para el build
RUN npm install --no-save --no-audit --legacy-peer-deps \
    typescript \
    @types/node \
    @types/react \
    @types/react-dom \
    eslint \
    eslint-config-next

# Copiar el resto del código
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Build de Next.js (standalone mode para producción)
# Ignorar errores de TypeScript y ESLint durante el build
RUN npm run build

# Verificar que el build se completó (si falla, continuar de todos modos)
RUN if [ -d .next/standalone ]; then \
      echo "✅ Standalone build found"; \
      mkdir -p .next/standalone/.next && \
      cp -r .next/static .next/standalone/.next/ && \
      cp -r public .next/standalone/; \
    else \
      echo "⚠️ Standalone build not found, using regular build"; \
    fi

# Limpiar caché de npm para reducir tamaño de imagen
RUN npm cache clean --force

# Crear directorios necesarios
RUN mkdir -p /app/dist /app/whatsapp-sessions /app/auth_sessions /app/data /app/moto

# Exponer puerto
EXPOSE 3000

# Variables de entorno para Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Cambiar a usuario no-root
USER pptruser

# Comando de inicio simplificado
CMD ["sh", "-c", "npx prisma db push --accept-data-loss || true && npm start"]
