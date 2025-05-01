'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem,
} from '@/components/ui/select'
import { Modal, ModalTrigger, ModalContent } from '@/components/ui/modal'

/* ---------- validation schema ---------- */
const tradeSchema = z.object({
  instrument_id: z.string().uuid(),
  opened_at: z.coerce.date(),
  qty: z.coerce.number().positive(),
  direction: z.enum(['long', 'short']),
  entry_px: z.coerce.number().positive(),
  stop_px:  z.coerce.number().positive(),
  take_px:  z.coerce.number().positive(),
  account_id:  z.string().uuid(),
  strategy_id: z.string().uuid(),
})
type FormVals = z.infer<typeof tradeSchema>

/* ---------- component ---------- */
export function TradeModal({
  accounts,
  strategies,
}: {
  accounts: { id: string; name: string }[]
  strategies: { id: string; name: string }[]
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<FormVals>({
    resolver: zodResolver(tradeSchema),
    mode: 'onChange',
  })

  /* live risk / reward math */
  const v = useWatch({ control })
  const perUnitRisk   = Math.abs((v?.entry_px ?? 0) - (v?.stop_px ?? 0))
  const totalRisk     = perUnitRisk * (v?.qty ?? 0)
  const perUnitReward = Math.abs((v?.take_px ?? 0) - (v?.entry_px ?? 0))
  const totalReward   = perUnitReward * (v?.qty ?? 0)
  const rMultiple     = perUnitRisk ? (perUnitReward / perUnitRisk).toFixed(2) : '—'

  async function onSubmit(data: FormVals) {
    const { error } = await supabase.from('trades').insert(data)
    if (error) alert(error.message)
    else window.location.reload()
  }

  return (
    <Modal>
      <ModalTrigger asChild>
        <Button size="sm">New trade</Button>
      </ModalTrigger>

      <ModalContent className="max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 md:grid-cols-2">
          <Input label="Opened at" type="datetime-local" {...register('opened_at')} />
          <Input label="Quantity"      {...register('qty')} />
          <Input label="Entry price"   {...register('entry_px')} />
          <Input label="Stop price"    {...register('stop_px')} />
          <Input label="Take-profit"   {...register('take_px')} />

          <Select {...register('direction')}>
            <SelectTrigger><SelectValue placeholder="Side" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="long">Long</SelectItem>
              <SelectItem value="short">Short</SelectItem>
            </SelectContent>
          </Select>

          <Select {...register('account_id')}>
            <SelectTrigger><SelectValue placeholder="Account" /></SelectTrigger>
            <SelectContent>
              {accounts.map(a => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select {...register('strategy_id')}>
            <SelectTrigger><SelectValue placeholder="Strategy" /></SelectTrigger>
            <SelectContent>
              {strategies.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* live risk panel */}
          <aside className="rounded-xl border p-4 shadow-sm md:col-span-2">
            <h3 className="font-semibold mb-2">Risk / Reward</h3>
            <ul className="text-sm grid grid-cols-2 gap-1">
              <li>Risk $ <strong>{totalRisk || '—'}</strong></li>
              <li>Reward $ <strong>{totalReward || '—'}</strong></li>
              <li>R-multiple <strong>{rMultiple}</strong></li>
            </ul>
          </aside>

          <Button disabled={!isValid || isSubmitting} className="md:col-span-2">
            Save trade
          </Button>
        </form>
      </ModalContent>
    </Modal>
  )
}