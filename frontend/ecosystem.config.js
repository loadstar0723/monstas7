module.exports = {
  apps: [{
    name: 'monsta-dev',
    script: 'node_modules/next/dist/bin/next',
    args: 'dev -p 3001',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '2G',
    env: {
      NODE_ENV: 'development',
      NODE_OPTIONS: '--max-old-space-size=4096'
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true
  }]
};