FROM node:lts-alpine3.24

WORKDIR /app

COPY --from=shared services/shared /shared
RUN cd /shared && npm ci && npm run build

COPY package*.json ./

RUN npm ci && npm cache clean --force

RUN rm -rf /shared/node_modules/@nestjs /shared/node_modules/express /shared/node_modules/reflect-metadata /shared/node_modules/zod

COPY --chown=node:node tsconfig.json tsconfig.build.json ./
COPY --chown=node:node src ./src

RUN npm run build

ENV NODE_OPTIONS=--preserve-symlinks

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
