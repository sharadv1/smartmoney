'use server'

import { revalidatePath } from 'next/cache'
import { supabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// Define types
export type TradeFormData = {
  symbol: string
  entryDate: string
  entryPrice: string
  quantity: string
  direction: 'long' | 'short'
  stopLoss: string
  takeProfit: string
  notes: string
  accountId: string
  strategyId: string
}

// Validation schema
const tradeSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  entryDate: z.string().min(1, 'Entry date is required'),
  entryPrice: z.string().min(1, 'Entry price is required'),
  quantity: z.string().min(1, 'Quantity is required'),
  direction: z.enum(['long', 'short']),
  stopLoss: z.string().min(1, 'Stop loss is required'),
  takeProfit: z.string().min(1, 'Take profit is required'),
  notes: z.string().optional(),
  accountId: z.string().min(1, 'Account is required'),
  strategyId: z.string().min(1, 'Strategy is required'),
})

// Get instrument ID or create if it doesn't exist
async function getOrCreateInstrument(symbol: string, userId: string) {
  // First check if instrument exists
  const { data: existingInstrument } = await supabaseServer
    .from('instruments')
    .select('id')
    .eq('symbol', symbol)
    .single()

  if (existingInstrument) {
    return existingInstrument.id
  }

  // Create new instrument
  const { data: newInstrument, error } = await supabaseServer
    .from('instruments')
    .insert({ symbol, description: symbol })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to create instrument: ${error.message}`)
  }

  return newInstrument.id
}

// Create a new trade
export async function createTrade(formData: TradeFormData) {
  try {
    // Get current user
    const { data: { user } } = await supabaseServer.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Validate form data
    const validatedData = tradeSchema.parse(formData)
    
    // Get or create instrument
    const instrumentId = await getOrCreateInstrument(validatedData.symbol, user.id)
    
    // Insert trade
    const { data: trade, error } = await supabaseServer
      .from('trades')
      .insert({
        user_id: user.id,
        instrument_id: instrumentId,
        account_id: validatedData.accountId,
        strategy_id: validatedData.strategyId,
        opened_at: new Date(validatedData.entryDate).toISOString(),
        direction: validatedData.direction,
        qty: parseFloat(validatedData.quantity),
        entry_px: parseFloat(validatedData.entryPrice),
        stop_px: parseFloat(validatedData.stopLoss),
        take_px: parseFloat(validatedData.takeProfit),
        notes: validatedData.notes,
      })
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to create trade: ${error.message}`)
    }
    
    // Revalidate the trades page
    revalidatePath('/trades')
    revalidatePath('/dashboard')
    
    return { success: true, data: trade }
  } catch (error) {
    console.error('Error creating trade:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }
  }
}

// Update an existing trade
export async function updateTrade(tradeId: string, formData: TradeFormData) {
  try {
    // Get current user
    const { data: { user } } = await supabaseServer.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Validate form data
    const validatedData = tradeSchema.parse(formData)
    
    // Get or create instrument
    const instrumentId = await getOrCreateInstrument(validatedData.symbol, user.id)
    
    // Update trade
    const { data: trade, error } = await supabaseServer
      .from('trades')
      .update({
        instrument_id: instrumentId,
        account_id: validatedData.accountId,
        strategy_id: validatedData.strategyId,
        opened_at: new Date(validatedData.entryDate).toISOString(),
        direction: validatedData.direction,
        qty: parseFloat(validatedData.quantity),
        entry_px: parseFloat(validatedData.entryPrice),
        stop_px: parseFloat(validatedData.stopLoss),
        take_px: parseFloat(validatedData.takeProfit),
        notes: validatedData.notes,
      })
      .eq('id', tradeId)
      .eq('user_id', user.id) // Security check
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to update trade: ${error.message}`)
    }
    
    // Revalidate the trades page
    revalidatePath('/trades')
    revalidatePath('/dashboard')
    
    return { success: true, data: trade }
  } catch (error) {
    console.error('Error updating trade:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }
  }
}

// Delete a trade
export async function deleteTrade(tradeId: string) {
  try {
    // Get current user
    const { data: { user } } = await supabaseServer.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    // First check if there are any trade closures
    const { data: closures } = await supabaseServer
      .from('trade_closures')
      .select('id')
      .eq('trade_id', tradeId)
    
    // Delete any closures first
    if (closures && closures.length > 0) {
      const { error: closureError } = await supabaseServer
        .from('trade_closures')
        .delete()
        .eq('trade_id', tradeId)
      
      if (closureError) {
        throw new Error(`Failed to delete trade closures: ${closureError.message}`)
      }
    }
    
    // Delete the trade
    const { error } = await supabaseServer
      .from('trades')
      .delete()
      .eq('id', tradeId)
      .eq('user_id', user.id) // Security check
    
    if (error) {
      throw new Error(`Failed to delete trade: ${error.message}`)
    }
    
    // Revalidate the trades page
    revalidatePath('/trades')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting trade:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }
  }
}

// Close a trade (fully or partially)
export async function closeTrade(
  tradeId: string, 
  data: { 
    closedAt: string, 
    quantity: string, 
    price: string, 
    fee?: string, 
    closureType: 'normal' | 'stopped' | 'target' 
  }
) {
  try {
    // Get current user
    const { data: { user } } = await supabaseServer.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    // Validate the trade belongs to the user
    const { data: trade, error: tradeError } = await supabaseServer
      .from('trades')
      .select('id, qty')
      .eq('id', tradeId)
      .eq('user_id', user.id)
      .single()
    
    if (tradeError || !trade) {
      throw new Error('Trade not found or access denied')
    }
    
    // Get total quantity already closed
    const { data: closures, error: closuresError } = await supabaseServer
      .from('trade_closures')
      .select('qty')
      .eq('trade_id', tradeId)
    
    if (closuresError) {
      throw new Error(`Failed to fetch trade closures: ${closuresError.message}`)
    }
    
    const totalClosedQty = closures?.reduce((sum, closure) => sum + parseFloat(closure.qty.toString()), 0) || 0
    const remainingQty = parseFloat(trade.qty.toString()) - totalClosedQty
    const closingQty = parseFloat(data.quantity)
    
    if (closingQty > remainingQty) {
      throw new Error(`Cannot close more than the remaining quantity (${remainingQty})`)
    }
    
    // Insert trade closure
    const { data: closure, error } = await supabaseServer
      .from('trade_closures')
      .insert({
        trade_id: tradeId,
        closed_at: new Date(data.closedAt).toISOString(),
        qty: closingQty,
        price: parseFloat(data.price),
        fee: data.fee ? parseFloat(data.fee) : 0,
        closure_type: data.closureType,
      })
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to close trade: ${error.message}`)
    }
    
    // Revalidate the trades page
    revalidatePath('/trades')
    revalidatePath('/dashboard')
    
    return { success: true, data: closure }
  } catch (error) {
    console.error('Error closing trade:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }
  }
}

// Get accounts for the current user
export async function getAccounts() {
  try {
    // Get current user
    const { data: { user } } = await supabaseServer.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const { data, error } = await supabaseServer
      .from('accounts')
      .select('id, name, broker')
      .eq('user_id', user.id)
      .order('name')
    
    if (error) {
      throw new Error(`Failed to fetch accounts: ${error.message}`)
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      data: [] 
    }
  }
}

// Get strategies for the current user
export async function getStrategies() {
  try {
    // Get current user
    const { data: { user } } = await supabaseServer.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const { data, error } = await supabaseServer
      .from('strategies')
      .select('id, name, description')
      .eq('user_id', user.id)
      .order('name')
    
    if (error) {
      throw new Error(`Failed to fetch strategies: ${error.message}`)
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching strategies:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      data: [] 
    }
  }
}

// Get instruments
export async function getInstruments() {
  try {
    const { data, error } = await supabaseServer
      .from('instruments')
      .select('id, symbol, description')
      .order('symbol')
    
    if (error) {
      throw new Error(`Failed to fetch instruments: ${error.message}`)
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching instruments:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      data: [] 
    }
  }
}