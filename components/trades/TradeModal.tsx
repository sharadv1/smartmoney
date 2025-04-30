'use client'

import { useState } from 'react'
import { TradeForm } from './TradeForm'
import { Button } from '@/components/ui/button'
import { createTrade, updateTrade } from '@/app/actions/trade-actions'
import { useRouter } from 'next/navigation'

type TradeModalProps = {
  accounts: { id: string; name: string }[]
  strategies: { id: string; name: string }[]
  initialData?: any
  tradeId?: string
  buttonText?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function TradeModal({ 
  accounts, 
  strategies, 
  initialData, 
  tradeId,
  buttonText,
  variant = 'default',
  size = 'default'
}: TradeModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Format the data for the server action
      const formattedData = {
        symbol: data.symbol,
        entryDate: data.entryDate,
        entryPrice: data.entryPrice,
        quantity: data.quantity,
        direction: data.direction,
        stopLoss: data.stopLoss,
        takeProfit: data.takeProfit,
        notes: data.notes,
        accountId: data.accountId,
        strategyId: data.strategyId,
      }

      // Call the appropriate server action
      const result = tradeId
        ? await updateTrade(tradeId, formattedData)
        : await createTrade(formattedData)

      if (result.success) {
        // Show success message
        window.dispatchEvent(new CustomEvent('toast', { 
          detail: {
            title: tradeId ? 'Trade Updated' : 'Trade Created',
            description: tradeId
              ? 'Your trade has been updated successfully.'
              : 'Your trade has been created successfully.',
          }
        }))
        
        setIsOpen(false)
        router.refresh()
      } else {
        setError(result.error || 'An error occurred. Please try again.')
        
        // Show error message
        window.dispatchEvent(new CustomEvent('toast', { 
          detail: {
            title: 'Error',
            description: result.error || 'An error occurred. Please try again.',
            variant: 'destructive',
          }
        }))
      }
    } catch (error: any) {
      console.error('Error submitting trade:', error)
      setError(error.message || 'An unexpected error occurred. Please try again.')
      
      // Show error message
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: {
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        }
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        variant={variant}
        size={size}
      >
        {buttonText || (tradeId ? 'Edit Trade' : 'Add Trade')}
      </Button>

      {isOpen && (
        <TradeForm
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSubmit={handleSubmit}
          accounts={accounts}
          strategies={strategies}
          initialData={initialData}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}
    </>
  )
}