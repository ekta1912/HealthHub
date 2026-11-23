# ------------------------------------------------------------------------------
# HealthHub Client Dockerfile
# Multi-stage React build served with production Nginx
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Build static production bundle
RUN npm run build

# Stage 2: Minimal Nginx runtime
FROM nginx:1.25-alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
