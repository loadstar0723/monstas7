module.exports = {
  apps: [{
    name: 'monsta-prod',
    script: 'npm',
    args: 'start',
    cwd: './frontend',
    instances: 2,  // 클러스터 모드로 2개 인스턴스 실행
    exec_mode: 'cluster',  // 클러스터 모드로 변경 (무중단 배포 가능)
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_TELEMETRY_DISABLED: 1,
      HOST: '0.0.0.0',
      NEXTAUTH_SECRET: 'monstas7-secret-key-2024-production-secure',
      NEXTAUTH_URL: 'http://13.209.84.93:3000'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    
    // 무중단 배포 설정
    wait_ready: true,  // 앱이 준비될 때까지 대기
    listen_timeout: 10000,  // 리스닝 타임아웃 10초
    kill_timeout: 5000,  // 종료 시그널 후 5초 대기
    
    // 자동 재시작 설정
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    
    // 모니터링
    monitoring: true,
    
    // 크래시 복구
    exp_backoff_restart_delay: 100,
  }]
}