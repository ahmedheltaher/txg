FROM node:24.11.1-slim AS builder

WORKDIR /app

COPY shared-contracts/package*.json ./shared-contracts/
COPY shared-contracts/tsconfig.json ./shared-contracts/
COPY shared-contracts/src ./shared-contracts/src

WORKDIR /app/shared-contracts
RUN npm ci && npm run build

WORKDIR /app
COPY audit-service/package*.json ./audit-service/
COPY audit-service/tsconfig.json ./audit-service/

WORKDIR /app/audit-service
RUN npm ci

COPY audit-service/src ./src
RUN npm run build

RUN npm prune --production

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "dist/server.js"]
