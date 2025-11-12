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
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  IndianRupee,
  User,
  Mail,
  Phone
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import InvoiceForm from '@/components/billing/invoice-form'

interface Invoice {
  id: string
  invoiceNo: string
  amount: number
  status: string
  issuedAt: string
  dueDate: string
  paidAt?: string
  description?: string
  client: {
    id: string
    businessName: string
    gstin?: string
    email: string
    phone: string
  }
  user: {
    id: string
    name: string
    email: string
  }
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/invoices')
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      } else {
        // Mock data for demonstration
        const mockInvoices: Invoice[] = [
          {
            id: '1',
            invoiceNo: 'INV-2024-001',
            amount: 5000,
            status: 'PAID',
            issuedAt: '2024-10-01',
            dueDate: '2024-10-15',
            paidAt: '2024-10-12',
            description: 'GST Registration Services',
            client: {
              id: '1',
              businessName: 'ABC Enterprises',
              gstin: '29ABCDE1234Z1Z5',
              email: 'abc@enterprises.com',
              phone: '9876543210'
            },
            user: {
              id: '1',
              name: 'John Doe',
              email: 'john@example.com'
            }
          },
          {
            id: '2',
            invoiceNo: 'INV-2024-002',
            amount: 3000,
            status: 'SENT',
            issuedAt: '2024-10-05',
            dueDate: '2024-10-20',
            description: 'Monthly Return Filing',
            client: {
              id: '2',
              businessName: 'XYZ Traders',
              gstin: '29FGHIJ5678Z2Z6',
              email: 'xyz@traders.com',
              phone: '9876543211'
            },
            user: {
              id: '1',
              name: 'John Doe',
              email: 'john@example.com'
            }
          },
          {
            id: '3',
            invoiceNo: 'INV-2024-003',
            amount: 7500,
            status: 'OVERDUE',
            issuedAt: '2024-09-20',
            dueDate: '2024-10-10',
            description: 'Notice Reply Services',
            client: {
              id: '3',
              businessName: 'Tech Solutions Pvt Ltd',
              gstin: '29KLMNO9012Z3Z7',
              email: 'tech@solutions.com',
              phone: '9876543212'
            },
            user: {
              id: '1',
              name: 'John Doe',
              email: 'john@example.com'
            }
          }
        ]
        setInvoices(mockInvoices)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.client.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.client.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'sent':
        return <Mail className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const handleFormSuccess = () => {
    setShowAddDialog(false)
    setEditingInvoice(null)
    fetchInvoices()
  }

  const getTotalAmount = (status?: string) => {
    const filtered = status 
      ? invoices.filter(i => i.status === status)
      : invoices
    return filtered.reduce((sum, invoice) => sum + invoice.amount, 0)
  }

  const getOverdueInvoices = () => {
    return invoices.filter(invoice => {
      return invoice.status === 'OVERDUE' || 
             (invoice.status !== 'PAID' && new Date(invoice.dueDate) < new Date())
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing & Invoices</h1>
            <p className="text-gray-600 mt-2">Manage client invoices and payment tracking</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>
                  Generate and send invoice to client
                </DialogDescription>
              </DialogHeader>
              <InvoiceForm onSuccess={handleFormSuccess} onCancel={() => setShowAddDialog(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Invoiced
              </CardTitle>
              <IndianRupee className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{getTotalAmount().toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-1">
                {invoices.length} invoices
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Paid This Month
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{getTotalAmount('PAID').toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {invoices.filter(i => i.status === 'PAID').length} paid
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Outstanding
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                ₹{getTotalAmount('SENT').toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {invoices.filter(i => i.status === 'SENT').length} pending
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Overdue
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ₹{getTotalAmount('OVERDUE').toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {getOverdueInvoices().length} overdue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Management</CardTitle>
            <CardDescription>View and manage all client invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by client name, invoice no, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-500">Loading invoices...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-gray-500">No invoices found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{invoice.invoiceNo}</div>
                            {invoice.description && (
                              <div className="text-sm text-gray-600">{invoice.description}</div>
                            )}
                            <div className="text-xs text-gray-500">
                              Issued: {new Date(invoice.issuedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{invoice.client.businessName}</div>
                            <div className="text-sm text-gray-600">{invoice.client.gstin}</div>
                            <div className="text-xs text-blue-600">{invoice.client.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-lg">
                            ₹{invoice.amount.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(invoice.status)}
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {new Date(invoice.dueDate).toLocaleDateString()}
                            </div>
                            {invoice.paidAt && (
                              <div className="text-xs text-green-600">Paid on {new Date(invoice.paidAt).toLocaleDateString()}</div>
                            )}
                            {!invoice.paidAt && new Date(invoice.dueDate) < new Date() && (
                              <div className="text-xs text-red-600">Overdue</div>
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
                              <DropdownMenuItem onClick={() => setEditingInvoice(invoice)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                              {invoice.status === 'SENT' && (
                                <DropdownMenuItem>
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Mark as Paid
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Invoice Dialog */}
      <Dialog open={!!editingInvoice} onOpenChange={() => setEditingInvoice(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
            <DialogDescription>
              Update invoice details
            </DialogDescription>
          </DialogHeader>
          {editingInvoice && (
            <InvoiceForm 
              invoiceData={editingInvoice}
              onSuccess={handleFormSuccess} 
              onCancel={() => setEditingInvoice(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}