FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY public ./public
COPY src ./src

ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build


FROM nginx:1.27-alpine

ENV BACKEND_UPSTREAM=http://host.docker.internal:8001

COPY docker/nginx.conf.template \
    /etc/nginx/templates/default.conf.template

COPY --from=build \
    /app/dist \
    /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK \
    --interval=10s \
    --timeout=3s \
    --start-period=5s \
    --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/health || exit 1
