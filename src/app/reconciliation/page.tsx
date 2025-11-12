'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Eye,
  Calendar
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import ReconciliationForm from '@/components/reconciliation/reconciliation-form'

interface ReconciliationItem {
  id: string
  invoiceNo: string
  invoiceDate: string
  supplierName: string
  supplierGstin: string
  invoiceValue: number
  taxAmount: number
  itcAmount: number
  gstr2bStatus: string
  matchStatus: string
  discrepancyReason?: string
  period: string
  client: {
    id: string
    businessName: string
    gstin?: string
  }
}

export default function ReconciliationPage() {
  const [reconciliationData, setReconciliationData] = useState<ReconciliationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('all')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ReconciliationItem | null>(null)

  useEffect(() => {
    fetchReconciliationData()
  }, [])

  const fetchReconciliationData = async () => {
    try {
      setLoading(true)
      // Mock data for demonstration
      const mockData: ReconciliationItem[] = [
        {
          id: '1',
          invoiceNo: 'INV-001',
          invoiceDate: '2024-10-15',
          supplierName: 'ABC Suppliers Ltd',
          supplierGstin: '29ABCDE1234F1Z5',
          invoiceValue: 118000,
          taxAmount: 18000,
          itcAmount: 18000,
          gstr2bStatus: 'AVAILABLE',
          matchStatus: 'MATCHED',
          period: 'Oct 2024',
          client: {
            id: '1',
            businessName: 'XYZ Traders',
            gstin: '27FGHIJ5678G2Z6'
          }
        },
        {
          id: '2',
          invoiceNo: 'INV-002',
          invoiceDate: '2024-10-20',
          supplierName: 'DEF Materials',
          supplierGstin: '29LMNOP9012G3Z7',
          invoiceValue: 59000,
          taxAmount: 9000,
          itcAmount: 9000,
          gstr2bStatus: 'NOT_AVAILABLE',
          matchStatus: 'UNMATCHED',
          discrepancyReason: 'Invoice not found in GSTR-2B',
          period: 'Oct 2024',
          client: {
            id: '1',
            businessName: 'XYZ Traders',
            gstin: '27FGHIJ5678G2Z6'
          }
        },
        {
          id: '3',
          invoiceNo: 'INV-003',
          invoiceDate: '2024-10-25',
          supplierName: 'GHI Services',
          supplierGstin: '29QRSTU3456H4Z8',
          invoiceValue: 236000,
          taxAmount: 36000,
          itcAmount: 34000,
          gstr2bStatus: 'AVAILABLE',
          matchStatus: 'PARTIAL_MATCH',
          discrepancyReason: 'Tax amount mismatch (Purchase: ₹36,000 vs GSTR-2B: ₹34,000)',
          period: 'Oct 2024',
          client: {
            id: '2',
            businessName: 'Tech Solutions Pvt Ltd',
            gstin: '29VWXYZ7890I5Z9'
          }
        }
      ]
      setReconciliationData(mockData)
    } catch (error) {
      console.error('Error fetching reconciliation data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = reconciliationData.filter(item => {
    const matchesSearch = item.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplierGstin.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || item.matchStatus === statusFilter
    const matchesPeriod = periodFilter === 'all' || item.period === periodFilter
    
    return matchesSearch && matchesStatus && matchesPeriod
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'matched':
        return 'bg-green-100 text-green-800'
      case 'unmatched':
        return 'bg-red-100 text-red-800'
      case 'partial_match':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'matched':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'unmatched':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'partial_match':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStats = () => {
    const total = reconciliationData.length
    const matched = reconciliationData.filter(item => item.matchStatus === 'MATCHED').length
    const unmatched = reconciliationData.filter(item => item.matchStatus === 'UNMATCHED').length
    const partial = reconciliationData.filter(item => item.matchStatus === 'PARTIAL_MATCH').length
    const totalITC = reconciliationData.reduce((sum, item) => sum + item.itcAmount, 0)
    const availableITC = reconciliationData
      .filter(item => item.matchStatus === 'MATCHED')
      .reduce((sum, item) => sum + item.itcAmount, 0)

    return { total, matched, unmatched, partial, totalITC, availableITC }
  }

  const stats = getStats()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ITC Reconciliation</h1>
            <p className="text-gray-600 mt-2">Match purchase invoices with GSTR-2B and optimize ITC claims</p>
          </div>
          <div className="flex space-x-3">
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Purchase Data
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload Purchase Register</DialogTitle>
                  <DialogDescription>
                    Upload Excel/CSV file with purchase invoice details for reconciliation
                  </DialogDescription>
                </DialogHeader>
                <ReconciliationForm onSuccess={() => setShowUploadDialog(false)} />
              </DialogContent>
            </Dialog>
            <Button>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync GSTR-2B
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Invoices
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-600 mt-1">
                Purchase register
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Matched
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.matched}</div>
              <p className="text-xs text-gray-600 mt-1">
                {stats.total > 0 ? Math.round((stats.matched / stats.total) * 100) : 0}% match rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Unmatched
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.unmatched}</div>
              <p className="text-xs text-gray-600 mt-1">
                Requires attention
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Available ITC
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ₹{stats.availableITC.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                of ₹{stats.totalITC.toLocaleString()} total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Reconciliation Summary</CardTitle>
            <CardDescription>View and manage purchase invoice reconciliation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by invoice no, supplier name, or GSTIN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Periods</option>
                  <option value="Oct 2024">Oct 2024</option>
                  <option value="Sep 2024">Sep 2024</option>
                  <option value="Aug 2024">Aug 2024</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="MATCHED">Matched</option>
                  <option value="UNMATCHED">Unmatched</option>
                  <option value="PARTIAL_MATCH">Partial Match</option>
                </select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Reconciliation Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice Details</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Amounts</TableHead>
                    <TableHead>GSTR-2B Status</TableHead>
                    <TableHead>Match Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-500">Loading reconciliation data...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-gray-500">No reconciliation data found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{item.invoiceNo}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(item.invoiceDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">{item.period}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{item.supplierName}</div>
                            <div className="text-sm text-gray-600 font-mono">
                              {item.supplierGstin}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.client.businessName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="text-gray-600">Invoice:</span>
                              <span className="font-medium ml-1">₹{item.invoiceValue.toLocaleString()}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-600">Tax:</span>
                              <span className="font-medium ml-1">₹{item.taxAmount.toLocaleString()}</span>
                            </div>
                            <div className="text-sm font-medium text-blue-600">
                              ITC: ₹{item.itcAmount.toLocaleString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            item.gstr2bStatus === 'AVAILABLE' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }>
                            {item.gstr2bStatus.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(item.matchStatus)}
                            <Badge className={getStatusColor(item.matchStatus)}>
                              {item.matchStatus.replace('_', ' ')}
                            </Badge>
                          </div>
                          {item.discrepancyReason && (
                            <div className="text-xs text-red-600 mt-1 max-w-xs">
                              {item.discrepancyReason}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedItem(item)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Export Reports</CardTitle>
            <CardDescription>Download reconciliation reports in various formats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Download className="h-6 w-6 mb-2" />
                Excel Report
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <FileText className="h-6 w-6 mb-2" />
                PDF Summary
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Calendar className="h-6 w-6 mb-2" />
                Monthly Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail View Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              Detailed view of reconciliation item
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Invoice Information</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div><span className="text-gray-600">Invoice No:</span> {selectedItem.invoiceNo}</div>
                    <div><span className="text-gray-600">Date:</span> {new Date(selectedItem.invoiceDate).toLocaleDateString()}</div>
                    <div><span className="text-gray-600">Period:</span> {selectedItem.period}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Supplier Details</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div><span className="text-gray-600">Name:</span> {selectedItem.supplierName}</div>
                    <div><span className="text-gray-600">GSTIN:</span> {selectedItem.supplierGstin}</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Amounts</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div><span className="text-gray-600">Invoice Value:</span> ₹{selectedItem.invoiceValue.toLocaleString()}</div>
                    <div><span className="text-gray-600">Tax Amount:</span> ₹{selectedItem.taxAmount.toLocaleString()}</div>
                    <div><span className="text-gray-600">ITC Claimed:</span> ₹{selectedItem.itcAmount.toLocaleString()}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">GSTR-2B Status</h4>
                  <div className="mt-2">
                    <Badge className={
                      selectedItem.gstr2bStatus === 'AVAILABLE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }>
                      {selectedItem.gstr2bStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Match Status</h4>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedItem.matchStatus)}
                      <Badge className={getStatusColor(selectedItem.matchStatus)}>
                        {selectedItem.matchStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                    {selectedItem.discrepancyReason && (
                      <div className="text-xs text-red-600">
                        {selectedItem.discrepancyReason}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}