# Build
# biar stay di 1.3 tapi patch boleh latest
FROM docker.io/oven/bun:1.3-alpine AS build
WORKDIR /app

# copy manifest dulu terpisah dari source, biar layer install ke-cache
# selama package.json & bun.lock gak berubah
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun bun ci

# baru copy semua source setelah dependency ke-install
COPY . .

# value datang dari docker-compose build.args, di-embed ke bundle saat build
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN bun run build-only

# Serve
FROM docker.io/nginx:1.27-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]
