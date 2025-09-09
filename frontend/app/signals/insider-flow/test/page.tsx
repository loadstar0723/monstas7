'use client'

export default function InsiderFlowTestPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl mb-4">인사이더 플로우 테스트 페이지</h1>
      
      <div className="space-y-4">
        <button 
          onClick={async () => {
            try {
              const res = await fetch('/api/insider/config?symbol=BTC')
              const data = await res.json()
              console.log('Config API:', data)
              alert('Config API: ' + JSON.stringify(data, null, 2))
            } catch (e) {
              console.error('Config API Error:', e)
              alert('Error: ' + e)
            }
          }}
          className="px-4 py-2 bg-blue-500 rounded"
        >
          Config API 테스트
        </button>
        
        <button 
          onClick={async () => {
            try {
              const res = await fetch('/api/insider/onchain?symbol=BTC')
              const data = await res.json()
              console.log('Onchain API:', data)
              alert('Onchain API: ' + JSON.stringify(data, null, 2))
            } catch (e) {
              console.error('Onchain API Error:', e)
              alert('Error: ' + e)
            }
          }}
          className="px-4 py-2 bg-green-500 rounded"
        >
          Onchain API 테스트
        </button>
        
        <button 
          onClick={async () => {
            try {
              const res = await fetch('/api/insider/wallets?symbol=BTC')
              const data = await res.json()
              console.log('Wallets API:', data)
              alert('Wallets API: ' + JSON.stringify(data, null, 2))
            } catch (e) {
              console.error('Wallets API Error:', e)
              alert('Error: ' + e)
            }
          }}
          className="px-4 py-2 bg-purple-500 rounded"
        >
          Wallets API 테스트
        </button>
      </div>
    </div>
  )
}