module.exports = {
  apps: [{
    name: 'monsta-dev',
    script: 'node_modules/next/dist/bin/next',
    args: 'dev -p 3002 -H 0.0.0.0',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '6G',
    env: {
      NODE_ENV: 'development',
      NODE_OPTIONS: '--max-old-space-size=8192',
      PORT: 3002,
      NEXT_TELEMETRY_DISABLED: 1
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true,
    // 안정성 개선 설정
    min_uptime: '10s',
    max_restarts: 50,
    restart_delay: 4000,
    kill_timeout: 5000,
    listen_timeout: 10000,
    // 성능 최적화
    node_args: '--max-old-space-size=8192',
    // 크래시 방지
    exp_backoff_restart_delay: 100,
    // 헬스체크
    cron_restart: '0 */6 * * *', // 6시간마다 재시작
    // 메모리 누수 방지
    instance_var: 'INSTANCE_ID'
  }]
};
