'use client'

import { useEffect } from 'react'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { Button } from './button'

interface ToastProps {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

const toastConfig = {
  success: {
    icon: CheckCircle2,
    className: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-200'
  },
  error: {
    icon: AlertCircle,
    className: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-200'
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-200'
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-200'
  }
}

export function Toast({ id, type, title, message, duration, onClose }: ToastProps) {
  const config = toastConfig[type]
  const Icon = config.icon

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [id, duration, onClose])

  return (
    <div className={`
      relative flex items-start gap-3 p-4 rounded-lg border shadow-lg
      animate-in slide-in-from-right-full duration-300
      ${config.className}
    `}>
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">
          {title}
        </div>
        {message && (
          <div className="text-sm mt-1 opacity-90">
            {message}
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onClose(id)}
        className="h-6 w-6 text-current hover:bg-current/10"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close notification</span>
      </Button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Array<{
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    title: string
    message?: string
    duration?: number
  }>
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onClose}
        />
      ))}
    </div>
  )
} 