import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function JournalPage() {
  const currentWeek = {
    start: "Apr 27",
    end: "May 3, 2025",
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Journal</h1>
          <p className="text-muted-foreground">Weekly trading journal entries</p>
        </div>
        <Button>New Entry</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Journal Entries Sidebar */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Journal Entries</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-t">
              <div className="p-4 border-b bg-muted/50">
                <div className="font-medium">April 2025</div>
                <div className="text-sm text-muted-foreground">
                  {currentWeek.start} to {currentWeek.end}
                </div>
              </div>
              <div className="p-4 border-b">
                <div className="font-medium">April 2025</div>
                <div className="text-sm text-muted-foreground">
                  Apr 20 to Apr 26, 2025
                </div>
              </div>
              <div className="p-4 border-b">
                <div className="font-medium">April 2025</div>
                <div className="text-sm text-muted-foreground">
                  Apr 13 to Apr 19, 2025
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Journal Content */}
        <div className="md:col-span-3 space-y-6">
          {/* KPI Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0.0%</div>
                <div className="text-xs text-muted-foreground">0 wins, 0 losses</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">P&L</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">+$0.00</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Expectancy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0.00R</div>
                <div className="text-xs text-muted-foreground">Avg R-Multiple: 0.00</div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Plan & Review */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Weekly Plan</CardTitle>
                <Button variant="ghost" size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    <path d="m15 5 4 4"/>
                  </svg>
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Looking for a pullback for a long in eth targeting daily swing highs overhead looking for a pullback for a long in es targeting something... maybe the draw is whenever nq takes the daily swing high.
                </p>
                <p className="mt-2 text-muted-foreground">
                  es and eth both have weekly engulfing candles
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Weekly Review</CardTitle>
                <Button variant="ghost" size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    <path d="m15 5 4 4"/>
                  </svg>
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No weekly review entered</p>
              </CardContent>
            </Card>
          </div>

          {/* Day Tabs */}
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="Tuesday">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto">
                  {days.map((day) => (
                    <TabsTrigger
                      key={day}
                      value={day}
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
                    >
                      {day}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {days.map((day) => (
                  <TabsContent key={day} value={day} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2 flex items-center justify-between">
                          {day} Plan
                          <Button variant="ghost" size="sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                              <path d="m15 5 4 4"/>
                            </svg>
                          </Button>
                        </h3>
                        <p className="text-muted-foreground">
                          {day === "Tuesday" ? "No plan entered for Tuesday" : `No plan entered for ${day}`}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-2 flex items-center justify-between">
                          {day} Review
                          <Button variant="ghost" size="sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                              <path d="m15 5 4 4"/>
                            </svg>
                          </Button>
                        </h3>
                        <p className="text-muted-foreground">
                          {day === "Tuesday" ? "No review entered for Tuesday" : `No review entered for ${day}`}
                        </p>
                      </div>
                    </div>

                    <h3 className="text-lg font-medium mb-4">Trades</h3>
                    <div className="rounded-md border p-4 text-center">
                      <p className="text-muted-foreground">No trades found for this period</p>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
