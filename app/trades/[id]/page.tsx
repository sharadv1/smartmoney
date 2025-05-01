import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export default async function TradeDetail({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params

  const { data: trade, error } = await supabase
    .from('trades')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !trade) {
    notFound()
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Trade&nbsp;{trade.symbol}</h1>
      <pre className="bg-muted/50 p-4 rounded-lg">
        {JSON.stringify(trade, null, 2)}
      </pre>
    </div>
  )
}