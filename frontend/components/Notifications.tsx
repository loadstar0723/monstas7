'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaInfoCircle, 
  FaTimesCircle,
  FaTimes 
} from 'react-icons/fa'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface NotificationsProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
}

const iconMap = {
  success: <FaCheckCircle className="w-5 h-5" />,
  error: <FaTimesCircle className="w-5 h-5" />,
  warning: <FaExclamationCircle className="w-5 h-5" />,
  info: <FaInfoCircle className="w-5 h-5" />
}

const colorMap = {
  success: 'from-green-500 to-green-600',
  error: 'from-red-500 to-red-600',
  warning: 'from-yellow-500 to-orange-500',
  info: 'from-blue-500 to-blue-600'
}

const bgColorMap = {
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
}

export function NotificationItem({ notification, onDismiss }: { notification: Notification; onDismiss: () => void }) {
  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => {
        onDismiss()
      }, notification.duration)
      
      return () => clearTimeout(timer)
    }
  }, [notification.duration, onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-lg shadow-lg border ${bgColorMap[notification.type]} p-4 pointer-events-auto`}
    >
      {/* 그라디언트 바 */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorMap[notification.type]}`} />
      
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div className={`text-${notification.type === 'success' ? 'green' : notification.type === 'error' ? 'red' : notification.type === 'warning' ? 'yellow' : 'blue'}-600 dark:text-${notification.type === 'success' ? 'green' : notification.type === 'error' ? 'red' : notification.type === 'warning' ? 'yellow' : 'blue'}-400 flex-shrink-0`}>
          {iconMap[notification.type]}
        </div>
        
        {/* 내용 */}
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {notification.title}
          </h4>
          {notification.message && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {notification.message}
            </p>
          )}
        </div>
        
        {/* 닫기 버튼 */}
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>
      
      {/* 프로그레스 바 (duration이 있을 때) */}
      {notification.duration && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: notification.duration / 1000, ease: 'linear' }}
          className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${colorMap[notification.type]}`}
        />
      )}
    </motion.div>
  )
}

export default function Notifications({ notifications, onDismiss }: NotificationsProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none md:bottom-8 md:right-8">
      <AnimatePresence mode="sync">
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onDismiss={() => onDismiss(notification.id)}
            />
          ))}
        </div>
      </AnimatePresence>
    </div>
  )
}

// 알림 훅
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications(prev => [...prev, { ...notification, id, duration: notification.duration || 5000 }])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const success = (title: string, message?: string) => {
    addNotification({ type: 'success', title, message })
  }

  const error = (title: string, message?: string) => {
    addNotification({ type: 'error', title, message, duration: 10000 })
  }

  const warning = (title: string, message?: string) => {
    addNotification({ type: 'warning', title, message })
  }

  const info = (title: string, message?: string) => {
    addNotification({ type: 'info', title, message })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info
  }
}