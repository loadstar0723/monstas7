'use client'

import React, { useState, useEffect } from 'react'

export default function LSTMTest() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    console.log('LSTMTest component mounted')
    
    // 1초 후 로딩 완료
    setTimeout(() => {
      console.log('Setting loading to false')
      setLoading(false)
      setData({ message: 'LSTM Test Page Working!' })
    }, 1000)
  }, [])
  
  console.log('Rendering LSTMTest, loading:', loading)
  
  if (loading) {
    return (
      <div style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1>Loading Test...</h1>
      </div>
    )
  }
  
  return (
    <div style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh', padding: '20px' }}>
      <h1>LSTM Test Page</h1>
      <p>{data?.message}</p>
      <p>If you can see this, the basic rendering works!</p>
    </div>
  )
}