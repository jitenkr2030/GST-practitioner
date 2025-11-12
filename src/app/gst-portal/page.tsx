'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Search, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  FileText,
  CreditCard,
  Building,
  Calendar
} from 'lucide-react'
import DashboardLayout from '@/components/layout/dashboard-layout'

interface GSTPortalClient {
  gstin: string
  businessName: string
  legalName: string
  address: string
  stateCode: string
  registrationDate: string
  status: string
  constitutionOfBusiness: string
  taxpayerType: string
}

interface GSTReturn {
  returnPeriod: string
  returnType: string
  status: string
  filedDate?: string
  acknowledgementNumber?: string
  dueDate: string
  lateFee?: number
  interest?: number
  taxAmount?: number
}

interface GSTNotice {
  noticeNumber: string
  noticeDate: string
  noticeType: string
  subject: string
  description: string
  dueDate: string
  status: string
  actionRequired: boolean
}

export default function GSTPortalPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [clientDetails, setClientDetails] = useState<GSTPortalClient | null>(null)
  const [returnsHistory, setReturnsHistory] = useState<GSTReturn[]>([])
  const [notices, setNotices] = useState<GSTNotice[]>([])
  
  const [formData, setFormData] = useState({
    gstin: '',
    username: '',
    password: '',
    fromYear: new Date().getFullYear() - 2,
    toYear: new Date().getFullYear()
  })

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const fetchClientDetails = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/gst-portal/client-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gstin: formData.gstin,
          username: formData.username,
          password: formData.password
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch client details')
      }

      const data = await response.json()
      setClientDetails(data)
      setSuccess('Client details fetched successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchReturnsHistory = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/gst-portal/returns-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gstin: formData.gstin,
          username: formData.username,
          password: formData.password,
          fromYear: formData.fromYear,
          toYear: formData.toYear
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch returns history')
      }

      const data = await response.json()
      setReturnsHistory(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchNotices = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/gst-portal/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gstin: formData.gstin,
          username: formData.username,
          password: formData.password
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch notices')
      }

      const data = await response.json()
      setNotices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'Filed': 'bg-green-100 text-green-800',
      'Not Filed': 'bg-red-100 text-red-800',
      'Late Filed': 'bg-yellow-100 text-yellow-800',
      'Pending': 'bg-blue-100 text-blue-800',
      'Resolved': 'bg-green-100 text-green-800'
    }
    return colors[status] || colors.Pending
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Filed':
      case 'Resolved':
        return <CheckCircle className="h-4 w-4" />
      case 'Not Filed':
        return <XCircle className="h-4 w-4" />
      case 'Late Filed':
        return <Clock className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">GST Portal Integration</h1>
          <p className="text-gray-600 mt-2">
            Connect directly with GST portal to fetch real-time data and file returns
          </p>
        </div>

        {/* Authentication Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              GST Portal Authentication
            </CardTitle>
            <CardDescription>
              Enter GST portal credentials to fetch real-time data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN *</Label>
                <Input
                  id="gstin"
                  placeholder="29ABCDE1234F1Z5"
                  value={formData.gstin}
                  onChange={(e) => handleInputChange('gstin', e.target.value.toUpperCase())}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  placeholder="GST portal username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="GST portal password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={fetchClientDetails} disabled={loading || !formData.gstin || !formData.username || !formData.password}>
                {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Fetch Client Details
              </Button>
              <Button 
                variant="outline" 
                onClick={fetchReturnsHistory} 
                disabled={loading || !formData.gstin || !formData.username || !formData.password}
              >
                <FileText className="mr-2 h-4 w-4" />
                Fetch Returns
              </Button>
              <Button 
                variant="outline" 
                onClick={fetchNotices} 
                disabled={loading || !formData.gstin || !formData.username || !formData.password}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Fetch Notices
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Data Display */}
        <Tabs defaultValue="client" className="space-y-4">
          <TabsList>
            <TabsTrigger value="client">Client Details</TabsTrigger>
            <TabsTrigger value="returns">Returns History</TabsTrigger>
            <TabsTrigger value="notices">Notices</TabsTrigger>
          </TabsList>

          <TabsContent value="client">
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
                <CardDescription>Details fetched from GST portal</CardDescription>
              </CardHeader>
              <CardContent>
                {clientDetails ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">GSTIN</Label>
                        <p className="text-lg font-semibold">{clientDetails.gstin}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Business Name</Label>
                        <p className="text-lg">{clientDetails.businessName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Legal Name</Label>
                        <p className="text-lg">{clientDetails.legalName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Constitution</Label>
                        <p>{clientDetails.constitutionOfBusiness}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Status</Label>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {clientDetails.status}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Taxpayer Type</Label>
                        <p>{clientDetails.taxpayerType}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Registration Date</Label>
                        <p>{new Date(clientDetails.registrationDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Address</Label>
                        <p className="text-sm">{clientDetails.address}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Fetch client details to view information</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="returns">
            <Card>
              <CardHeader>
                <CardTitle>Returns History</CardTitle>
                <CardDescription>GST returns filing history from GST portal</CardDescription>
              </CardHeader>
              <CardContent>
                {returnsHistory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Filed Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Tax Amount</TableHead>
                        <TableHead>Late Fee</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {returnsHistory.map((returnItem, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{returnItem.returnPeriod}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{returnItem.returnType}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(returnItem.status)}>
                              {getStatusIcon(returnItem.status)}
                              <span className="ml-1">{returnItem.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {returnItem.filedDate ? new Date(returnItem.filedDate).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>{new Date(returnItem.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {returnItem.taxAmount ? `₹${returnItem.taxAmount.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell>
                            {returnItem.lateFee ? `₹${returnItem.lateFee.toLocaleString()}` : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Fetch returns history to view filing details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notices">
            <Card>
              <CardHeader>
                <CardTitle>GST Notices</CardTitle>
                <CardDescription>Notices received from GST portal</CardDescription>
              </CardHeader>
              <CardContent>
                {notices.length > 0 ? (
                  <div className="space-y-4">
                    {notices.map((notice, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold">{notice.subject}</h4>
                              <Badge className={getStatusColor(notice.status)}>
                                {getStatusIcon(notice.status)}
                                <span className="ml-1">{notice.status}</span>
                              </Badge>
                              {notice.actionRequired && (
                                <Badge className="bg-red-100 text-red-800">Action Required</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{notice.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Notice: {new Date(notice.noticeDate).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                Due: {new Date(notice.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button size="sm">Reply</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Fetch notices to view compliance requirements</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}