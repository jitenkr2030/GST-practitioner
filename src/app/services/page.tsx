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
  CheckCircle,
  Clock,
  AlertTriangle,
  Settings,
  Users,
  TrendingUp
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Service {
  id: string
  type: string
  name: string
  description?: string
  fee: number
  status: string
  dueDate?: string
  completedAt?: string
  createdAt: string
  client: {
    id: string
    businessName: string
    gstin?: string
    pan: string
    email: string
    phone: string
  }
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      // Mock data for demonstration
      const mockServices: Service[] = [
        {
          id: '1',
          type: 'GST_REGISTRATION',
          name: 'GST Registration',
          description: 'New GST registration for ABC Enterprises',
          fee: 5000,
          status: 'Completed',
          dueDate: '2024-10-15',
          completedAt: '2024-10-12',
          createdAt: '2024-10-01',
          client: {
            id: '1',
            businessName: 'ABC Enterprises',
            gstin: '29ABCDE1234F1Z5',
            pan: 'ABCDE1234F',
            email: 'abc@enterprises.com',
            phone: '9876543210'
          }
        },
        {
          id: '2',
          type: 'RETURN_FILING',
          name: 'Monthly Return Filing',
          description: 'GSTR-1 and GSTR-3B for October 2024',
          fee: 3000,
          status: 'In Progress',
          dueDate: '2024-11-20',
          createdAt: '2024-10-05',
          client: {
            id: '2',
            businessName: 'XYZ Traders',
            gstin: '29FGHIJ5678G2Z6',
            pan: 'FGHIJ5678G',
            email: 'xyz@traders.com',
            phone: '9876543211'
          }
        },
        {
          id: '3',
          type: 'NOTICE_REPLY',
          name: 'GST Notice Reply',
          description: 'Reply to show cause notice for tax discrepancy',
          fee: 7500,
          status: 'Pending',
          dueDate: '2024-11-15',
          createdAt: '2024-10-10',
          client: {
            id: '3',
            businessName: 'Tech Solutions Pvt Ltd',
            gstin: '29KLMNO9012H3Z7',
            pan: 'KLMNO9012H',
            email: 'tech@solutions.com',
            phone: '9876543212'
          }
        },
        {
          id: '4',
          type: 'ITC_RECONCILIATION',
          name: 'ITC Reconciliation',
          description: 'Quarterly ITC reconciliation for Q2 2024-25',
          fee: 4000,
          status: 'In Progress',
          dueDate: '2024-11-30',
          createdAt: '2024-10-15',
          client: {
            id: '1',
            businessName: 'ABC Enterprises',
            gstin: '29ABCDE1234F1Z5',
            pan: 'ABCDE1234F',
            email: 'abc@enterprises.com',
            phone: '9876543210'
          }
        }
      ]
      setServices(mockServices)
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = service.client.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter
    const matchesType = typeFilter === 'all' || service.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in progress':
        return <Settings className="h-4 w-4 text-blue-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    return `${diffDays} days`
  }

  const getServiceTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getTotalRevenue = (status?: string) => {
    const filtered = status 
      ? services.filter(s => s.status === status)
      : services
    return filtered.reduce((sum, service) => sum + service.fee, 0)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
            <p className="text-gray-600 mt-2">Track and manage all client services</p>
          </div>
          <div className="flex space-x-3">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Create New Service</DialogTitle>
                  <DialogDescription>
                    Add a new service for a client
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">ABC Enterprises</SelectItem>
                          <SelectItem value="2">XYZ Traders</SelectItem>
                          <SelectItem value="3">Tech Solutions Pvt Ltd</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GST_REGISTRATION">GST Registration</SelectItem>
                          <SelectItem value="RETURN_FILING">Return Filing</SelectItem>
                          <SelectItem value="NOTICE_REPLY">Notice Reply</SelectItem>
                          <SelectItem value="AUDIT_SUPPORT">Audit Support</SelectItem>
                          <SelectItem value="ITC_RECONCILIATION">ITC Reconciliation</SelectItem>
                          <SelectItem value="REFUND_APPLICATION">Refund Application</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                    <Input placeholder="Service name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <Input placeholder="Service description" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fee (₹)</label>
                      <Input type="number" placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                      <Input type="date" />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button>
                      Create Service
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Services
              </CardTitle>
              <Settings className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{services.length}</div>
              <p className="text-xs text-gray-600 mt-1">
                Active services
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Completed
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {services.filter(s => s.status === 'Completed').length}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {Math.round((services.filter(s => s.status === 'Completed').length / services.length) * 100)}% completion rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                In Progress
              </CardTitle>
              <Settings className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {services.filter(s => s.status === 'In Progress').length}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Currently active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                ₹{getTotalRevenue().toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                From all services
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Services Overview</CardTitle>
            <CardDescription>View and manage all client services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by client, service name, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Overdue">Overdue</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="GST_REGISTRATION">GST Registration</option>
                  <option value="RETURN_FILING">Return Filing</option>
                  <option value="NOTICE_REPLY">Notice Reply</option>
                  <option value="AUDIT_SUPPORT">Audit Support</option>
                  <option value="ITC_RECONCILIATION">ITC Reconciliation</option>
                </select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Services Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-500">Loading services...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredServices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-gray-500">No services found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{service.name}</div>
                            <div className="text-sm text-gray-500">
                              {getServiceTypeLabel(service.type)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {service.client.businessName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{service.client.businessName}</div>
                              <div className="text-sm text-gray-500">{service.client.gstin}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="text-sm">{service.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold">
                            ₹{service.fee.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(service.status)}
                            <Badge className={getStatusColor(service.status)}>
                              {service.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {service.dueDate && (
                            <div className="space-y-1">
                              <div className="text-sm font-medium">
                                {new Date(service.dueDate).toLocaleDateString()}
                              </div>
                              <div className={`text-xs ${
                                service.status === 'Overdue' ? 'text-red-600' : 
                                service.status === 'Completed' ? 'text-green-600' : 'text-gray-600'
                              }`}>
                                {service.status === 'Completed' ? 'Completed' : getDaysUntilDue(service.dueDate)}
                              </div>
                            </div>
                          )}
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
                              <DropdownMenuItem onClick={() => setEditingService(service)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Service
                              </DropdownMenuItem>
                              {service.status === 'Pending' && (
                                <DropdownMenuItem>
                                  <Settings className="mr-2 h-4 w-4" />
                                  Start Service
                                </DropdownMenuItem>
                              )}
                              {service.status === 'In Progress' && (
                                <DropdownMenuItem>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Mark Complete
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                Generate Invoice
                              </DropdownMenuItem>
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
    </DashboardLayout>
  )
}