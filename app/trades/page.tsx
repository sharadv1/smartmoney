import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TradeModal } from "@/components/trades/TradeModal";
import { getAccounts, getStrategies } from "@/app/actions/trade-actions";
import { fetchTrades } from "@/app/actions/fetch-actions";
import Link from "next/link";

export default async function TradesPage() {
  // Fetch accounts and strategies for the trade form
  const { data: accounts = [] } = await getAccounts();
  const { data: strategies = [] } = await getStrategies();
  
  // Fetch trades
  const { data: trades = [], pagination } = await fetchTrades({});
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Trade Logs</h1>
          <p className="text-muted-foreground">View and manage your trading activity</p>
        </div>
        <TradeModal accounts={accounts} strategies={strategies} />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter your trades by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Symbol</label>
              <Input placeholder="Search symbols..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="partial">Partially Closed</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Direction</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="all">All</option>
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Date Range</label>
              <Input type="date" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trades</CardTitle>
          <CardDescription>Your trading history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-7 bg-muted/50 p-3 text-sm font-medium">
              <div>Symbol</div>
              <div>Direction</div>
              <div>Entry Date</div>
              <div>Entry Price</div>
              <div>Status</div>
              <div>P/L</div>
              <div>Actions</div>
            </div>
            {trades.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No trades found</p>
                <TradeModal
                  accounts={accounts}
                  strategies={strategies}
                  buttonText="Add Your First Trade"
                  variant="outline"
                />
              </div>
            ) : (
              <div>
                {trades.map((trade) => (
                  <div key={trade.id} className="grid grid-cols-7 p-3 border-b hover:bg-muted/20">
                    <div>{trade.symbol}</div>
                    <div className={trade.direction === 'long' ? 'text-green-500' : 'text-red-500'}>
                      {trade.direction === 'long' ? 'Long' : 'Short'}
                    </div>
                    <div>{new Date(trade.opened_at).toLocaleDateString()}</div>
                    <div>{trade.entry_px}</div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        trade.status === 'open'
                          ? 'bg-blue-100 text-blue-800'
                          : trade.status === 'partial'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                      </span>
                    </div>
                    <div className={trade.pl && trade.pl > 0 ? 'text-green-500' : 'text-red-500'}>
                      {trade.pl ? `$${trade.pl.toFixed(2)}` : '-'}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/trades/${trade.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                      <TradeModal
                        accounts={accounts}
                        strategies={strategies}
                        tradeId={trade.id}
                        initialData={{
                          symbol: trade.symbol,
                          entryDate: new Date(trade.opened_at).toISOString().split('T')[0],
                          entryPrice: trade.entry_px.toString(),
                          quantity: trade.qty.toString(),
                          direction: trade.direction,
                          stopLoss: trade.stop_px.toString(),
                          takeProfit: trade.take_px.toString(),
                          notes: trade.notes || '',
                          accountId: trade.account.id,
                          strategyId: trade.strategy.id,
                        }}
                        buttonText="Edit"
                        variant="outline"
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
