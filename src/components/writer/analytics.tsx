import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowLeft,
  Download,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Users,
  BookOpen
} from "lucide-react"
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartConfig
} from "@/components/ui/chart"
import { Line, LineChart, Bar, BarChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useAnalytics } from "@/hooks/useAnalytics"
import { useUser } from "@/components/user-context"

interface AnalyticsProps {
  onNavigate: (page: string, data?: any) => void
}

export function Analytics({ onNavigate }: AnalyticsProps) {
  const { user } = useUser()
  const { analytics, loading } = useAnalytics(user?.id)
  const [timeRange, setTimeRange] = useState("30")

  // Fallback data if no analytics available
  const overallStats = {
    totalReads: analytics.total_reads || 0,
    totalLikes: analytics.total_likes || 0,
    totalComments: analytics.total_comments || 0,
    completionRate: analytics.completion_rate || 0,
    avgReadingTime: analytics.avg_reading_time || 0,
    followers: analytics.total_followers || 0
  }

  const readsData = [
    { date: "No Data", reads: 0, likes: 0 }
  ]

  const storiesData = [
    { name: "No Stories", reads: 0, percentage: 0 }
  ]

  const completionData = [
    { chapter: "No Data", completion: 0 }
  ]

  const chartConfig: ChartConfig = {
    reads: {
      label: "Reads",
      color: "hsl(var(--chart-1))",
    },
    likes: {
      label: "Likes", 
      color: "hsl(var(--chart-2))",
    },
  }

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => onNavigate("dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track your story performance and engagement</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {loading ? (
        <div className="text-center py-8">Loading analytics...</div>
      ) : (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <Card className="vine-card text-center">
          <CardContent className="pt-4 p-3 sm:pt-6 sm:p-6">
            <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold">{overallStats.totalReads.toLocaleString()}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total Reads</div>
            <div className="flex items-center justify-center mt-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+12%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="vine-card text-center">
          <CardContent className="pt-4 p-3 sm:pt-6 sm:p-6">
            <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold">{overallStats.totalLikes.toLocaleString()}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total Likes</div>
            <div className="flex items-center justify-center mt-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+8%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="vine-card text-center">
          <CardContent className="pt-4 p-3 sm:pt-6 sm:p-6">
            <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold">{overallStats.totalComments}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Comments</div>
            <div className="flex items-center justify-center mt-1 text-xs">
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              <span className="text-red-500">-3%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="vine-card text-center">
          <CardContent className="pt-4 p-3 sm:pt-6 sm:p-6">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold">{overallStats.completionRate}%</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Completion Rate</div>
            <div className="flex items-center justify-center mt-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+2%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="vine-card text-center">
          <CardContent className="pt-4 p-3 sm:pt-6 sm:p-6">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold">{overallStats.avgReadingTime}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Avg. Reading (min)</div>
            <div className="flex items-center justify-center mt-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+5%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="vine-card text-center">
          <CardContent className="pt-4 p-3 sm:pt-6 sm:p-6">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold">{overallStats.followers}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Followers</div>
            <div className="flex items-center justify-center mt-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+15%</span>
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Reads & Likes Over Time */}
        <Card className="vine-card">
          <CardHeader>
            <CardTitle>Reads & Likes Trend</CardTitle>
            <CardDescription>Daily performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={readsData}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="reads" 
                  stroke="var(--color-reads)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-reads)" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="likes" 
                  stroke="var(--color-likes)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-likes)" }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Story Performance */}
        <Card className="vine-card">
          <CardHeader>
            <CardTitle>Story Performance</CardTitle>
            <CardDescription>Reads distribution by story</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={storiesData}
                  dataKey="reads"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                >
                  {storiesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Chapter Completion Rates */}
        <Card className="vine-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Chapter Completion Rates</CardTitle>
            <CardDescription>How many readers complete each chapter</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={completionData}>
                <XAxis dataKey="chapter" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="completion" 
                  fill="var(--color-reads)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Stories Table */}
      <Card className="vine-card">
        <CardHeader>
          <CardTitle>Top Performing Stories</CardTitle>
          <CardDescription>Your most popular stories this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {storiesData.map((story, index) => (
              <div key={story.name} className="flex items-center justify-between p-4 rounded-lg bg-secondary/20">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{story.name}</h4>
                    <p className="text-sm text-muted-foreground">{story.reads.toLocaleString()} reads</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{story.percentage}%</Badge>
                  <Button size="sm" variant="outline" onClick={() => onNavigate("manage-chapters")}>
                    <BookOpen className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}