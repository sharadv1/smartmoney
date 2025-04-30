'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

type ToastProps = {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
  onClose?: () => void
}

type ToastContextType = {
  toast: (props: ToastProps) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>([])

  const toast = React.useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...props, id }])

    if (props.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
      }, props.duration || 5000)
    }
  }, [])

  const handleClose = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 w-full max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'p-4 rounded-md shadow-lg border transition-all duration-300 animate-in fade-in slide-in-from-bottom-5',
              toast.variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground border-destructive'
                : 'bg-background border-border'
            )}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="grid gap-1">
                {toast.title && <h3 className="font-semibold">{toast.title}</h3>}
                {toast.description && <p className="text-sm">{toast.description}</p>}
              </div>
              <button
                onClick={() => handleClose(toast.id)}
                className="rounded-full p-1 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const toast = (props: ToastProps) => {
  if (typeof window !== 'undefined') {
    // Create a custom event
    const event = new CustomEvent('toast', { detail: props })
    window.dispatchEvent(event)
  }
}

// Event listener component
export function ToastEventListener() {
  const { toast } = useToast()

  React.useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<ToastProps>
      toast(customEvent.detail)
    }

    window.addEventListener('toast', handleToast)
    return () => window.removeEventListener('toast', handleToast)
  }, [toast])

  return null
}