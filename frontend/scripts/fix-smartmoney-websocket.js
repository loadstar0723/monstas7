const fs = require('fs');
const path = require('path');

// SmartMoneyUltimate.tsx 파일 수정
const filePath = path.join(__dirname, '../app/signals/smart-money/SmartMoneyUltimate.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 잘못된 WebSocket 연결 부분 찾아서 수정
// 1. 중복된 }, 500) 제거
content = content.replace(/\}, 500\)\s*\}\s*\}, 500\)/g, '}, 500)');

// 2. fetchOrderBookData 함수 전에 닫는 괄호 확인
content = content.replace(/(\s*ws\.onclose = \(\) => \{\s*setIsConnected\(false\)\s*\}\s*\}\s*\}, 500\)\s*\}\s*)\/\/ Binance 오더북/g, `$1
  // Binance 오더북`);

// 3. WebSocket 연결 부분 구조 정리
const connectDataServiceStart = content.indexOf('const connectDataService = async (symbol: string) => {');
const fetchOrderBookStart = content.indexOf('const fetchOrderBookData = async (symbol: string) => {');

if (connectDataServiceStart !== -1 && fetchOrderBookStart !== -1) {
  const beforeConnect = content.substring(0, connectDataServiceStart);
  const connectFunction = content.substring(connectDataServiceStart, fetchOrderBookStart);
  const afterFetch = content.substring(fetchOrderBookStart);
  
  // connectDataService 함수 정리
  let cleanConnect = connectFunction;
  
  // ws.onclose 뒤의 중복된 닫는 괄호 제거
  cleanConnect = cleanConnect.replace(/(\s*ws\.onclose = \(\) => \{\s*setIsConnected\(false\)\s*\})\s*\}\s*(\}, 500\))/g, '$1$2');
  
  // wsRef.current = ws 다음의 구조 정리
  cleanConnect = cleanConnect.replace(/(wsRef\.current = ws)\s*(\s*ws\.onerror)/g, '$1\n        $2');
  
  content = beforeConnect + cleanConnect + afterFetch;
}

// 파일 저장
fs.writeFileSync(filePath, content);
console.log('✅ SmartMoneyUltimate.tsx WebSocket 연결 구조 수정 완료');