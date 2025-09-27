# SMD VITAL Frontend - Multi-stage Dockerfile optimizado
# ========================================================

# Stage 1: Build dependencies
FROM node:18-alpine AS dependencies

# Configurar usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias con cache optimizado
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force

# Stage 2: Build application
FROM node:18-alpine AS builder

# Configurar usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Copiar dependencias del stage anterior
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./

# Copiar código fuente
COPY . .

# Configurar variables de entorno para build
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
ENV DISABLE_ESLINT_PLUGIN=true
ENV CI=true

# Instalar dependencias de desarrollo para build
RUN npm ci --no-audit --no-fund

# Build de la aplicación
RUN npm run build

# Stage 3: Production image
FROM nginx:1.25-alpine AS production

# Instalar herramientas de seguridad
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Usar usuario nginx existente (ya viene con la imagen nginx)

# Configurar nginx
COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx nginx-default.conf /etc/nginx/conf.d/default.conf

# Copiar archivos buildados
COPY --from=builder --chown=nginx:nginx /app/build /usr/share/nginx/html

# Configurar permisos
RUN chown -R nginx:nginx /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Configurar healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Exponer puerto
EXPOSE 80

# Cambiar a usuario no-root
USER nginx

# Usar dumb-init para manejo de señales
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
