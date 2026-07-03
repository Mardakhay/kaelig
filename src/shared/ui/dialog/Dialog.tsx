import { type ReactNode } from 'react'
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalClose,
  type ModalContentProps,
} from '@shared/ui/modal/Modal'
import { Button } from '@shared/ui/button/Button'
import { cn } from '@shared/lib/cn'

export interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  size?: ModalContentProps['size']
  children?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  confirmVariant?: 'default' | 'destructive' | 'secondary'
  isLoading?: boolean
  className?: string
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  size = 'sm',
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  confirmVariant = 'default',
  isLoading = false,
  className,
}: DialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size={size}
      title={title}
      description={description}
      className={cn('', className)}
    >
      <ModalHeader>
        <div className="flex flex-col gap-1">
          <ModalTitle>{title}</ModalTitle>
          {description && <ModalDescription>{description}</ModalDescription>}
        </div>
        <ModalClose onClick={onClose} />
      </ModalHeader>

      {children && <ModalBody>{children}</ModalBody>}

      {onConfirm && (
        <ModalFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Loading…' : confirmLabel}
          </Button>
        </ModalFooter>
      )}
    </Modal>
  )
}
