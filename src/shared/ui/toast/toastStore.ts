import { create } from 'zustand'

export type ToastVariant = 'error' | 'success' | 'info'

export interface Toast {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

interface ToastState {
  toasts: Toast[]
  dismiss: (id: string) => void
}

const DEFAULT_DURATION_MS = 5000

export const useToastStore = create<ToastState>()(set => ({
  toasts: [],
  dismiss: id => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
}))

/**
 * Push a toast from anywhere — including non-component code like Zustand
 * store actions — since it doesn't rely on a React hook.
 */
export function pushToast(toast: Omit<Toast, 'id'>, durationMs = DEFAULT_DURATION_MS) {
  const id = crypto.randomUUID()

  useToastStore.setState(state => ({ toasts: [...state.toasts, { ...toast, id }] }))

  if (durationMs > 0) {
    setTimeout(() => {
      useToastStore.setState(state => ({ toasts: state.toasts.filter(t => t.id !== id) }))
    }, durationMs)
  }
}
