FROM golang:1.21-alpine AS builder

WORKDIR /app

# 공통 모듈 복사
COPY ../common ../common

# 현재 서비스 파일 복사
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# 빌드
RUN go build -o lstm-service main.go

# 실행 이미지
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/lstm-service .

EXPOSE 8090

CMD ["./lstm-service"]