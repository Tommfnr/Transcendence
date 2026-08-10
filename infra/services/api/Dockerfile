FROM node:lts-alpine3.24

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .
COPY --from=shared schema.ts .

EXPOSE 3000

CMD ["npm", "run", "dev"]