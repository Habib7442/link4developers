import { Plus, Link } from 'lucide-react'
import { Button } from './button'

interface EmptyStateProps {
  message?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({ 
  message = 'No items found', 
  actionLabel = 'Add Item',
  onAction, 
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <Link className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Empty</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      
      {onAction && (
        <Button
          onClick={onAction}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

