# Go 빌드 스테이지
FROM golang:1.21-alpine AS builder

WORKDIR /app

# 모듈 파일 복사
COPY go.mod go.sum ./
RUN go mod download

# 소스 코드 복사
COPY . .

# 빌드
RUN go build -o ai-analysis main.go

# 실행 스테이지
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# 빌드된 실행 파일 복사
COPY --from=builder /app/ai-analysis .

# 포트 노출
EXPOSE 8083

# 실행
CMD ["./ai-analysis"]