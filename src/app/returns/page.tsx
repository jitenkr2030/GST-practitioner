'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Eye,
  FileText,
  Calendar,
  Upload,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileUp
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import ReturnForm from '@/components/returns/return-form'

interface Return {
  id: string
  returnType: string
  period: string
  status: string
  filedAt?: string
  processedAt?: string
  dueDate: string
  acknowledgementNo?: string
  jsonFile?: string
  createdAt: string
  client: {
    id: string
    businessName: string
    gstin?: string
    pan: string
    email: string
    phone: string
  }
  documents: Array<{
    id: string
    name: string
    type: string
    uploadedAt: string
  }>
  payments: Array<{
    id: string
    amount: number
    status: string
    paidAt?: string
  }>
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingReturn, setEditingReturn] = useState<Return | null>(null)

  useEffect(() => {
    fetchReturns()
  }, [])

  const fetchReturns = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/returns')
      if (response.ok) {
        const data = await response.json()
        setReturns(data)
      }
    } catch (error) {
      console.error('Error fetching returns:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReturns = returns.filter(ret => {
    const matchesSearch = ret.client.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ret.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ret.acknowledgementNo?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || ret.status === statusFilter
    const matchesType = typeFilter === 'all' || ret.returnType === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'filed':
        return 'bg-green-100 text-green-800'
      case 'processed':
        return 'bg-blue-100 text-blue-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'filed':
      case 'processed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'overdue':
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleFormSuccess = () => {
    setShowAddDialog(false)
    setEditingReturn(null)
    fetchReturns()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">GST Return Filing</h1>
            <p className="text-gray-600 mt-2">File and track GST returns for your clients</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                File New Return
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>File GST Return</DialogTitle>
                <DialogDescription>
                  Submit GST return for your client
                </DialogDescription>
              </DialogHeader>
              <ReturnForm onSuccess={handleFormSuccess} onCancel={() => setShowAddDialog(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Returns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{returns.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Filed This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {returns.filter(r => {
                  const filedDate = r.filedAt ? new Date(r.filedAt) : null
                  const now = new Date()
                  return filedDate && 
                         filedDate.getMonth() === now.getMonth() && 
                         filedDate.getFullYear() === now.getFullYear()
                }).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Filing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {returns.filter(r => r.status === 'Draft').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {returns.filter(r => isOverdue(r.dueDate) && r.status !== 'Filed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>GST Returns</CardTitle>
            <CardDescription>View and manage all GST return filings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by client name, period, or acknowledgement no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="GSTR-1">GSTR-1</option>
                  <option value="GSTR-3B">GSTR-3B</option>
                  <option value="GSTR-4">GSTR-4</option>
                  <option value="GSTR-9">GSTR-9</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Draft">Draft</option>
                  <option value="Filed">Filed</option>
                  <option value="Processed">Processed</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Returns Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Return Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-500">Loading returns...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredReturns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-gray-500">No GST returns found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReturns.map((returnItem) => {
                      const daysUntilDue = getDaysUntilDue(returnItem.dueDate)
                      const isReturnOverdue = isOverdue(returnItem.dueDate)
                      
                      return (
                        <TableRow key={returnItem.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {returnItem.client.businessName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{returnItem.client.businessName}</div>
                                <div className="text-sm text-gray-500">{returnItem.client.gstin}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{returnItem.returnType}</div>
                              <div className="text-sm text-gray-600">Period: {returnItem.period}</div>
                              {returnItem.acknowledgementNo && (
                                <div className="text-sm text-green-600 font-medium">
                                  ACK: {returnItem.acknowledgementNo}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(returnItem.status)}
                              <Badge className={getStatusColor(returnItem.status)}>
                                {returnItem.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium">
                                {new Date(returnItem.dueDate).toLocaleDateString()}
                              </div>
                              <div className={`text-xs ${
                                isReturnOverdue 
                                  ? 'text-red-600' 
                                  : daysUntilDue <= 3 
                                  ? 'text-yellow-600' 
                                  : 'text-green-600'
                              }`}>
                                {isReturnOverdue 
                                  ? 'Overdue' 
                                  : `${daysUntilDue} days left`
                                }
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {returnItem.payments.length > 0 ? (
                                returnItem.payments.map((payment) => (
                                  <div key={payment.id} className="text-sm">
                                    <span className="font-medium">₹{payment.amount.toLocaleString()}</span>
                                    <Badge 
                                      className={`ml-2 ${
                                        payment.status === 'PAID' 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-yellow-100 text-yellow-800'
                                      }`}
                                    >
                                      {payment.status}
                                    </Badge>
                                  </div>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500">No payment</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEditingReturn(returnItem)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Return
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload JSON
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileUp className="mr-2 h-4 w-4" />
                                  File Return
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download Acknowledgement
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Return Dialog */}
      <Dialog open={!!editingReturn} onOpenChange={() => setEditingReturn(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit GST Return</DialogTitle>
            <DialogDescription>
              Update GST return details
            </DialogDescription>
          </DialogHeader>
          {editingReturn && (
            <ReturnForm 
              returnData={editingReturn} 
              onSuccess={handleFormSuccess} 
              onCancel={() => setEditingReturn(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}