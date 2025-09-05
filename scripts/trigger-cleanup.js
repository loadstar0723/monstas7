#!/usr/bin/env node

/**
 * GitHub Actions 워크플로우 자동 실행 스크립트
 */

const https = require('https');

// GitHub Personal Access Token이 필요합니다
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const OWNER = 'loadstar0723';
const REPO = 'monstas7';
const WORKFLOW_ID = 'cleanup-server.yml';

if (!GITHUB_TOKEN) {
    console.error('❌ GITHUB_TOKEN 환경 변수가 설정되지 않았습니다.');
    console.log('\n설정 방법:');
    console.log('1. https://github.com/settings/tokens 에서 토큰 생성');
    console.log('2. set GITHUB_TOKEN=your_token_here (Windows)');
    console.log('3. export GITHUB_TOKEN=your_token_here (Mac/Linux)');
    process.exit(1);
}

const data = JSON.stringify({
    ref: 'master',
    inputs: {
        backup: 'false'
    }
});

const options = {
    hostname: 'api.github.com',
    path: `/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_ID}/dispatches`,
    method: 'POST',
    headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Node.js',
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('🚀 GitHub Actions 워크플로우 실행 중...');

const req = https.request(options, (res) => {
    console.log(`상태 코드: ${res.statusCode}`);
    
    if (res.statusCode === 204) {
        console.log('✅ 워크플로우가 성공적으로 시작되었습니다!');
        console.log('\n📊 진행 상황 확인:');
        console.log(`https://github.com/${OWNER}/${REPO}/actions`);
    } else {
        console.error(`❌ 워크플로우 실행 실패: ${res.statusCode}`);
    }
    
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error('❌ 요청 실패:', error);
});

req.write(data);
req.end();