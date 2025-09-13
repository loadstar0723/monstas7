const http = require('http');

const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || 'localhost';

const options = {
  hostname: HOST,
  port: PORT,
  path: '/api/binance/ticker?symbol=BTCUSDT',
  method: 'GET',
  timeout: 5000
};

const checkHealth = () => {
  const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log(`✅ Server is healthy on port ${PORT}`);
      process.exit(0);
    } else {
      console.error(`❌ Server returned status ${res.statusCode}`);
      process.exit(1);
    }
  });

  req.on('error', (error) => {
    console.error(`❌ Server health check failed: ${error.message}`);
    process.exit(1);
  });

  req.on('timeout', () => {
    console.error('❌ Server health check timeout');
    req.destroy();
    process.exit(1);
  });

  req.end();
};

// 서버가 시작되기까지 대기
setTimeout(checkHealth, 5000);