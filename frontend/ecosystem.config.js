module.exports = {
  apps: [
    {
      name: 'monsta-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'dev -p 3002',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'development',
        PORT: 3002
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      // 자동 재시작 설정
      min_uptime: '10s',
      max_restarts: 10,
      // 메모리 누수 방지
      node_args: '--max-old-space-size=2048',
      // 안정성 설정
      kill_timeout: 5000,
      listen_timeout: 10000,
      restart_delay: 4000
    }
  ]
}