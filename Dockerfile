# ================================
# Etapa de construcción (Build Stage)
# ================================

FROM node:20.19.1-alpine AS builder


# Configurar directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Eliminar package-lock.json y limpiar caché para evitar conflictos de versiones
RUN rm -f package-lock.json && npm cache clean --force

# Instalar dependencias frescas
RUN npm install

# Copiar código fuente
COPY . .

# Construir aplicación para producción (genera dist/client y dist/server)
RUN npm run build

# ================================
# Etapa de producción (Runner)
# ================================

FROM node:20.19.1-alpine AS runner


# Ejecutar en modo producción usando el servidor Node que hace SSR (server.js)
WORKDIR /app

# Establecer variable de entorno de producción
ENV NODE_ENV=production

# Copiar solo los artefactos necesarios desde el builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Copiar package.json (necesario para que Node cargue ESM si "type": "module")
COPY --from=builder /app/package*.json ./

# Copiar el servidor de producción y la plantilla index.html
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/index.html ./index.html

# Puerto usado por server.js
#EXPOSE 5173

# Ejecutar el servidor Node que renderiza (SSR)
CMD ["node", "server.js"]