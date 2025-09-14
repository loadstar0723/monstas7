const CACHE_NAME = 'monsta-v1.0.0';
const urlsToCache = [
  '/'
  // 다른 URL은 동적으로 캐시
];

// 서비스 워커 설치
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('캐시 열기 완료');
        // 개별적으로 캐시 추가 (실패해도 계속 진행)
        const cachePromises = urlsToCache.map(url => {
          return cache.add(url).catch(err => {
            console.warn(`캐시 추가 실패 (${url}):`, err.message);
          });
        });
        return Promise.all(cachePromises);
      })
      .catch((error) => {
        console.error('캐시 열기 실패:', error);
      })
  );
  self.skipWaiting();
});

// 서비스 워커 활성화
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('이전 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  // POST 요청은 캐시하지 않음
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  // API 요청은 항상 네트워크 우선 (외부 API는 캐시하지 않음)
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 외부 API 프록시 요청은 캐시하지 않음
          const doNotCache = ['/api/coingecko', '/api/binance', '/api/fear-greed'];
          const shouldCache = !doNotCache.some(path => event.request.url.includes(path));

          // 성공적인 응답만 캐시에 저장 (GET 요청만, 외부 API 제외)
          if (response && response.status === 200 && event.request.method === 'GET' && shouldCache) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache).catch(() => {
                  // 캐시 실패 무시
                });
              });
          }
          return response;
        })
        .catch(() => {
          // 네트워크 실패 시 캐시에서 가져오기
          return caches.match(event.request);
        })
    );
  } else {
    // 정적 리소스는 캐시 우선
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .then((response) => {
              // 404 응답은 캐시하지 않음
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // chrome-extension과 같은 특수 스킴은 캐시하지 않음
              const url = new URL(event.request.url);
              if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
                return response;
              }
              
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache).catch(err => {
                    // 캐시 실패 시 조용히 무시
                    console.log('Cache put failed:', err.message);
                  });
                });
              return response;
            });
        })
    );
  }
});

// 백그라운드 동기화
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    // 오프라인 중 저장된 데이터 동기화
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/api/') && request.method === 'POST') {
        try {
          await fetch(request);
          await cache.delete(request);
        } catch (error) {
          console.error('동기화 실패:', error);
        }
      }
    }
  } catch (error) {
    console.error('백그라운드 동기화 오류:', error);
  }
}

// 푸시 알림
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('MONSTA 알림', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});