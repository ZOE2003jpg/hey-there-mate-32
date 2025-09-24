import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useUser } from "@/components/user-context"
import { useEarnings } from "@/hooks/useEarnings"
import { toast } from "sonner"
import { 
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard,
  Eye,
  Target,
  AlertCircle
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface EarningsProps {
  onNavigate: (page: string, data?: any) => void
}

export function Earnings({ onNavigate }: EarningsProps) {
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useUser()
  const { stats, payouts, loading, createPayoutRequest } = useEarnings(user?.id)

  const minimumPayout = 50.00

  const handlePayoutRequest = async () => {
    if (!payoutAmount || !user?.id) return
    
    const amount = parseFloat(payoutAmount)
    if (isNaN(amount) || amount < minimumPayout || amount > stats.availableBalance) {
      toast.error(`Invalid amount. Must be between $${minimumPayout} and $${stats.availableBalance.toFixed(2)}`)
      return
    }

    try {
      setIsSubmitting(true)
      await createPayoutRequest(amount, 'paypal') // Default to PayPal
      toast.success('Payout request submitted successfully!')
      setPayoutDialogOpen(false)
      setPayoutAmount("")
    } catch (error) {
      console.error('Error creating payout request:', error)
      toast.error('Failed to submit payout request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default"
      case "pending": return "secondary"
      case "failed": return "destructive"
      default: return "secondary"
    }
  }

  const canRequestPayout = stats.availableBalance >= minimumPayout

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => onNavigate("dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Earnings Dashboard</h1>
            <p className="text-muted-foreground">Loading your earnings data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => onNavigate("dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Earnings Dashboard</h1>
            <p className="text-muted-foreground">Track your revenue and manage payouts</p>
          </div>
        </div>
        <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="vine-button-hero" 
              disabled={!canRequestPayout}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Request Payout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Payout</DialogTitle>
              <DialogDescription>
                Request a payout of your available earnings. Minimum payout amount is ${minimumPayout}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payout-amount">Payout Amount</Label>
                <Input
                  id="payout-amount"
                  type="number"
                  placeholder={`Max: $${stats.availableBalance.toFixed(2)}`}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                />
              </div>
              <div className="p-4 bg-secondary/20 rounded-lg">
                <p className="text-sm">
                  <strong>Available Balance:</strong> ${stats.availableBalance.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Payouts are processed on the 1st of each month
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPayoutDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="vine-button-hero" 
                onClick={handlePayoutRequest}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Balance Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="vine-card text-center">
          <CardContent className="pt-6">
            <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold">${stats.availableBalance.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Available Balance</div>
          </CardContent>
        </Card>

        <Card className="vine-card text-center">
          <CardContent className="pt-6">
            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Total Earnings</div>
          </CardContent>
        </Card>

        <Card className="vine-card text-center">
          <CardContent className="pt-6">
            <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold">${stats.thisMonthEarnings.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">This Month</div>
          </CardContent>
        </Card>

        <Card className="vine-card text-center">
          <CardContent className="pt-6">
            <Target className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">${minimumPayout.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Min. Payout</div>
          </CardContent>
        </Card>
      </div>

      {/* Payout Progress */}
      <Card className="vine-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Payout Progress
          </CardTitle>
          <CardDescription>
            Track your progress towards the minimum payout threshold
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Current Balance</span>
              <span>${stats.availableBalance.toFixed(2)} / ${minimumPayout.toFixed(2)}</span>
            </div>
            <Progress value={(stats.availableBalance / minimumPayout) * 100} />
            {canRequestPayout ? (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Target className="h-4 w-4" />
                Ready for payout! You can request withdrawal now.
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                ${(minimumPayout - stats.availableBalance).toFixed(2)} more needed for payout
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <Card className="vine-card">
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>How you're earning money on VineNovel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.revenueBreakdown.length > 0 ? (
                stats.revenueBreakdown.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.source}</span>
                      <span>${item.amount.toFixed(2)}</span>
                    </div>
                    <Progress value={item.percentage} />
                    <div className="text-xs text-muted-foreground text-right">
                      {item.percentage}% of total
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center">No revenue data available yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="vine-card">
          <CardHeader>
            <CardTitle>Earning Insights</CardTitle>
            <CardDescription>Performance insights for this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
              <div>
                <p className="font-medium">Average per 1K reads</p>
                <p className="text-sm text-muted-foreground">Revenue rate</p>
              </div>
              <div className="text-right">
                <p className="font-bold">$0.00</p>
                <p className="text-xs text-muted-foreground">No data yet</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
              <div>
                <p className="font-medium">Total earnings this month</p>
                <p className="text-sm text-muted-foreground">Current period</p>
              </div>
              <div className="text-right">
                <p className="font-bold">${stats.thisMonthEarnings.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{stats.revenueBreakdown.length > 0 ? `From ${stats.revenueBreakdown.length} sources` : 'No earnings yet'}</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
              <div>
                <p className="font-medium">Next payout date</p>
                <p className="text-sm text-muted-foreground">Scheduled processing</p>
              </div>
              <div className="text-right">
                <p className="font-bold">1st of next month</p>
                <p className="text-xs text-muted-foreground">When minimum reached</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout History */}
      <Card className="vine-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payout History
          </CardTitle>
          <CardDescription>Your previous withdrawals and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payouts.length > 0 ? (
              payouts.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">${Number(payout.amount).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payout.requested_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium capitalize">{payout.method.replace('_', ' ')}</p>
                      <Badge variant={getStatusColor(payout.status)}>
                        {payout.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">No payout history yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Earning Tips */}
      <Card className="vine-card">
        <CardHeader>
          <CardTitle>Maximize Your Earnings</CardTitle>
          <CardDescription>Tips to increase your revenue on VineNovel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <Eye className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Engage Your Readers</p>
                  <p className="text-sm text-muted-foreground">
                    Stories with higher engagement rates earn more from ad revenue
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Post Regularly</p>
                  <p className="text-sm text-muted-foreground">
                    Consistent updates keep readers coming back
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Quality Content</p>
                  <p className="text-sm text-muted-foreground">
                    Higher completion rates lead to better monetization
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Target className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Optimize Chapters</p>
                  <p className="text-sm text-muted-foreground">
                    Proper chapter length increases ad placement opportunities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}