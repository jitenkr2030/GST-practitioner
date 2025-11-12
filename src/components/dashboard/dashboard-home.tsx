'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  FileText, 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  CheckCircle,
  Plus
} from 'lucide-react'

export default function DashboardHome() {
  // Mock data for demonstration
  const stats = [
    {
      title: 'Total Clients',
      value: '156',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Active GST',
      value: '142',
      change: '+8%',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Pending Returns',
      value: '23',
      change: '-5%',
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      title: 'Notices',
      value: '7',
      change: '+2',
      icon: AlertTriangle,
      color: 'text-red-600',
    },
  ]

  const recentReturns = [
    {
      client: 'ABC Enterprises',
      type: 'GSTR-3B',
      period: 'Oct 2024',
      status: 'Filed',
      dueDate: '2024-11-20',
    },
    {
      client: 'XYZ Traders',
      type: 'GSTR-1',
      period: 'Oct 2024',
      status: 'Pending',
      dueDate: '2024-11-11',
    },
    {
      client: 'Tech Solutions Pvt Ltd',
      type: 'GSTR-3B',
      period: 'Oct 2024',
      status: 'Overdue',
      dueDate: '2024-11-20',
    },
  ]

  const upcomingDeadlines = [
    {
      title: 'GSTR-1 Filing',
      client: 'XYZ Traders',
      dueDate: '2024-11-11',
      daysLeft: 2,
    },
    {
      title: 'GSTR-3B Filing',
      client: 'ABC Enterprises',
      dueDate: '2024-11-20',
      daysLeft: 11,
    },
    {
      title: 'Notice Reply',
      client: 'Tech Solutions Pvt Ltd',
      dueDate: '2024-11-15',
      daysLeft: 6,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'filed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your GST practice overview.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            File Return
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-600 mt-1">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Returns */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Returns</CardTitle>
            <CardDescription>Latest GST return filings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReturns.map((returnItem, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{returnItem.client}</p>
                    <p className="text-sm text-gray-600">{returnItem.type} • {returnItem.period}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(returnItem.status)}>
                      {returnItem.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      Due: {returnItem.dueDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Important dates to remember</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{deadline.title}</p>
                    <p className="text-sm text-gray-600">{deadline.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {deadline.dueDate}
                    </p>
                    <p className={`text-xs ${
                      deadline.daysLeft <= 3 
                        ? 'text-red-600' 
                        : deadline.daysLeft <= 7 
                        ? 'text-yellow-600' 
                        : 'text-green-600'
                    }`}>
                      {deadline.daysLeft} days left
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you might want to perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              Add Client
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              File Return
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              New Registration
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <AlertTriangle className="h-6 w-6 mb-2" />
              Add Notice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}