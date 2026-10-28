# Build: production bundle, optimized and without source maps
FROM node:lts-alpine3.24 AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Runtime: only the built static files, served by Caddy
FROM caddy:2.11.4-alpine

COPY --from=build /app/dist/transcendence/browser /srv

# Client-side routes (/app/dashboard...) have no file: they fall back to index.html so a refresh works
COPY <<EOF /etc/caddy/Caddyfile
:80 {
	root * /srv
	encode zstd gzip
	try_files {path} /index.html
	file_server
}
EOF

EXPOSE 80
