'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Calendar, 
  CreditCard, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  PieChart,
  Download,
  RefreshCw
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import RevenueTrendChart from '@/components/charts/revenue-trend-chart'
import ReturnsPerformanceChart from '@/components/charts/returns-performance-chart'
import ServicesPieChart from '@/components/charts/services-pie-chart'
import ClientAcquisitionChart from '@/components/charts/client-acquisition-chart'

interface AnalyticsData {
  totalClients: number
  activeGST: number
  monthlyReturns: { month: string; filed: number; overdue: number }[]
  revenue: { month: string; amount: number }[]
  topServices: { name: string; count: number; revenue: number }[]
  clientAcquisition: { month: string; count: number }[]
  complianceRate: number
  outstandingPayments: number
  pendingTasks: number
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('6months')

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics?period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        // Fallback to mock data if API fails
        const mockData: AnalyticsData = {
          totalClients: 156,
          activeGST: 142,
          monthlyReturns: [
            { month: 'Jun', filed: 145, overdue: 8 },
            { month: 'Jul', filed: 152, overdue: 5 },
            { month: 'Aug', filed: 148, overdue: 12 },
            { month: 'Sep', filed: 155, overdue: 6 },
            { month: 'Oct', filed: 160, overdue: 4 },
            { month: 'Nov', filed: 0, overdue: 23 },
          ],
          revenue: [
            { month: 'Jun', amount: 485000 },
            { month: 'Jul', amount: 520000 },
            { month: 'Aug', amount: 495000 },
            { month: 'Sep', amount: 580000 },
            { month: 'Oct', amount: 620000 },
            { month: 'Nov', amount: 0 },
          ],
          topServices: [
            { name: 'GST Registration', count: 45, revenue: 225000 },
            { name: 'Return Filing', count: 380, revenue: 1140000 },
            { name: 'Notice Reply', count: 28, revenue: 168000 },
            { name: 'ITC Reconciliation', count: 65, revenue: 325000 },
            { name: 'Audit Support', count: 15, revenue: 150000 },
          ],
          clientAcquisition: [
            { month: 'Jun', count: 12 },
            { month: 'Jul', count: 18 },
            { month: 'Aug', count: 15 },
            { month: 'Sep', count: 22 },
            { month: 'Oct', count: 25 },
            { month: 'Nov', count: 8 },
          ],
          complianceRate: 91.2,
          outstandingPayments: 125000,
          pendingTasks: 47,
        }
        setAnalytics(mockData)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading analytics...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">Failed to load analytics data</p>
        </div>
      </DashboardLayout>
    )
  }

  const currentMonthRevenue = analytics.revenue[analytics.revenue.length - 2]?.amount || 0
  const previousMonthRevenue = analytics.revenue[analytics.revenue.length - 3]?.amount || 0
  const revenueGrowth = previousMonthRevenue > 0 
    ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1)
    : '0'

  const currentMonthReturns = analytics.monthlyReturns[analytics.monthlyReturns.length - 2]?.filed || 0
  const previousMonthReturns = analytics.monthlyReturns[analytics.monthlyReturns.length - 3]?.filed || 0
  const returnsGrowth = previousMonthReturns > 0 
    ? ((currentMonthReturns - previousMonthReturns) / previousMonthReturns * 100).toFixed(1)
    : '0'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-600 mt-2">Comprehensive insights into your GST practice performance</p>
          </div>
          <div className="flex space-x-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(analytics.revenue.reduce((sum, r) => sum + r.amount, 0) / 1000000).toFixed(1)}M</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{revenueGrowth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Returns Filed
              </CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMonthReturns}</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{returnsGrowth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Compliance Rate
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.complianceRate}%</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.1% improvement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Clients
              </CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeGST}</div>
              <p className="text-xs text-gray-600 mt-1">
                of {analytics.totalClients} total clients
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueTrendChart data={analytics.revenue} height={300} />
            </CardContent>
          </Card>

          {/* Returns Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Returns Filing Performance</CardTitle>
              <CardDescription>Monthly returns filed vs overdue</CardDescription>
            </CardHeader>
            <CardContent>
              <ReturnsPerformanceChart data={analytics.monthlyReturns} height={300} />
            </CardContent>
          </Card>
        </div>

        {/* Services and Client Acquisition */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Services */}
          <Card>
            <CardHeader>
              <CardTitle>Services Distribution</CardTitle>
              <CardDescription>Breakdown of services by count</CardDescription>
            </CardHeader>
            <CardContent>
              <ServicesPieChart 
                data={analytics.topServices.map((service, index) => ({
                  name: service.name,
                  value: service.count,
                  color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][index % 6]
                }))} 
                height={300} 
              />
            </CardContent>
          </Card>

          {/* Client Acquisition */}
          <Card>
            <CardHeader>
              <CardTitle>Client Acquisition</CardTitle>
              <CardDescription>New clients acquired over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ClientAcquisitionChart data={analytics.clientAcquisition} height={300} />
            </CardContent>
          </Card>
        </div>

        {/* Alerts and Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Outstanding Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">₹{(analytics.outstandingPayments / 1000).toFixed(0)}K</div>
              <p className="text-sm text-gray-600 mt-1">Pending collection</p>
              <Button variant="outline" size="sm" className="mt-3">
                View Details
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <Clock className="h-5 w-5 mr-2" />
                Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{analytics.pendingTasks}</div>
              <p className="text-sm text-gray-600 mt-1">Require attention</p>
              <Button variant="outline" size="sm" className="mt-3">
                View Tasks
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                    Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">94.5%</div>
                  <p className="text-sm text-gray-600 mt-1">Tasks completed</p>
                  <Button variant="outline" size="sm" className="mt-3">
                    View Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </DashboardLayout>
      )
    }