FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

COPY ../common ./common

RUN cd ./common && npm ci && npm run build

COPY ./api ./api

WORKDIR /app/api

RUN ls -la

RUN npm ci
RUN npm run build

RUN npm prune --production

EXPOSE 3002

CMD ["npm", "start"]