'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  FileText,
  Calendar,
  User,
  Building,
  CheckCircle,
  Clock,
  AlertTriangle,
  Reply,
  Flag
} from 'lucide-react'
import NoticeForm from '@/components/notices/notice-form'
import DashboardLayout from '@/components/layout/dashboard-layout'

interface Notice {
  id: string
  noticeNo?: string
  noticeType: string
  subject: string
  receivedAt: string
  dueDate: string
  status: string
  description?: string
  replyDraft?: string
  repliedAt?: string
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
}

interface NoticesResponse {
  notices: Notice[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  useEffect(() => {
    fetchNotices()
  }, [currentPage, statusFilter])

  const fetchNotices = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      
      if (statusFilter) {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/notices?${params}`)
      if (response.ok) {
        const data: NoticesResponse = await response.json()
        setNotices(data.notices)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching notices:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'RECEIVED': 'bg-red-100 text-red-800',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
      'REPLIED': 'bg-blue-100 text-blue-800',
      'RESOLVED': 'bg-green-100 text-green-800'
    }
    return colors[status] || colors.RECEIVED
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return <CheckCircle className="h-4 w-4" />
      case 'REPLIED':
        return <Reply className="h-4 w-4" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4" />
      case 'RECEIVED':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getNoticeTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'SCRUTINY': 'bg-purple-100 text-purple-800',
      'ASSESSMENT': 'bg-orange-100 text-orange-800',
      'DEMAND': 'bg-red-100 text-red-800',
      'RECOVERY': 'bg-red-100 text-red-800',
      'INVESTIGATION': 'bg-yellow-100 text-yellow-800',
      'OTHER': 'bg-gray-100 text-gray-800'
    }
    return colors[type] || colors.OTHER
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const filteredNotices = notices.filter(notice => 
    notice.client.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notice.client.pan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notice.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notice.noticeNo?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false)
    fetchNotices()
  }

  const handleViewNotice = (notice: Notice) => {
    setSelectedNotice(notice)
    setIsViewDialogOpen(true)
  }

  const overdueCount = notices.filter(notice => isOverdue(notice.dueDate)).length
  const criticalCount = notices.filter(notice => notice.status === 'RECEIVED' && isOverdue(notice.dueDate)).length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">GST Notices</h1>
            <p className="text-gray-600 mt-2">Manage GST notices and compliance requirements</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Notice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Notice</DialogTitle>
                <DialogDescription>
                  Record a new GST notice received from tax authorities
                </DialogDescription>
              </DialogHeader>
              <NoticeForm onSuccess={handleCreateSuccess} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notices.length}</div>
              <p className="text-xs text-muted-foreground">All notices</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {notices.filter(n => n.status === 'IN_PROGRESS').length}
              </div>
              <p className="text-xs text-muted-foreground">Being processed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {notices.filter(n => n.status === 'RESOLVED').length}
              </div>
              <p className="text-xs text-muted-foreground">Successfully resolved</p>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts */}
        {criticalCount > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Critical Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">
                You have {criticalCount} overdue notice{criticalCount !== 1 ? 's' : ''} that require immediate attention!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by business name, PAN, or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="RECEIVED">Received</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="REPLIED">Replied</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notices Table */}
        <Card>
          <CardHeader>
            <CardTitle>GST Notices</CardTitle>
            <CardDescription>List of all GST notices received</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Notice No.</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days Left</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotices.map((notice) => {
                    const daysLeft = Math.ceil((new Date(notice.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    const isNoticeOverdue = isOverdue(notice.dueDate)
                    
                    return (
                      <TableRow key={notice.id} className={isNoticeOverdue ? 'bg-red-50' : ''}>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center">
                              <Building className="h-4 w-4 mr-2" />
                              {notice.client.businessName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {notice.client.pan}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {notice.noticeNo || (
                            <span className="text-gray-400">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getNoticeTypeColor(notice.noticeType)}>
                            {notice.noticeType.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(notice.status)}>
                            {getStatusIcon(notice.status)}
                            <span className="ml-1">{notice.status.replace('_', ' ')}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={isNoticeOverdue ? 'text-red-600 font-medium' : ''}>
                            {new Date(notice.dueDate).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={isNoticeOverdue ? 'text-red-600 font-medium' : daysLeft <= 3 ? 'text-yellow-600 font-medium' : ''}>
                            {isNoticeOverdue ? 'Overdue' : `${daysLeft} days`}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewNotice(notice)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View Notice Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Notice Details</DialogTitle>
              <DialogDescription>
                View and manage notice details and response
              </DialogDescription>
            </DialogHeader>
            {selectedNotice && (
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="reply">Reply</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Business Name</label>
                      <p className="text-sm text-gray-600">{selectedNotice.client.businessName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">PAN</label>
                      <p className="text-sm text-gray-600">{selectedNotice.client.pan}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Notice Number</label>
                      <p className="text-sm text-gray-600">
                        {selectedNotice.noticeNo || 'Not assigned'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Notice Type</label>
                      <Badge className={getNoticeTypeColor(selectedNotice.noticeType)}>
                        {selectedNotice.noticeType.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Received Date</label>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedNotice.receivedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Due Date</label>
                      <p className={`text-sm ${isOverdue(selectedNotice.dueDate) ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                        {new Date(selectedNotice.dueDate).toLocaleDateString()}
                        {isOverdue(selectedNotice.dueDate) && ' (Overdue)'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Badge className={getStatusColor(selectedNotice.status)}>
                        {getStatusIcon(selectedNotice.status)}
                        <span className="ml-1">{selectedNotice.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Replied At</label>
                      <p className="text-sm text-gray-600">
                        {selectedNotice.repliedAt 
                          ? new Date(selectedNotice.repliedAt).toLocaleDateString() 
                          : 'Not replied'
                        }
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="description" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Subject</label>
                    <p className="text-lg font-medium mt-1">{selectedNotice.subject}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedNotice.description || 'No description provided'}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="reply" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Reply Draft</label>
                    <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedNotice.replyDraft || 'No reply drafted yet'}
                      </p>
                    </div>
                  </div>
                  {selectedNotice.status !== 'REPLIED' && (
                    <Button>
                      <Reply className="h-4 w-4 mr-2" />
                      Mark as Replied
                    </Button>
                  )}
                </TabsContent>
                
                <TabsContent value="documents" className="space-y-4">
                  <div className="space-y-2">
                    {selectedNotice.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              {doc.type.replace('_', ' ')} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </div>
                    ))}
                    {selectedNotice.documents.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No documents uploaded</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}