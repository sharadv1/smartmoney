'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

type Closure = {
  id?: string
  closed_at: string
  qty: number
  price: number
  closure_type: string
  pl?: number
}

type ClosureModalProps = {
  tradeId: string
  currentClosures: Closure[]
  remainingQty: number
  onClosuresUpdated?: () => void
  buttonText?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ClosureModal({
  tradeId,
  currentClosures,
  remainingQty,
  onClosuresUpdated,
  buttonText = 'Close Position',
  variant = 'default',
  size = 'default'
}: ClosureModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [closures, setClosures] = useState<Closure[]>(currentClosures)
  const [form, setForm] = useState<Partial<Closure>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handlers for form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'qty' || name === 'price' ? Number(value) : value
    }))
  }

  // Add closure
  const handleAddClosure = async () => {
    setIsSubmitting(true)
    setError(null)
    // Validate
    if (!form.qty || !form.price || !form.closure_type || !form.closed_at) {
      setError('All fields are required')
      setIsSubmitting(false)
      return
    }
    if (form.qty! > remainingQty) {
      setError('Closure quantity exceeds remaining open units')
      setIsSubmitting(false)
      return
    }
    // TODO: Call server action to add closure
    // For now, just update local state
    setClosures((prev) => [
      ...prev,
      {
        ...form,
        id: Math.random().toString(36).slice(2),
        pl: 0 // Placeholder
      } as Closure
    ])
    setForm({})
    setIsSubmitting(false)
    if (onClosuresUpdated) onClosuresUpdated()
  }

  // Delete closure
  const handleDeleteClosure = (id: string) => {
    setClosures((prev) => prev.filter((c) => c.id !== id))
    if (onClosuresUpdated) onClosuresUpdated()
  }

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setIsOpen(true)}>
        {buttonText}
      </Button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Close Position</h2>
            <form
              onSubmit={e => {
                e.preventDefault()
                handleAddClosure()
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  name="qty"
                  value={form.qty ?? ''}
                  onChange={handleChange}
                  min={1}
                  max={remainingQty}
                  className="w-full border rounded px-2 py-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  name="price"
                  value={form.price ?? ''}
                  onChange={handleChange}
                  min={0}
                  step="0.01"
                  className="w-full border rounded px-2 py-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  name="closure_type"
                  value={form.closure_type ?? ''}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="">Select type</option>
                  <option value="normal">Normal</option>
                  <option value="stopped">Stopped</option>
                  <option value="target">Target</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="datetime-local"
                  name="closed_at"
                  value={form.closed_at ?? ''}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                  required
                />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="default" disabled={isSubmitting}>
                  Add Closure
                </Button>
              </div>
            </form>
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Existing Closures</h3>
              {closures.length === 0 ? (
                <div className="text-muted-foreground text-sm">No closures yet</div>
              ) : (
                <ul className="space-y-2">
                  {closures.map((closure) => (
                    <li key={closure.id} className="flex items-center justify-between border rounded px-2 py-1">
                      <span>
                        {closure.qty} @ ${closure.price} on {closure.closed_at} ({closure.closure_type})
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => closure.id && handleDeleteClosure(closure.id)}
                      >
                        Delete
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}