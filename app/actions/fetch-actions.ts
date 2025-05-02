'use server'

import { supabaseServer } from '@/lib/supabase/server'

// Define types
export type Trade = {
  id: string
  symbol: string
  direction: 'long' | 'short'
  opened_at: string
  entry_px: number
  status: 'open' | 'partial' | 'closed'
  account: { id: string, name: string }
  strategy: { id: string, name: string }
  instrument: { id: string, symbol: string }
  qty: number
  stop_px: number
  take_px: number
  risk_total: number
  reward_total: number
  r_multiple: number
  notes?: string
  pl?: number
}

export type TradeWithClosures = Trade & {
  closures: {
    id: string
    closed_at: string
    qty: number
    price: number
    fee: number
    closure_type: string
    pl: number
  }[]
}

// Type for raw Supabase response
type RawTradeResponse = {
  id: string
  direction: 'long' | 'short'
  opened_at: string
  entry_px: number
  qty: number
  stop_px: number
  take_px: number
  status: 'open' | 'partial' | 'closed'
  risk_total: number
  reward_total: number
  r_multiple: number
  notes?: string
  account: { id: string, name: string }
  strategy: { id: string, name: string }
  instrument: { id: string, symbol: string }
}

// Fetch trades with filters
export async function fetchTrades({
  status,
  direction,
  symbol,
  dateFrom,
  dateTo,
  page = 1,
  pageSize = 10
}: {
  status?: 'open' | 'closed' | 'partial'
  direction?: 'long' | 'short'
  symbol?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}) {
  try {
    // Get current user
    const { data: { user } } = await supabaseServer.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    // Build query
    let query = supabaseServer
      .from('trades')
      .select(`
        id,
        direction,
        opened_at,
        entry_px,
        qty,
        stop_px,
        take_px,
        status,
        risk_total,
        reward_total,
        r_multiple,
        notes,
        account:account_id(name),
        strategy:strategy_id(name),
        instrument:instrument_id(symbol)
      `)
      .eq('user_id', user.id)
      .order('opened_at', { ascending: false })
    
    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    
    if (direction) {
      query = query.eq('direction', direction)
    }
    
    if (symbol) {
      query = query.eq('instrument.symbol', symbol)
    }
    
    if (dateFrom) {
      query = query.gte('opened_at', dateFrom)
    }
    
    if (dateTo) {
      query = query.lte('opened_at', dateTo)
    }
    
    // Calculate pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    
    // Execute query with pagination
    const { data: rawTrades, error, count } = await query
      .range(from, to)
    
    if (error) {
      throw new Error(`Failed to fetch trades: ${error.message}`)
    }
    
    // Transform the raw trades data to match our type
    const trades: Trade[] = rawTrades.map(rawTrade => {
      // Use type assertion to handle the Supabase response structure
      const instrumentData = rawTrade.instrument as unknown as { id: string; symbol: string };
      const accountData = rawTrade.account as unknown as { id: string; name: string };
      const strategyData = rawTrade.strategy as unknown as { id: string; name: string };
      
      return {
        id: rawTrade.id,
        symbol: instrumentData.symbol,
        direction: rawTrade.direction,
        opened_at: rawTrade.opened_at,
        entry_px: rawTrade.entry_px,
        qty: rawTrade.qty,
        stop_px: rawTrade.stop_px,
        take_px: rawTrade.take_px,
        status: rawTrade.status,
        risk_total: rawTrade.risk_total,
        reward_total: rawTrade.reward_total,
        r_multiple: rawTrade.r_multiple,
        notes: rawTrade.notes,
        account: {
          id: accountData.id || '',
          name: accountData.name || ''
        },
        strategy: {
          id: strategyData.id || '',
          name: strategyData.name || ''
        },
        instrument: {
          id: instrumentData.id || '',
          symbol: instrumentData.symbol || ''
        }
      };
    });
    
    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabaseServer
      .from('trades')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    
    if (countError) {
      throw new Error(`Failed to count trades: ${countError.message}`)
    }
    
    return {
      success: true,
      data: trades,
      pagination: {
        page,
        pageSize,
        totalCount: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / pageSize)
      }
    }
  } catch (error) {
    console.error('Error fetching trades:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      data: [],
      pagination: {
        page: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0
      }
    }
  }
}

// Fetch a single trade with its closures
export async function fetchTradeById(tradeId: string) {
  try {
    // Get current user
    const { data: { user } } = await supabaseServer.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    // Fetch the trade
    const { data: rawTrade, error } = await supabaseServer
      .from('trades')
      .select(`
        id,
        direction,
        opened_at,
        entry_px,
        qty,
        stop_px,
        take_px,
        status,
        risk_total,
        reward_total,
        r_multiple,
        notes,
        account:account_id(id, name),
        strategy:strategy_id(id, name),
        instrument:instrument_id(id, symbol)
      `)
      .eq('id', tradeId)
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      throw new Error(`Failed to fetch trade: ${error.message}`)
    }
    
    // Fetch the trade closures
    const { data: closures, error: closuresError } = await supabaseServer
      .from('trade_closures')
      .select('id, closed_at, qty, price, fee, closure_type, pl')
      .eq('trade_id', tradeId)
      .order('closed_at', { ascending: true })
    
    if (closuresError) {
      throw new Error(`Failed to fetch trade closures: ${closuresError.message}`)
    }
    
    // Calculate total P&L
    const totalPL = closures?.reduce((sum, closure) => sum + parseFloat(closure.pl.toString()), 0) || 0
    
    // Use type assertion to handle the Supabase response structure
    const instrumentData = rawTrade.instrument as unknown as { id: string; symbol: string };
    const accountData = rawTrade.account as unknown as { id: string; name: string };
    const strategyData = rawTrade.strategy as unknown as { id: string; name: string };
    
    // Transform the raw trade data to match our type
    const trade: TradeWithClosures = {
      id: rawTrade.id,
      symbol: instrumentData.symbol,
      direction: rawTrade.direction,
      opened_at: rawTrade.opened_at,
      entry_px: rawTrade.entry_px,
      qty: rawTrade.qty,
      stop_px: rawTrade.stop_px,
      take_px: rawTrade.take_px,
      status: rawTrade.status,
      risk_total: rawTrade.risk_total,
      reward_total: rawTrade.reward_total,
      r_multiple: rawTrade.r_multiple,
      notes: rawTrade.notes,
      account: {
        id: accountData.id,
        name: accountData.name
      },
      strategy: {
        id: strategyData.id,
        name: strategyData.name
      },
      instrument: {
        id: instrumentData.id,
        symbol: instrumentData.symbol
      },
      closures: closures || [],
      pl: totalPL
    }
    
    return {
      success: true,
      data: trade
    }
  } catch (error) {
    console.error('Error fetching trade:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    }
  }
}

// Fetch dashboard stats for a user
export async function fetchDashboardStats(userId: string) {
  try {
    // Fetch total P&L
    const { data: plData, error: plError } = await supabaseServer
      .from('trade_closures')
      .select(`
        pl,
        trade:trade_id(user_id)
      `)
      .eq('trade.user_id', userId)
    
    if (plError) {
      throw new Error(`Failed to fetch P&L data: ${plError.message}`)
    }
    
    const totalPL = plData?.reduce((sum, item) => sum + parseFloat(item.pl.toString()), 0) || 0
    
    // Fetch win rate
    const { data: tradesData, error: tradesError } = await supabaseServer
      .from('trades')
      .select(`
        id,
        closures:trade_closures(pl)
      `)
      .eq('user_id', userId)
      .not('status', 'eq', 'open')
    
    if (tradesError) {
      throw new Error(`Failed to fetch trades data: ${tradesError.message}`)
    }
    
    const totalTrades = tradesData?.length || 0
    const winningTrades = tradesData?.filter(trade => {
      const tradePL = trade.closures?.reduce((sum, closure) => sum + parseFloat(closure.pl.toString()), 0) || 0
      return tradePL > 0
    }).length || 0
    
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
    
    // Fetch average R multiple
    const { data: rData, error: rError } = await supabaseServer
      .from('trades')
      .select('r_multiple')
      .eq('user_id', userId)
      .not('status', 'eq', 'open')
    
    if (rError) {
      throw new Error(`Failed to fetch R multiple data: ${rError.message}`)
    }
    
    const avgRMultiple = rData?.length > 0
      ? rData.reduce((sum, item) => sum + parseFloat(item.r_multiple.toString()), 0) / rData.length
      : 0
    
    return { 
      success: true, 
      data: {
        totalPL,
        winRate,
        avgRMultiple,
        totalTrades,
        winningTrades,
        losingTrades: totalTrades - winningTrades
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      data: {
        totalPL: 0,
        winRate: 0,
        avgRMultiple: 0,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0
      }
    }
  }
}

// Fetch recent trades for a user's dashboard
export async function fetchRecentTrades(userId: string, limit = 5) {
  try {
    const { data: rawTrades, error } = await supabaseServer
      .from('trades')
      .select(`
        id,
        direction,
        opened_at,
        entry_px,
        status,
        instrument:instrument_id(id, symbol),
        closures:trade_closures(pl)
      `)
      .eq('user_id', userId)
      .order('opened_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      throw new Error(`Failed to fetch recent trades: ${error.message}`)
    }
    
    // Transform and calculate P&L for each trade
    const trades = rawTrades.map(rawTrade => {
      const pl = rawTrade.closures?.reduce((sum, closure) => sum + parseFloat(closure.pl.toString()), 0) || 0
      
      // Use type assertion to handle the Supabase response structure
      const instrumentData = rawTrade.instrument as unknown as { id: string; symbol: string };
      
      return {
        id: rawTrade.id,
        symbol: instrumentData.symbol,
        direction: rawTrade.direction,
        opened_at: rawTrade.opened_at,
        entry_px: rawTrade.entry_px,
        status: rawTrade.status,
        // Add missing properties to match Trade type
        account: { id: '', name: '' },
        strategy: { id: '', name: '' },
        qty: 0,
        stop_px: 0,
        take_px: 0,
        risk_total: 0,
        reward_total: 0,
        r_multiple: 0,
        instrument: {
          id: instrumentData.id || '',
          symbol: instrumentData.symbol || ''
        },
        pl
      };
    });
    
    return { success: true, data: trades }
  } catch (error) {
    console.error('Error fetching recent trades:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      data: []
    }
  }
}