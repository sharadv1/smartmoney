'use client'

import { useForm, useWatch, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createTrade } from '@/app/actions/trade-actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem,
} from '@/components/ui/select'
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog'
import { useState } from 'react'
import { useToast } from '@/components/ui/toast'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// Custom Input wrapper with error handling
const InputWithError = ({ error, ...props }: { error?: string } & React.ComponentProps<typeof Input>) => (
  <div className="space-y-1">
    <Input {...props} />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
)

/* ---------- validation schema ---------- */
const tradeSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  opened_at: z.date({
    required_error: 'Entry date is required',
  }),
  qty: z.number({
    required_error: 'Quantity is required',
  }).positive('Quantity must be positive'),
  direction: z.enum(['long', 'short']),
  entry_px: z.number({
    required_error: 'Entry price is required',
  }).positive('Price must be positive'),
  stop_px: z.number({
    required_error: 'Stop price is required',
  }).positive('Price must be positive'),
  take_px: z.number({
    required_error: 'Take profit is required',
  }).positive('Price must be positive'),
  account_id: z.string().uuid('Account is required'),
  strategy_id: z.string().uuid('Strategy is required'),
  notes: z.string().optional(),
})

type FormVals = z.infer<typeof tradeSchema>

export function TradeModal({
  accounts,
  strategies,
}: {
  accounts: { id: string; name: string }[]
  strategies: { id: string; name: string }[]
}) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const {
    register,
    control,
    handleSubmit,
    formState: { isValid, isSubmitting, errors },
    reset,
    setValue,
  } = useForm<FormVals>({
    resolver: zodResolver(tradeSchema),
    mode: 'onChange',
  })

  /* live risk / reward math */
  const v = useWatch({ control })
  const perUnitRisk = Math.abs((v?.entry_px ?? 0) - (v?.stop_px ?? 0))
  const totalRisk = perUnitRisk * (v?.qty ?? 0)
  const perUnitReward = Math.abs((v?.take_px ?? 0) - (v?.entry_px ?? 0))
  const totalReward = perUnitReward * (v?.qty ?? 0)
  const rMultiple = perUnitRisk ? (perUnitReward / perUnitRisk).toFixed(2) : '—'

  async function onSubmit(data: FormVals) {
    try {
      const result = await createTrade({
        symbol: data.symbol,
        entryDate: data.opened_at.toISOString(),
        entryPrice: data.entry_px.toString(),
        quantity: data.qty.toString(),
        direction: data.direction,
        stopLoss: data.stop_px.toString(),
        takeProfit: data.take_px.toString(),
        accountId: data.account_id,
        strategyId: data.strategy_id,
        notes: data.notes,
      })

      if (result.success) {
        toast({
          title: 'Trade created',
          description: 'Your trade has been successfully recorded',
        })
        setIsOpen(false)
        reset()
      } else {
        toast({
          title: 'Error creating trade',
          description: result.error,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error creating trade',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">New trade</Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
          {/* Symbol */}
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol</Label>
            <InputWithError
              id="symbol"
              {...register('symbol')}
              placeholder="AAPL"
              error={errors.symbol?.message}
            />
          </div>

          {/* Entry Date */}
          <div className="space-y-2">
            <Label htmlFor="opened_at">Entry Date</Label>
            <Controller
              name="opened_at"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      {field.value ? format(field.value, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="qty">Quantity</Label>
            <InputWithError
              id="qty"
              type="number"
              step="0.01"
              {...register('qty', { valueAsNumber: true })}
              placeholder="100"
              error={errors.qty?.message}
            />
          </div>

          {/* Entry Price */}
          <div className="space-y-2">
            <Label htmlFor="entry_px">Entry Price</Label>
            <InputWithError
              id="entry_px"
              type="number"
              step="0.01"
              {...register('entry_px', { valueAsNumber: true })}
              placeholder="150.50"
              error={errors.entry_px?.message}
            />
          </div>

          {/* Stop Price */}
          <div className="space-y-2">
            <Label htmlFor="stop_px">Stop Price</Label>
            <InputWithError
              id="stop_px"
              type="number"
              step="0.01"
              {...register('stop_px', { valueAsNumber: true })}
              placeholder="145.00"
              error={errors.stop_px?.message}
            />
          </div>

          {/* Take Profit */}
          <div className="space-y-2">
            <Label htmlFor="take_px">Take Profit</Label>
            <InputWithError
              id="take_px"
              type="number"
              step="0.01"
              {...register('take_px', { valueAsNumber: true })}
              placeholder="160.00"
              error={errors.take_px?.message}
            />
          </div>

          {/* Direction */}
          <div className="space-y-2">
            <Label htmlFor="direction">Direction</Label>
            <Select {...register('direction')}>
              <SelectTrigger>
                <SelectValue placeholder="Select direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="long">Long</SelectItem>
                <SelectItem value="short">Short</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Account */}
          <div className="space-y-2">
            <Label htmlFor="account_id">Account</Label>
            <Select {...register('account_id')}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Strategy */}
          <div className="space-y-2">
            <Label htmlFor="strategy_id">Strategy</Label>
            <Select {...register('strategy_id')}>
              <SelectTrigger>
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                {strategies.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              {...register('notes')}
              placeholder="Optional trade notes"
            />
          </div>

          {/* Enhanced Risk/Reward Panel */}
          <div className="rounded-xl border p-4 shadow-sm md:col-span-2">
            <h3 className="font-semibold mb-3">Risk/Reward Analysis</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Risk per unit</p>
                <p className="font-medium">${perUnitRisk.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Reward per unit</p>
                <p className="font-medium">${perUnitReward.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">R-multiple</p>
                <p className="font-medium">{rMultiple}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total risk</p>
                <p className="font-medium">${totalRisk.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total reward</p>
                <p className="font-medium">${totalReward.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Risk:Reward</p>
                <p className="font-medium">1:{perUnitRisk ? (perUnitReward / perUnitRisk).toFixed(2) : '—'}</p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="md:col-span-2"
          >
            {isSubmitting ? 'Saving...' : 'Save Trade'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}