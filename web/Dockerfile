# Stage 1: Dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Устанавливаем pnpm
RUN npm install -g pnpm

# Копируем только файлы зависимостей для лучшего кэширования
COPY package.json pnpm-lock.yaml ./

# Устанавливаем зависимости (кэшируется если package.json/pnpm-lock.yaml не изменились)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Stage 2: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Устанавливаем pnpm
RUN npm install -g pnpm

# Копируем зависимости из предыдущего stage
COPY --from=deps /app/node_modules ./node_modules

# Копируем исходный код
COPY . .

# Собираем приложение
RUN pnpm build

# Stage 3: Runtime (nginx для статики)
FROM nginx:alpine AS runtime

# Копируем собранные файлы
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx для SPA
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://backend:8080; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

