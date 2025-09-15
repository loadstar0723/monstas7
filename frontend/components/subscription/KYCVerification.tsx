'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaUser, FaIdCard, FaCamera, FaCheckCircle, 
  FaExclamationTriangle, FaShieldAlt, FaUpload,
  FaPassport, FaHome, FaFileAlt
} from 'react-icons/fa'

interface VerificationStep {
  id: string
  title: string
  description: string
  icon: React.ElementType
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
}

interface PersonalInfo {
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  address: string
  city: string
  postalCode: string
  country: string
  phoneNumber: string
}

interface DocumentUpload {
  type: 'passport' | 'id-card' | 'driver-license'
  frontImage: File | null
  backImage: File | null
  selfie: File | null
}

export default function KYCVerification() {
  const [currentStep, setCurrentStep] = useState(0)
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
    {
      id: 'personal',
      title: '개인 정보',
      description: '기본 신원 정보 입력',
      icon: FaUser,
      status: 'in-progress'
    },
    {
      id: 'document',
      title: '신분증 업로드',
      description: '정부 발급 신분증 제출',
      icon: FaIdCard,
      status: 'pending'
    },
    {
      id: 'selfie',
      title: '셀피 인증',
      description: '신분증과 함께 셀피 촬영',
      icon: FaCamera,
      status: 'pending'
    },
    {
      id: 'address',
      title: '주소 증명',
      description: '거주지 증명 서류 제출',
      icon: FaHome,
      status: 'pending'
    }
  ])

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: 'KR',
    address: '',
    city: '',
    postalCode: '',
    country: 'KR',
    phoneNumber: ''
  })

  const [documentUpload, setDocumentUpload] = useState<DocumentUpload>({
    type: 'passport',
    frontImage: null,
    backImage: null,
    selfie: null
  })

  const [addressProof, setAddressProof] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validatePersonalInfo = () => {
    const newErrors: Record<string, string> = {}
    
    if (!personalInfo.firstName) newErrors.firstName = '이름을 입력하세요'
    if (!personalInfo.lastName) newErrors.lastName = '성을 입력하세요'
    if (!personalInfo.dateOfBirth) newErrors.dateOfBirth = '생년월일을 입력하세요'
    if (!personalInfo.address) newErrors.address = '주소를 입력하세요'
    if (!personalInfo.city) newErrors.city = '도시를 입력하세요'
    if (!personalInfo.postalCode) newErrors.postalCode = '우편번호를 입력하세요'
    if (!personalInfo.phoneNumber) newErrors.phoneNumber = '전화번호를 입력하세요'
    
    // Age verification
    const birthDate = new Date(personalInfo.dateOfBirth)
    const age = new Date().getFullYear() - birthDate.getFullYear()
    if (age < 18) newErrors.dateOfBirth = '만 18세 이상이어야 합니다'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, [field]: '파일 크기는 5MB 이하여야 합니다' })
        return
      }
      
      if (field === 'addressProof') {
        setAddressProof(file)
      } else {
        setDocumentUpload({
          ...documentUpload,
          [field]: file
        })
      }
      
      // Clear error for this field
      const newErrors = { ...errors }
      delete newErrors[field]
      setErrors(newErrors)
    }
  }

  const handleNextStep = () => {
    if (currentStep === 0 && validatePersonalInfo()) {
      updateStepStatus(0, 'completed')
      updateStepStatus(1, 'in-progress')
      setCurrentStep(1)
    } else if (currentStep === 1 && documentUpload.frontImage) {
      updateStepStatus(1, 'completed')
      updateStepStatus(2, 'in-progress')
      setCurrentStep(2)
    } else if (currentStep === 2 && documentUpload.selfie) {
      updateStepStatus(2, 'completed')
      updateStepStatus(3, 'in-progress')
      setCurrentStep(3)
    } else if (currentStep === 3 && addressProof) {
      updateStepStatus(3, 'completed')
      handleSubmit()
    }
  }

  const updateStepStatus = (stepIndex: number, status: VerificationStep['status']) => {
    setVerificationSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, status } : step
    ))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // Simulate KYC submission
    setTimeout(() => {
      setIsSubmitting(false)
      alert('KYC 인증이 제출되었습니다. 검토에 1-2일이 소요됩니다.')
    }, 2000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {verificationSteps.map((step, index) => (
            <div key={step.id} className="flex-1 relative">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: step.status === 'in-progress' ? 1.1 : 1 }}
                className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                  step.status === 'completed' ? 'bg-green-500' :
                  step.status === 'in-progress' ? 'bg-blue-500' :
                  step.status === 'failed' ? 'bg-red-500' :
                  'bg-gray-700'
                }`}
              >
                {step.status === 'completed' ? (
                  <FaCheckCircle className="text-white text-xl" />
                ) : (
                  <step.icon className="text-white text-xl" />
                )}
              </motion.div>
              
              <p className={`text-xs text-center mt-2 ${
                step.status === 'in-progress' ? 'text-white' : 'text-gray-400'
              }`}>
                {step.title}
              </p>
              
              {index < verificationSteps.length - 1 && (
                <div className={`absolute top-6 left-1/2 w-full h-0.5 ${
                  verificationSteps[index + 1].status !== 'pending' 
                    ? 'bg-blue-500' 
                    : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          {verificationSteps[currentStep].icon && (() => {
            const Icon = verificationSteps[currentStep].icon
            return <Icon className="text-blue-400" />
          })()}
          {verificationSteps[currentStep].title}
        </h2>

        {/* Personal Information Step */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">이름</label>
                <input
                  type="text"
                  value={personalInfo.firstName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                  className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                    errors.firstName ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                  }`}
                  placeholder="길동"
                />
                {errors.firstName && (
                  <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">성</label>
                <input
                  type="text"
                  value={personalInfo.lastName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                  className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                    errors.lastName ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                  }`}
                  placeholder="홍"
                />
                {errors.lastName && (
                  <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">생년월일</label>
                <input
                  type="date"
                  value={personalInfo.dateOfBirth}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                  className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                    errors.dateOfBirth ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                  }`}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-400 text-sm mt-1">{errors.dateOfBirth}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">국적</label>
                <select
                  value={personalInfo.nationality}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, nationality: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="KR">대한민국</option>
                  <option value="US">미국</option>
                  <option value="JP">일본</option>
                  <option value="CN">중국</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">주소</label>
              <input
                type="text"
                value={personalInfo.address}
                onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                  errors.address ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                }`}
                placeholder="서울특별시 강남구..."
              />
              {errors.address && (
                <p className="text-red-400 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">도시</label>
                <input
                  type="text"
                  value={personalInfo.city}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                  className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                    errors.city ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                  }`}
                  placeholder="서울"
                />
                {errors.city && (
                  <p className="text-red-400 text-sm mt-1">{errors.city}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">우편번호</label>
                <input
                  type="text"
                  value={personalInfo.postalCode}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, postalCode: e.target.value })}
                  className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                    errors.postalCode ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                  }`}
                  placeholder="12345"
                />
                {errors.postalCode && (
                  <p className="text-red-400 text-sm mt-1">{errors.postalCode}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">전화번호</label>
                <input
                  type="tel"
                  value={personalInfo.phoneNumber}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phoneNumber: e.target.value })}
                  className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                    errors.phoneNumber ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                  }`}
                  placeholder="010-1234-5678"
                />
                {errors.phoneNumber && (
                  <p className="text-red-400 text-sm mt-1">{errors.phoneNumber}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Document Upload Step */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">신분증 유형</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'passport', label: '여권', icon: FaPassport },
                  { value: 'id-card', label: '주민등록증', icon: FaIdCard },
                  { value: 'driver-license', label: '운전면허증', icon: FaIdCard }
                ].map(doc => (
                  <button
                    key={doc.value}
                    onClick={() => setDocumentUpload({ ...documentUpload, type: doc.value as any })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      documentUpload.type === doc.value
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <doc.icon className="text-2xl mb-2 mx-auto" />
                    <p className="text-sm">{doc.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">신분증 앞면</label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'frontImage')}
                  className="hidden"
                  id="front-upload"
                />
                <label htmlFor="front-upload" className="cursor-pointer">
                  <FaUpload className="text-4xl text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">클릭하여 업로드</p>
                  {documentUpload.frontImage && (
                    <p className="text-green-400 text-sm mt-2">
                      {documentUpload.frontImage.name}
                    </p>
                  )}
                </label>
              </div>
            </div>

            {documentUpload.type !== 'passport' && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">신분증 뒷면</label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'backImage')}
                    className="hidden"
                    id="back-upload"
                  />
                  <label htmlFor="back-upload" className="cursor-pointer">
                    <FaUpload className="text-4xl text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">클릭하여 업로드</p>
                    {documentUpload.backImage && (
                      <p className="text-green-400 text-sm mt-2">
                        {documentUpload.backImage.name}
                      </p>
                    )}
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Selfie Step */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">셀피 촬영 가이드</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• 밝은 곳에서 촬영하세요</li>
                <li>• 얼굴이 선명하게 보여야 합니다</li>
                <li>• 신분증을 얼굴 옆에 들고 촬영하세요</li>
                <li>• 신분증 정보가 읽을 수 있게 촬영하세요</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">셀피 사진</label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'selfie')}
                  className="hidden"
                  id="selfie-upload"
                />
                <label htmlFor="selfie-upload" className="cursor-pointer">
                  <FaCamera className="text-5xl text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">클릭하여 업로드</p>
                  {documentUpload.selfie && (
                    <p className="text-green-400 text-sm mt-2">
                      {documentUpload.selfie.name}
                    </p>
                  )}
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Address Proof Step */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
              <h4 className="text-yellow-400 font-semibold mb-2">주소 증명 서류</h4>
              <p className="text-sm text-gray-300">다음 중 하나를 제출하세요:</p>
              <ul className="text-sm text-gray-300 mt-2 space-y-1">
                <li>• 공과금 고지서 (3개월 이내)</li>
                <li>• 은행 거래 내역서</li>
                <li>• 임대차 계약서</li>
                <li>• 정부 발급 서류</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">주소 증명 서류</label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload(e, 'addressProof')}
                  className="hidden"
                  id="address-upload"
                />
                <label htmlFor="address-upload" className="cursor-pointer">
                  <FaFileAlt className="text-5xl text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">클릭하여 업로드</p>
                  <p className="text-xs text-gray-500 mt-2">PDF, JPG, PNG (최대 5MB)</p>
                  {addressProof && (
                    <p className="text-green-400 text-sm mt-2">
                      {addressProof.name}
                    </p>
                  )}
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg"
            >
              이전
            </button>
          )}
          
          <button
            onClick={handleNextStep}
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-lg font-semibold ml-auto flex items-center gap-2 ${
              isSubmitting
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                제출 중...
              </>
            ) : currentStep === verificationSteps.length - 1 ? (
              <>
                <FaCheckCircle />
                제출하기
              </>
            ) : (
              '다음'
            )}
          </button>
        </div>
      </motion.div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 bg-green-900/20 border border-green-600/30 rounded-lg p-4"
      >
        <p className="text-green-400 text-sm flex items-center gap-2">
          <FaShieldAlt />
          모든 개인정보는 암호화되어 안전하게 보관됩니다. GDPR 및 개인정보보호법을 준수합니다.
        </p>
      </motion.div>
    </div>
  )
}