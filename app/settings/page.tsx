import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your trading journal</p>
        </div>
      </div>

      <Tabs defaultValue="accounts">
        <TabsList className="mb-6">
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="instruments">Instruments</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
          <TabsTrigger value="import">Import/Export</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Trading Accounts</CardTitle>
                <CardDescription>Manage your trading accounts</CardDescription>
              </div>
              <Button>Add Account</Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-4 bg-muted/50 p-3 text-sm font-medium">
                  <div>Name</div>
                  <div>Broker</div>
                  <div>Created</div>
                  <div>Actions</div>
                </div>
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No accounts found</p>
                  <Button variant="outline" className="mt-4">Add Your First Account</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instruments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Instruments</CardTitle>
                <CardDescription>Manage your trading instruments</CardDescription>
              </div>
              <Button>Add Instrument</Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-4 bg-muted/50 p-3 text-sm font-medium">
                  <div>Symbol</div>
                  <div>Description</div>
                  <div>Type</div>
                  <div>Actions</div>
                </div>
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No instruments found</p>
                  <Button variant="outline" className="mt-4">Add Your First Instrument</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Strategies</CardTitle>
                <CardDescription>Manage your trading strategies</CardDescription>
              </div>
              <Button>Add Strategy</Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-3 bg-muted/50 p-3 text-sm font-medium">
                  <div>Name</div>
                  <div>Description</div>
                  <div>Actions</div>
                </div>
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No strategies found</p>
                  <Button variant="outline" className="mt-4">Add Your First Strategy</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Settings</CardTitle>
              <CardDescription>Configure AI-powered features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">OpenAI API Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">API Key</label>
                      <Input type="password" placeholder="sk-..." />
                      <p className="text-xs text-muted-foreground mt-1">Your API key is stored securely and never shared</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Model</label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">AI Features</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="auto-review" className="rounded border-gray-300" defaultChecked />
                      <label htmlFor="auto-review">Auto-generate trade reviews</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="pattern-detection" className="rounded border-gray-300" defaultChecked />
                      <label htmlFor="pattern-detection">Pattern detection</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="weekly-insights" className="rounded border-gray-300" defaultChecked />
                      <label htmlFor="weekly-insights">Weekly performance insights</label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Button>Save AI Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import/Export</CardTitle>
              <CardDescription>Import and export your trading data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Import Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Import your trading data from CSV files. The file should contain columns for symbol, entry date, entry price, quantity, direction, etc.
                  </p>
                  <div className="flex items-center gap-4">
                    <Button variant="outline">Select CSV File</Button>
                    <p className="text-sm text-muted-foreground">No file selected</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Export Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Export your trading data to CSV files for backup or analysis in other tools.
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline">Export Trades</Button>
                    <Button variant="outline">Export Journal Entries</Button>
                    <Button variant="outline">Export All Data</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
