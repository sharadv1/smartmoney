'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type TradeFormProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  accounts: { id: string; name: string }[]
  strategies: { id: string; name: string }[]
  initialData?: any
  isSubmitting?: boolean
  error?: string | null
}

export function TradeForm({
  isOpen,
  onClose,
  onSubmit,
  accounts,
  strategies,
  initialData,
  isSubmitting = false,
  error = null
}: TradeFormProps) {
  const [activeTab, setActiveTab] = useState('details')
  const [tradeType, setTradeType] = useState(initialData?.tradeType || 'stock')
  const [direction, setDirection] = useState(initialData?.direction || 'long')
  
  // Form state
  const [formData, setFormData] = useState({
    symbol: initialData?.symbol || '',
    entryDate: initialData?.entryDate || new Date().toISOString().split('T')[0],
    entryPrice: initialData?.entryPrice || '',
    quantity: initialData?.quantity || '1',
    stopLoss: initialData?.stopLoss || '',
    takeProfit: initialData?.takeProfit || '',
    notes: initialData?.notes || '',
    accountId: initialData?.accountId || (accounts.length > 0 ? accounts[0].id : ''),
    strategyId: initialData?.strategyId || (strategies.length > 0 ? strategies[0].id : ''),
  })

  // Risk/reward calculations
  const calculateRiskReward = () => {
    const entryPrice = parseFloat(formData.entryPrice)
    const stopLoss = parseFloat(formData.stopLoss)
    const takeProfit = parseFloat(formData.takeProfit)
    const quantity = parseFloat(formData.quantity)

    if (isNaN(entryPrice) || isNaN(stopLoss) || isNaN(takeProfit) || isNaN(quantity)) {
      return {
        riskPerUnit: '--',
        rewardPerUnit: '--',
        totalRisk: '--',
        totalReward: '--',
        rMultiple: '--',
      }
    }

    const riskPerUnit = direction === 'long' 
      ? entryPrice - stopLoss 
      : stopLoss - entryPrice
    
    const rewardPerUnit = direction === 'long'
      ? takeProfit - entryPrice
      : entryPrice - takeProfit

    const totalRisk = riskPerUnit * quantity
    const totalReward = rewardPerUnit * quantity
    const rMultiple = riskPerUnit > 0 ? rewardPerUnit / riskPerUnit : 0

    return {
      riskPerUnit: riskPerUnit.toFixed(2),
      rewardPerUnit: rewardPerUnit.toFixed(2),
      totalRisk: totalRisk.toFixed(2),
      totalReward: totalReward.toFixed(2),
      rMultiple: rMultiple.toFixed(2),
    }
  }

  const riskReward = calculateRiskReward()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      tradeType,
      direction,
      riskReward,
    })
  }

  // Validate form
  const isFormValid = () => {
    return (
      formData.symbol.trim() !== '' &&
      formData.entryDate.trim() !== '' &&
      formData.entryPrice.trim() !== '' &&
      formData.quantity.trim() !== '' &&
      formData.stopLoss.trim() !== '' &&
      formData.takeProfit.trim() !== '' &&
      formData.accountId.trim() !== '' &&
      formData.strategyId.trim() !== ''
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{initialData ? 'Edit Trade' : 'Add New Trade'}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
              <path d="M18 6 6 18"/>
              <path d="m6 6 12 12"/>
            </svg>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Trade Details</TabsTrigger>
            <TabsTrigger value="notes" className="flex-1">Notes & Images</TabsTrigger>
          </TabsList>

          {error && (
            <div className="mx-6 mt-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <TabsContent value="details" className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Trade Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Trade Type</label>
                      <div className="grid grid-cols-5 gap-2">
                        {['Stock', 'Futures', 'Forex', 'Crypto', 'Options'].map(type => (
                          <Button
                            key={type}
                            type="button"
                            variant={tradeType === type.toLowerCase() ? 'default' : 'outline'}
                            onClick={() => setTradeType(type.toLowerCase())}
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Symbol</label>
                      <Input
                        name="symbol"
                        value={formData.symbol}
                        onChange={handleInputChange}
                        placeholder="Enter symbol..."
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Direction</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={direction === 'long' ? 'default' : 'outline'}
                          onClick={() => setDirection('long')}
                        >
                          Long
                        </Button>
                        <Button
                          type="button"
                          variant={direction === 'short' ? 'default' : 'outline'}
                          onClick={() => setDirection('short')}
                        >
                          Short
                        </Button>
                      </div>
    
                      <div>
                        <label className="text-sm font-medium mb-1 block">Account</label>
                        <select
                          name="accountId"
                          value={formData.accountId}
                          onChange={(e) => setFormData(prev => ({ ...prev, accountId: e.target.value }))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          required
                        >
                          {accounts.length === 0 ? (
                            <option value="">No accounts available</option>
                          ) : (
                            accounts.map(account => (
                              <option key={account.id} value={account.id}>
                                {account.name}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
    
                      <div>
                        <label className="text-sm font-medium mb-1 block">Strategy</label>
                        <select
                          name="strategyId"
                          value={formData.strategyId}
                          onChange={(e) => setFormData(prev => ({ ...prev, strategyId: e.target.value }))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          required
                        >
                          {strategies.length === 0 ? (
                            <option value="">No strategies available</option>
                          ) : (
                            strategies.map(strategy => (
                              <option key={strategy.id} value={strategy.id}>
                                {strategy.name}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Entry Date</label>
                      <Input
                        type="datetime-local"
                        name="entryDate"
                        value={formData.entryDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Entry Price</label>
                        <Input
                          type="number"
                          step="0.01"
                          name="entryPrice"
                          value={formData.entryPrice}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Quantity</label>
                        <Input
                          type="number"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          placeholder="1"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Risk & Reward</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Initial Stop Loss</label>
                        <Input
                          type="number"
                          step="0.01"
                          name="stopLoss"
                          value={formData.stopLoss}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Take Profit</label>
                        <Input
                          type="number"
                          step="0.01"
                          name="takeProfit"
                          value={formData.takeProfit}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Risk/Reward Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">R:R Ratio</p>
                            <p className="text-xl font-bold">{riskReward.rMultiple}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Risk ($)</p>
                            <p className="text-xl font-bold">${riskReward.totalRisk}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Reward ($)</p>
                            <p className="text-xl font-bold">${riskReward.totalReward}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Notes</h3>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full h-40 p-3 border rounded-md"
                    placeholder="Add your trade notes here..."
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Images</h3>
                  <div className="border-2 border-dashed rounded-md p-8 text-center">
                    <p className="text-muted-foreground">
                      Drag and drop images or videos here, or click to select files
                    </p>
                    <Button variant="outline" className="mt-4">
                      Select Files
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <div className="flex justify-end gap-2 p-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !isFormValid()}>
                {isSubmitting ? 'Saving...' : 'Save Trade'}
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  )
}
