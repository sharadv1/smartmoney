import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchTradeById } from "@/app/actions/fetch-actions";
import { getAccounts, getStrategies } from "@/app/actions/trade-actions";

import Link from "next/link";
import { notFound } from "next/navigation";

export default async function TradeDetail({
    params,
  }: {
    params: { id: string };
  }) {
    const { id } = params;

  // Fetch the trade
  const { success, data: trade, error } = await fetchTradeById(params.id);
  
  // Fetch accounts and strategies for the trade form
  const { data: accounts = [] } = await getAccounts();
  const { data: strategies = [] } = await getStrategies();
  
  if (!success || !trade) {
    notFound();
  }
  
  // Format the trade data for the form
  const initialData = {
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
  };
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{trade.symbol} Trade</h1>
          <p className="text-muted-foreground">
            {trade.direction === 'long' ? 'Long' : 'Short'} position opened on {new Date(trade.opened_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/trades">
            <Button variant="outline">Back to Trades</Button>
          </Link>
          <TradeModal 
            accounts={accounts} 
            strategies={strategies} 
            initialData={initialData}
            tradeId={params.id}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status</CardDescription>
            <CardTitle className="text-2xl">
              <span className={`px-2 py-1 rounded-full text-xs ${
                trade.status === 'open' 
                  ? 'bg-blue-100 text-blue-800' 
                  : trade.status === 'partial' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
              }`}>
                {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>P&L</CardDescription>
            <CardTitle className={`text-2xl ${trade.pl && trade.pl > 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${trade.pl?.toFixed(2) || '0.00'}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>R-Multiple</CardDescription>
            <CardTitle className="text-2xl">
              {trade.r_multiple.toFixed(2)}R
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Trade Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="font-medium">Symbol:</dt>
                <dd>{trade.symbol}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Direction:</dt>
                <dd className={trade.direction === 'long' ? 'text-green-500' : 'text-red-500'}>
                  {trade.direction === 'long' ? 'Long' : 'Short'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Entry Date:</dt>
                <dd>{new Date(trade.opened_at).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Entry Price:</dt>
                <dd>${trade.entry_px}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Quantity:</dt>
                <dd>{trade.qty}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Stop Loss:</dt>
                <dd>${trade.stop_px}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Take Profit:</dt>
                <dd>${trade.take_px}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Account:</dt>
                <dd>{trade.account.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Strategy:</dt>
                <dd>{trade.strategy.name}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {trade.notes ? (
              <p>{trade.notes}</p>
            ) : (
              <p className="text-muted-foreground">No notes for this trade</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Trade Closures</CardTitle>
          <CardDescription>History of position closures</CardDescription>
        </CardHeader>
        <CardContent>
          {trade.closures && trade.closures.length > 0 ? (
            <div className="rounded-md border">
              <div className="grid grid-cols-5 bg-muted/50 p-3 text-sm font-medium">
                <div>Date</div>
                <div>Quantity</div>
                <div>Price</div>
                <div>Type</div>
                <div>P&L</div>
              </div>
              {trade.closures.map((closure) => (
                <div key={closure.id} className="grid grid-cols-5 p-3 border-t">
                  <div>{new Date(closure.closed_at).toLocaleString()}</div>
                  <div>{closure.qty}</div>
                  <div>${closure.price}</div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      closure.closure_type === 'normal' 
                        ? 'bg-blue-100 text-blue-800' 
                        : closure.closure_type === 'stopped' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {closure.closure_type.charAt(0).toUpperCase() + closure.closure_type.slice(1)}
                    </span>
                  </div>
                  <div className={closure.pl > 0 ? 'text-green-500' : 'text-red-500'}>
                    ${closure.pl.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-muted-foreground">No closures for this trade yet</p>
              <Button variant="outline" className="mt-4">Close Position</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}