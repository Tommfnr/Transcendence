FROM node:lts-alpine3.24

WORKDIR /app

COPY --from=shared services/shared /shared
RUN cd /shared && npm ci && npm run build

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
