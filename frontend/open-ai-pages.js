const urls = [
  'http://localhost:3000/ai/lstm',
  'http://localhost:3000/ai/gru', 
  'http://localhost:3000/ai/arima',
  'http://localhost:3000/ai/randomforest',
  'http://localhost:3000/ai/xgboost',
  'http://localhost:3000/ai/lightgbm',
  'http://localhost:3000/ai/neural'
];

const { exec } = require('child_process');
const os = require('os');

urls.forEach(url => {
  if (os.platform() === 'win32') {
    exec(`start ${url}`);
  } else if (os.platform() === 'darwin') {
    exec(`open ${url}`);
  } else {
    exec(`xdg-open ${url}`);
  }
});

console.log('모든 AI 페이지를 새 탭에서 열었습니다\!');
console.log('특히 XGBoost 페이지의 특성 중요도 탭을 확인해보세요\!');
