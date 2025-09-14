// 뉴스 API 테스트 스크립트

async function testNewsAPIs() {
  console.log('뉴스 API 테스트 시작...\n');

  // 1. CryptoCompare API 직접 테스트
  console.log('1. CryptoCompare API 테스트');
  try {
    const apiKey = '57f89e8ea43da615e49a75d31d9e64742063d53553dc16bb7b832a8ea359422b';
    const url = `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&api_key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (response.ok && data.Data) {
      console.log(`✅ 성공: ${data.Data.length}개 뉴스 받음`);
      if (data.Data.length > 0) {
        console.log(`   첫 번째 뉴스: ${data.Data[0].title}`);
      }
    } else {
      console.log(`❌ 실패: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ 에러: ${error.message}`);
  }

  console.log('\n2. Binance API 테스트');
  try {
    const response = await fetch(
      'https://www.binance.com/bapi/composite/v1/public/cms/article/list/query',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 1,
          pageNo: 1,
          pageSize: 5,
          tags: []
        })
      }
    );

    const data = await response.json();

    if (response.ok && data.data) {
      console.log(`✅ 성공: 데이터 받음`);
      const articles = data.data?.catalogs?.[0]?.articles || [];
      console.log(`   기사 수: ${articles.length}개`);
      if (articles.length > 0) {
        console.log(`   첫 번째 기사: ${articles[0].title}`);
      }
    } else {
      console.log(`❌ 실패: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ 에러: ${error.message}`);
  }

  console.log('\n3. Coinbase RSS (via rss2json) 테스트');
  try {
    const response = await fetch(
      'https://api.rss2json.com/v1/api.json?rss_url=https://blog.coinbase.com/feed'
    );

    const data = await response.json();

    if (response.ok && data.items) {
      console.log(`✅ 성공: ${data.items.length}개 포스트 받음`);
      if (data.items.length > 0) {
        console.log(`   첫 번째 포스트: ${data.items[0].title}`);
      }
    } else {
      console.log(`❌ 실패: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ 에러: ${error.message}`);
  }

  console.log('\n테스트 완료!');
}

// 실행
testNewsAPIs();