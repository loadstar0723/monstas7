module.exports = {
  apps: [{
    name: 'monsta-prod',
    script: 'npm',
    args: 'start',
    cwd: './frontend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    
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