FROM node:lts-alpine3.24

WORKDIR /app

COPY --from=shared services/shared /shared
RUN cd /shared && npm ci && npm run build

COPY package*.json ./

RUN npm ci

RUN rm -rf /shared/node_modules/@nestjs /shared/node_modules/express /shared/node_modules/reflect-metadata /shared/node_modules/zod

COPY tsconfig.json ./
COPY src ./src

ENV NODE_OPTIONS=--preserve-symlinks

EXPOSE 3000

CMD ["npm", "run", "dev"]
