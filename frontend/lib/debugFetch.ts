/**
 * Fetch 디버깅 유틸리티
 * JSON 파싱 에러를 추적하고 방지합니다
 */

if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  
  window.fetch = async function(...args) {
    const [url, options] = args;
    console.log('🔍 Fetch 호출:', url);
    
    try {
      const response = await originalFetch.apply(this, args);
      
      // Response를 복제하여 체크
      const clonedResponse = response.clone();
      
      // Content-Type 체크
      const contentType = clonedResponse.headers.get('content-type');
      
      if (!response.ok) {
        console.warn(`⚠️ HTTP 에러: ${url} - Status: ${response.status}`);
      }
      
      // JSON 파싱을 시도하는 경우를 감지하기 위해 json 메서드를 래핑
      const originalJson = response.json.bind(response);
      response.json = async function() {
        if (!contentType || !contentType.includes('application/json')) {
          console.error(`❌ JSON 파싱 시도 (비-JSON 응답): ${url}`);
          console.error(`   Content-Type: ${contentType}`);
          
          // 응답 내용을 확인
          const text = await clonedResponse.text();
          if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
            console.error('   HTML 페이지가 반환됨 (404 또는 에러 페이지)');
          }
          
          // 빈 객체 반환하여 에러 방지
          return {};
        }
        
        try {
          return await originalJson();
        } catch (error) {
          console.error(`❌ JSON 파싱 실패: ${url}`, error);
          return {};
        }
      };
      
      return response;
    } catch (error) {
      console.error(`❌ Fetch 실패: ${url}`, error);
      throw error;
    }
  };
  
  console.log('✅ Fetch 디버깅 활성화됨');
}

export {};