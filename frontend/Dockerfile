FROM node:24.11.1-slim AS builder

WORKDIR /app

ARG VITE_TRANSACTION_API_URL
ARG VITE_AUDIT_API_URL
ARG VITE_APP_ENV

ENV VITE_TRANSACTION_API_URL=$VITE_TRANSACTION_API_URL
ENV VITE_AUDIT_API_URL=$VITE_AUDIT_API_URL
ENV VITE_APP_ENV=$VITE_APP_ENV

COPY package.json package-lock.json tsconfig*.json ./

RUN npm ci --only=production=false \
    && npm cache clean --force

COPY vite.config.ts ./

COPY src ./src
COPY index.html ./

ENV NODE_ENV=production
RUN npm run build

FROM nginx:1.29-alpine

RUN apk add --no-cache curl

RUN addgroup -g 1000 -S nginx-app \
    && adduser -u 1000 -S nginx-app -G nginx-app

RUN rm -rf /usr/share/nginx/html/* \
    && rm /etc/nginx/conf.d/default.conf

RUN mkdir -p /var/cache/nginx/client_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp \
    /var/run \
    /var/log/nginx \
    && chown -R nginx-app:nginx-app /var/cache/nginx \
    && chown -R nginx-app:nginx-app /var/run \
    && chown -R nginx-app:nginx-app /var/log/nginx \
    && chown -R nginx-app:nginx-app /usr/share/nginx/html \
    && chown -R nginx-app:nginx-app /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown nginx-app:nginx-app /var/run/nginx.pid

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R nginx-app:nginx-app /etc/nginx/conf.d/default.conf

USER nginx-app

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]