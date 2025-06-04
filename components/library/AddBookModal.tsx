'use client'

import { useEffect, useState, useRef } from 'react'
import { X } from 'lucide-react'
import { BookResponseDTO } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/toast'
import AddBookWizard from './AddBookWizard'

export interface AddBookModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (book: BookResponseDTO) => void
}

export default function AddBookModal({ isOpen, onClose, onSuccess }: AddBookModalProps) {
  const [isDirty, setIsDirty] = useState(false)
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const { toasts, showToast, hideToast } = useToast()

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden' // Prevent background scrolling
      
      // Focus management
      const firstFocusableElement = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement
      firstFocusableElement?.focus()
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = () => {
    if (isDirty) {
      setShowCloseConfirmation(true)
    } else {
      onClose()
    }
  }

  const handleConfirmClose = () => {
    setShowCloseConfirmation(false)
    onClose()
  }

  const handleCancelClose = () => {
    setShowCloseConfirmation(false)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleWizardComplete = (book: BookResponseDTO) => {
    // Success feedback
    showToast({
      type: 'success',
      title: 'Sukces!',
      message: `Książka "${book.title}" została dodana do Twojej biblioteki.`,
      duration: 4000,
    })

    // Reset form state
    setIsDirty(false)
    
    // Call parent success handler
    onSuccess?.(book)
    
    // Close modal
    onClose()
  }

  const handleWizardCancel = () => {
    handleClose()
  }

  const handleDirtyChange = (dirty: boolean) => {
    setIsDirty(dirty)
  }

  if (!isOpen) {
    return null
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        
        {/* Modal Content */}
        <div 
          ref={modalRef}
          className="relative bg-background border rounded-lg shadow-lg w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] m-4 flex flex-col animate-in fade-in-0 zoom-in-95 duration-200"
          tabIndex={-1}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 id="modal-title" className="text-xl font-semibold text-foreground">
                Dodaj Nową Książkę
              </h2>
              <p id="modal-description" className="text-sm text-muted-foreground mt-1">
                Dodaj nową książkę do swojej biblioteki w kilku prostych krokach
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
              aria-label="Zamknij modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto">
            <AddBookWizard
              onComplete={handleWizardComplete}
              onCancel={handleWizardCancel}
              onDirtyChange={handleDirtyChange}
            />
          </div>
        </div>
      </div>

      {/* Close Confirmation Dialog */}
      {showCloseConfirmation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-background border rounded-lg shadow-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Niezapisane zmiany
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Masz niezapisane zmiany. Czy na pewno chcesz zamknąć bez zapisywania?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleCancelClose}
              >
                Anuluj
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmClose}
              >
                Zamknij bez zapisywania
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer 
        toasts={toasts} 
        onClose={hideToast} 
      />
    </>
  )
} 