FROM node:lts-alpine3.24

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 4983

CMD ["npx", "drizzle-kit", "studio", "--port", "4983", "--host", "0.0.0.0"]