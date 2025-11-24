FROM node:24.11.1-slim AS builder

WORKDIR /app

COPY shared-contracts/package*.json ./shared-contracts/
COPY shared-contracts/tsconfig.json ./shared-contracts/
COPY shared-contracts/src ./shared-contracts/src

WORKDIR /app/shared-contracts
RUN npm ci && npm run build

WORKDIR /app
COPY transaction-service/package*.json ./transaction-service/
COPY transaction-service/tsconfig.json ./transaction-service/

WORKDIR /app/transaction-service
RUN npm ci

COPY transaction-service/src ./src
RUN npm run build

RUN npm prune --production

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/server.js"]