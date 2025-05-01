import { supabase } from '@/lib/supabase'
import { TradeModal } from '@/components/trades/TradeForm'

export default async function TradesPage() {
  // fetch data
  const { data: accountsData }   = await supabase.from('accounts').select('id,name')
  const { data: strategiesData } = await supabase.from('strategies').select('id,name')

  // fall back to empty arrays if Supabase returns null
  const accounts   = accountsData   ?? []
  const strategies = strategiesData ?? []

  return (
    <div className="space-y-4">
      {/* Trade creation button + modal */}
      <TradeModal accounts={accounts} strategies={strategies} />

      {/* ➜ next sprint: Trades table goes here */}
      <p className="text-muted-foreground">Table coming next.</p>
    </div>
  )
}