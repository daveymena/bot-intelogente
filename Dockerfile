# Dockerfile optimizado para Easypanel con Puppeteer preinstalado
FROM ghcr.io/puppeteer/puppeteer:21.6.0

# Configurar directorio de trabajo
WORKDIR /app

# Variables de entorno para reducir uso de memoria en build
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NEXT_TELEMETRY_DISABLED=1
ENV NPM_CONFIG_LOGLEVEL=error

# Variables de entorno DUMMY para el build (se sobreescriben en runtime)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV NEXTAUTH_SECRET="build-secret-placeholder"
ENV NEXTAUTH_URL="http://localhost:3000"
ENV JWT_SECRET="build-jwt-secret-placeholder"

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar TODAS las dependencias (necesarias para build)
RUN npm install --legacy-peer-deps --no-audit

# Copiar el resto del código
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Build de Next.js
RUN npm run build

# Verificar que el build se completó
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

# Comando de inicio
CMD ["sh", "-c", "npx prisma db push --accept-data-loss || true && npm start"]
