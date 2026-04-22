# ─────────────────────────────────────────────
# STAGE 1: Build con Node
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files primero para aprovechar caché
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Build de producción (usa VITE_API_URL del entorno)
RUN npm run build

# ─────────────────────────────────────────────
# STAGE 2: Nginx para servir el build
# ─────────────────────────────────────────────
FROM nginx:alpine

# Copiar el build generado
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración de Nginx para SPA (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]