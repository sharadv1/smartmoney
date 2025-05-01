import { supabase } from '@/lib/supabase'
import { TradeModal } from '@/components/trades/TradeForm'

export default async function TradesPage() {
  /* fetch dropdown data at build-time */
  const { data: accounts = [] }   = await supabase.from('accounts').select('id,name')
  const { data: strategies = [] } = await supabase.from('strategies').select('id,name')

  return (
    <div className="space-y-4">
      {/* Trade creation button + modal */}
      <TradeModal accounts={accounts} strategies={strategies} />

      {/* ➜ next sprint: Trades table goes here */}
      <p className="text-muted-foreground">Table coming next.</p>
    </div>
  )
}