const fs = require('fs');
const path = require('path');

// Signal pages to check
const signalPages = [
  'whale-tracker',
  'smart-money',
  'liquidation',
  'fear-greed',
  'funding-rate',
  'arbitrage',
  'dex-flow',
  'unusual-options',
  'social-sentiment',
  'insider-flow'
];

console.log('Checking API endpoints in signal pages...\n');

let totalIssues = 0;

signalPages.forEach(page => {
  const ultimateFile = path.join(__dirname, '..', 'app', 'signals', page, `${page.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Ultimate.tsx`);
  
  if (!fs.existsSync(ultimateFile)) {
    console.log(`⚠️  File not found: ${ultimateFile}`);
    return;
  }
  
  const content = fs.readFileSync(ultimateFile, 'utf8');
  const lines = content.split('\n');
  
  // Check for various API patterns
  const apiPatterns = [
    { pattern: /fetch\(['"`]https:\/\/api\.binance\.com/g, issue: 'Direct Binance API call (should use /api/binance proxy)' },
    { pattern: /fetch\(['"`]\/api\/binance\/fundingRate/g, issue: 'Incorrect endpoint (should be /api/binance/funding-rate)' },
    { pattern: /selectedCoin(?!\s*=)/g, issue: 'Using selectedCoin instead of selectedSymbol' },
    { pattern: /symbol\s*=\s*['"`]BTC['"`]/g, issue: 'Using BTC instead of BTCUSDT' },
    { pattern: /coin\s*=\s*['"`]BTC['"`]/g, issue: 'Using BTC instead of BTCUSDT' },
    { pattern: /Math\.random\(\)/g, issue: 'Using Math.random() (forbidden - use real data)' },
    { pattern: /mock|dummy|fake|sample|test(?:Data|Transaction)/gi, issue: 'Mock/test data detected' },
    { pattern: /setTimeout\([^,]*simulate/g, issue: 'Simulation timer detected' }
  ];
  
  let pageIssues = [];
  
  apiPatterns.forEach(({ pattern, issue }) => {
    const matches = content.match(pattern);
    if (matches) {
      pageIssues.push(`  - ${issue}: ${matches.length} occurrence(s)`);
      
      // Find line numbers for each match
      lines.forEach((line, index) => {
        if (pattern.test(line)) {
          console.log(`    Line ${index + 1}: ${line.trim().substring(0, 80)}...`);
        }
      });
    }
  });
  
  if (pageIssues.length > 0) {
    console.log(`❌ ${page}:`);
    pageIssues.forEach(issue => console.log(issue));
    console.log('');
    totalIssues += pageIssues.length;
  } else {
    console.log(`✅ ${page}: No issues found`);
  }
});

console.log('\n' + '='.repeat(60));
if (totalIssues === 0) {
  console.log('✅ All API endpoints are correctly configured!');
} else {
  console.log(`❌ Found ${totalIssues} total issue(s) that need fixing`);
}