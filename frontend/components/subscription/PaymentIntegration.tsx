'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaCreditCard, FaPaypal, FaBitcoin, FaLock, 
  FaShieldAlt, FaCheckCircle, FaExclamationTriangle 
} from 'react-icons/fa'
import { SiStripe } from 'react-icons/si'

interface PaymentMethod {
  id: string
  name: string
  icon: React.ElementType
  description: string
  fee: number // percentage
  processingTime: string
  supported: boolean
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    icon: SiStripe,
    description: '신용카드, 체크카드',
    fee: 2.9,
    processingTime: '즉시',
    supported: true
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: FaPaypal,
    description: 'PayPal 계정 또는 카드',
    fee: 3.5,
    processingTime: '즉시',
    supported: true
  },
  {
    id: 'crypto',
    name: '암호화폐',
    icon: FaBitcoin,
    description: 'BTC, ETH, USDT',
    fee: 1.0,
    processingTime: '10-30분',
    supported: true
  }
]

interface Props {
  selectedTier: string
  price: number
  onPaymentComplete: (paymentData: any) => void
}

export default function PaymentIntegration({ selectedTier, price, onPaymentComplete }: Props) {
  const [selectedMethod, setSelectedMethod] = useState<string>('stripe')
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  })
  const [billingAddress, setBillingAddress] = useState({
    country: 'KR',
    zipCode: '',
    address: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleCardNumberChange = (value: string) => {
    // Format card number with spaces
    const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()
    setCardDetails({ ...cardDetails, number: formatted })
  }

  const handleExpiryChange = (value: string) => {
    // Format MM/YY
    const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5)
    setCardDetails({ ...cardDetails, expiry: formatted })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (selectedMethod === 'stripe') {
      if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = '유효한 카드 번호를 입력하세요'
      }
      if (!cardDetails.expiry || !cardDetails.expiry.match(/^\d{2}\/\d{2}$/)) {
        newErrors.expiry = '유효한 만료일을 입력하세요 (MM/YY)'
      }
      if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
        newErrors.cvc = 'CVC를 입력하세요'
      }
      if (!cardDetails.name) {
        newErrors.name = '카드 소유자명을 입력하세요'
      }
    }
    
    if (!billingAddress.zipCode) {
      newErrors.zipCode = '우편번호를 입력하세요'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const processPayment = async () => {
    if (!validateForm()) return
    
    setIsProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      const paymentData = {
        method: selectedMethod,
        tier: selectedTier,
        amount: price,
        timestamp: new Date(),
        transactionId: `TXN-${Date.now()}`,
        status: 'success'
      }
      
      onPaymentComplete(paymentData)
      setIsProcessing(false)
    }, 2000)
  }

  const currentMethod = paymentMethods.find(m => m.id === selectedMethod)!

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg p-6 mb-6"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaShieldAlt className="text-green-400" />
          결제 방법 선택
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paymentMethods.map(method => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              disabled={!method.supported}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              } ${!method.supported ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <method.icon className="text-3xl mb-2 mx-auto" />
              <h4 className="font-semibold text-white">{method.name}</h4>
              <p className="text-xs text-gray-400 mt-1">{method.description}</p>
              <div className="mt-2 text-xs">
                <span className="text-gray-500">수수료: {method.fee}%</span>
                <span className="text-gray-500 ml-2">• {method.processingTime}</span>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Payment form */}
      {selectedMethod === 'stripe' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-6 mb-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaCreditCard className="text-blue-400" />
            카드 정보
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">카드 번호</label>
              <input
                type="text"
                value={cardDetails.number}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                maxLength={19}
                placeholder="1234 5678 9012 3456"
                className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                  errors.cardNumber ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                }`}
              />
              {errors.cardNumber && (
                <p className="text-red-400 text-sm mt-1">{errors.cardNumber}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">만료일</label>
                <input
                  type="text"
                  value={cardDetails.expiry}
                  onChange={(e) => handleExpiryChange(e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                  className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                    errors.expiry ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                  }`}
                />
                {errors.expiry && (
                  <p className="text-red-400 text-sm mt-1">{errors.expiry}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">CVC</label>
                <input
                  type="text"
                  value={cardDetails.cvc}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  placeholder="123"
                  className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                    errors.cvc ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                  }`}
                />
                {errors.cvc && (
                  <p className="text-red-400 text-sm mt-1">{errors.cvc}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">카드 소유자명</label>
              <input
                type="text"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                placeholder="홍길동"
                className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                  errors.name ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                }`}
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {selectedMethod === 'crypto' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-6 mb-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaBitcoin className="text-orange-400" />
            암호화폐 결제
          </h3>
          
          <div className="bg-gray-900 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-400 mb-2">지원 암호화폐:</p>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl">₿</div>
                <div className="text-xs text-gray-500">Bitcoin</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">Ξ</div>
                <div className="text-xs text-gray-500">Ethereum</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">₮</div>
                <div className="text-xs text-gray-500">USDT</div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
            <p className="text-yellow-400 text-sm flex items-start gap-2">
              <FaExclamationTriangle className="mt-0.5" />
              결제 진행 시 QR 코드와 지갑 주소가 표시됩니다. 
              정확한 금액을 송금해주세요.
            </p>
          </div>
        </motion.div>
      )}

      {/* Billing address */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800 rounded-lg p-6 mb-6"
      >
        <h3 className="text-xl font-bold text-white mb-4">청구 주소</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">국가</label>
            <select
              value={billingAddress.country}
              onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="KR">대한민국</option>
              <option value="US">미국</option>
              <option value="JP">일본</option>
              <option value="CN">중국</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">우편번호</label>
            <input
              type="text"
              value={billingAddress.zipCode}
              onChange={(e) => setBillingAddress({ ...billingAddress, zipCode: e.target.value })}
              placeholder="12345"
              className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                errors.zipCode ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
              }`}
            />
            {errors.zipCode && (
              <p className="text-red-400 text-sm mt-1">{errors.zipCode}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Order summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800 rounded-lg p-6 mb-6"
      >
        <h3 className="text-xl font-bold text-white mb-4">주문 요약</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between text-gray-300">
            <span>구독 플랜</span>
            <span className="text-white font-semibold">{selectedTier}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>기본 가격</span>
            <span className="text-white">₩{price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>수수료 ({currentMethod.fee}%)</span>
            <span className="text-white">₩{Math.floor(price * currentMethod.fee / 100).toLocaleString()}</span>
          </div>
          <div className="border-t border-gray-700 pt-3 flex justify-between text-lg font-semibold">
            <span className="text-white">총 결제 금액</span>
            <span className="text-blue-400">
              ₩{Math.floor(price * (1 + currentMethod.fee / 100)).toLocaleString()}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Security notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-green-900/20 border border-green-600/30 rounded-lg p-4 mb-6"
      >
        <p className="text-green-400 text-sm flex items-center gap-2">
          <FaLock />
          모든 결제 정보는 SSL 암호화되어 안전하게 처리됩니다.
        </p>
      </motion.div>

      {/* Submit button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={processPayment}
          disabled={isProcessing}
          className={`w-full py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
            isProcessing
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              결제 처리 중...
            </>
          ) : (
            <>
              <FaCheckCircle />
              ₩{Math.floor(price * (1 + currentMethod.fee / 100)).toLocaleString()} 결제하기
            </>
          )}
        </button>
      </motion.div>
    </div>
  )
}