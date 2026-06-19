# All of the Dockerfiles have a pinned version if possible and use Alpine for lightweight
FROM node:lts-alpine3.24

WORKDIR /app

# Every NestJS service needs their packages, hence the copy package and package-lock
COPY package*.json ./

# npm ci = npm clean install 
# npm ci is meant to be used in automated environments and is a great CI/CD practice
# It is stricter than npm install, see https://docs.npmjs.com/cli/v11/commands/npm-ci for more
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]