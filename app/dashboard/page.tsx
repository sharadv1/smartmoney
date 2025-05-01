import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TradeModal } from '@/components/trades/TradeForm';
import { getAccounts, getStrategies } from "@/app/actions/trade-actions";
import { fetchDashboardStats, fetchRecentTrades } from "@/app/actions/fetch-actions";
import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Check authentication
  const user = await getUser();
  if (!user) {
    redirect('/auth/login');
  }

  // Fetch accounts and strategies for the trade form
  const { data: accounts = [] } = await getAccounts();
  const { data: strategies = [] } = await getStrategies();
  
  // Fetch dashboard stats
  const { data: stats } = await fetchDashboardStats();
  
  // Fetch recent trades
  const { data: recentTrades = [] } = await fetchRecentTrades(5);
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Your trading performance at a glance</p>
        </div>
        <Button>Add Trade</Button>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Profit Factor</CardDescription>
            <CardTitle className="text-2xl">2.80</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-500">+0.3%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Win Rate</CardDescription>
            <CardTitle className="text-2xl">{stats.winRate.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{stats.winningTrades} / {stats.totalTrades} trades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg R-Multiple</CardDescription>
            <CardTitle className="text-2xl">{stats.avgRMultiple.toFixed(2)}R</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Average reward/risk ratio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pareto Index</CardDescription>
            <CardTitle className="text-2xl">0.72</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Stable</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Win Rate</CardDescription>
            <CardTitle className="text-2xl">68.5%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-500">+2.5%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Weekly P&L</CardDescription>
            <CardTitle className="text-2xl">$0.00</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No trades this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Placeholder */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Performance Calendar</CardTitle>
          <CardDescription>Daily P&L for April 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/20 rounded-md">
            <p className="text-muted-foreground">Calendar visualization will be implemented here</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Trades */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
          <CardDescription>Your most recent trading activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {recentTrades.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-muted-foreground">No recent trades found</p>
                <TradeModal
                  accounts={accounts}
                  strategies={strategies}
                />
              </div>
            ) : (
              <div>
                {recentTrades.map((trade) => (
                  <div key={trade.id} className="grid grid-cols-5 p-3 border-b hover:bg-muted/20">
                    <div>{trade.symbol}</div>
                    <div className={trade.direction === 'long' ? 'text-green-500' : 'text-red-500'}>
                      {trade.direction === 'long' ? 'Long' : 'Short'}
                    </div>
                    <div>{new Date(trade.opened_at).toLocaleDateString()}</div>
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
                    <div className="flex gap-2">
                      <Link href={`/trades/${trade.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
                <div className="p-3 text-center">
                  <Link href="/trades">
                    <Button variant="outline">View All Trades</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
