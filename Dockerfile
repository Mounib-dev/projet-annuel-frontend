# ---------- Stage 1: Build (Vite + Node 22) ----------
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# ---------- Stage 2: Runtime (Nginx 1.27) ----------
FROM nginx:1.27-alpine AS runtime

COPY --from=builder /app/dist /usr/share/nginx/html
COPY deploy/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY deploy/docker-entrypoint.sh /docker-entrypoint.sh

RUN apk add --no-cache gettext dos2unix \
  && dos2unix /docker-entrypoint.sh \
  && chmod +x /docker-entrypoint.sh

ENV PORT=8080
EXPOSE 8080
CMD ["/docker-entrypoint.sh"]


