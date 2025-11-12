'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Plus, 
  Filter, 
  Phone, 
  Mail, 
  MapPin,
  Building,
  CheckCircle,
  AlertTriangle,
  Clock,
  MoreVertical,
  Star,
  FileText
} from 'lucide-react'
import MobileLayout from '@/components/layout/mobile/mobile-layout'

interface Client {
  id: string
  businessName: string
  pan: string
  gstin?: string
  email: string
  phone: string
  address: string
  gstStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'CANCELLED'
  lastActivity: string
  returnsCount: number
  registrationsCount: number
  totalRevenue: number
}

export default function MobileClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setLoading(true)
    try {
      // Mock data - in real app, fetch from API
      const mockClients: Client[] = [
        {
          id: '1',
          businessName: 'ABC Enterprises Pvt Ltd',
          pan: 'ABCDE1234F',
          gstin: '29ABCDE1234F1Z5',
          email: 'contact@abcenterprises.com',
          phone: '+91 9876543210',
          address: '123 Business Park, Bangalore, Karnataka',
          gstStatus: 'ACTIVE',
          lastActivity: '2 hours ago',
          returnsCount: 12,
          registrationsCount: 1,
          totalRevenue: 125000
        },
        {
          id: '2',
          businessName: 'XYZ Solutions',
          pan: 'FGHIJ5678G',
          gstin: '29FGHIJ5678G1Z5',
          email: 'info@xyzsolutions.com',
          phone: '+91 9876543211',
          address: '456 Tech Park, Bangalore, Karnataka',
          gstStatus: 'ACTIVE',
          lastActivity: '1 day ago',
          returnsCount: 8,
          registrationsCount: 1,
          totalRevenue: 98000
        },
        {
          id: '3',
          businessName: 'DEF Manufacturing',
          pan: 'KLMNO9012H',
          gstin: '29KLMNO9012H1Z5',
          email: 'admin@defmanufacturing.com',
          phone: '+91 9876543212',
          address: '789 Industrial Area, Chennai, Tamil Nadu',
          gstStatus: 'INACTIVE',
          lastActivity: '3 days ago',
          returnsCount: 15,
          registrationsCount: 1,
          totalRevenue: 156000
        },
        {
          id: '4',
          businessName: 'GHI Services',
          pan: 'PQRST3456J',
          email: 'hello@ghiservices.com',
          phone: '+91 9876543213',
          address: '321 Service Road, Mumbai, Maharashtra',
          gstStatus: 'ACTIVE',
          lastActivity: '1 week ago',
          returnsCount: 6,
          registrationsCount: 0,
          totalRevenue: 75000
        }
      ]
      setClients(mockClients)
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-3 w-3" />
      case 'INACTIVE':
        return <Clock className="h-3 w-3" />
      case 'SUSPENDED':
        return <AlertTriangle className="h-3 w-3" />
      case 'CANCELLED':
        return <AlertTriangle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const filteredClients = clients.filter(client =>
    client.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.pan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.gstin?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <MobileLayout>
      <div className="p-4 space-y-4 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Clients</h1>
            <p className="text-gray-600 text-sm">Manage your client portfolio</p>
          </div>
          <Button size="sm" className="rounded-full">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3">
            <div className="flex items-center justify-between mb-1">
              <Building className="h-4 w-4 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-800 text-xs">Total</Badge>
            </div>
            <div className="text-lg font-bold">{clients.length}</div>
            <div className="text-xs text-gray-500">All Clients</div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center justify-between mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
            </div>
            <div className="text-lg font-bold">{clients.filter(c => c.gstStatus === 'ACTIVE').length}</div>
            <div className="text-xs text-gray-500">GST Active</div>
          </Card>
        </div>

        {/* Clients List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            filteredClients.map((client) => (
              <Card key={client.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{client.businessName}</h3>
                        <Badge className={getStatusColor(client.gstStatus)}>
                          {getStatusIcon(client.gstStatus)}
                          <span className="ml-1 text-xs">{client.gstStatus}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>PAN: {client.pan}</span>
                        {client.gstin && <span>•</span>}
                        {client.gstin && <span>GSTIN: {client.gstin}</span>}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <Mail className="h-3 w-3" />
                      <span>{client.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <Phone className="h-3 w-3" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-start space-x-2 text-xs text-gray-600">
                      <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">{client.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <FileText className="h-3 w-3" />
                        <span>{client.returnsCount} returns</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3" />
                        <span>{formatCurrency(client.totalRevenue)}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {client.lastActivity}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {filteredClients.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <h3 className="font-medium text-gray-900 mb-1">No clients found</h3>
              <p className="text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search' : 'Add your first client to get started'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  )
}