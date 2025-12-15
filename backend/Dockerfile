# Stage 1: Builder
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Устанавливаем зависимости для сборки (если нужны)
RUN apk add --no-cache git make

# Копируем только файлы зависимостей для лучшего кэширования
COPY go.mod go.sum ./

# Скачиваем зависимости (кэшируется если go.mod/go.sum не изменились)
RUN go mod download

# Копируем исходный код
COPY . .

# Генерируем API код (если нужно)
# RUN make generate

# Собираем статический бинарник
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags='-w -s -extldflags "-static"' \
    -o /app/server \
    ./cmd/server/main.go

# Stage 2: Runtime
FROM scratch

# Копируем CA сертификаты из alpine для HTTPS запросов
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Копируем только собранный бинарник
COPY --from=builder /app/server /server

EXPOSE 8080

# Запускаем приложение
ENTRYPOINT ["/server"]

