#!/bin/bash
# Go 서비스 배포 스크립트

echo "🚀 Go 서비스 배포 시작..."

# 1. Go 서비스 빌드
echo "1. Building Go services..."
docker-compose -f docker-compose.go.yml build websocket-server price-collector

# 2. 기존 서비스 중지
echo "2. Stopping existing services..."
docker-compose -f docker-compose.go.yml down

# 3. 새 서비스 시작
echo "3. Starting new services..."
docker-compose -f docker-compose.go.yml up -d

# 4. 헬스체크
echo "4. Health check..."
sleep 5
curl -f http://localhost:8080/health || exit 1
curl -f http://localhost:8081/api/prices || exit 1

echo "✅ Go 서비스 배포 완료!"