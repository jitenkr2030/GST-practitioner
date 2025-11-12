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
  Image as LucideImage,
  FileVideo,
  FileArchive,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Folder,
  Grid,
  List,
  Calendar,
  User
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import DocumentUpload from '@/components/documents/document-upload'

interface Document {
  id: string
  name: string
  type: string
  filePath: string
  fileSize?: number
  mimeType?: string
  uploadedAt: string
  client: {
    id: string
    businessName: string
    gstin?: string
  }
  category?: string
  tags?: string[]
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [clientFilter, setClientFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      // Mock data for demonstration
      const mockData: Document[] = [
        {
          id: '1',
          name: 'PAN_Card_ABC_Enterprises.pdf',
          type: 'PAN_CARD',
          filePath: '/documents/pan/ABC_Enterprises_PAN.pdf',
          fileSize: 256000,
          mimeType: 'application/pdf',
          uploadedAt: '2024-10-01',
          client: {
            id: '1',
            businessName: 'ABC Enterprises',
            gstin: '29ABCDE1234F1Z5'
          },
          category: 'Identity Proof',
          tags: ['PAN', 'Identity', 'ABC Enterprises']
        },
        {
          id: '2',
          name: 'GST_Certificate_XYZ_Traders.pdf',
          type: 'GST_CERTIFICATE',
          filePath: '/documents/gst/XYZ_Traders_GST_Cert.pdf',
          fileSize: 512000,
          mimeType: 'application/pdf',
          uploadedAt: '2024-10-05',
          client: {
            id: '2',
            businessName: 'XYZ Traders',
            gstin: '27FGHIJ5678G2Z6'
          },
          category: 'GST Registration',
          tags: ['GST', 'Certificate', 'XYZ Traders']
        },
        {
          id: '3',
          name: 'GSTR3B_October_2024.xlsx',
          type: 'INVOICE',
          filePath: '/documents/returns/GSTR3B_Oct_2024.xlsx',
          fileSize: 1024000,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          uploadedAt: '2024-10-10',
          client: {
            id: '1',
            businessName: 'ABC Enterprises',
            gstin: '29ABCDE1234F1Z5'
          },
          category: 'GST Returns',
          tags: ['GSTR-3B', 'October 2024', 'ABC Enterprises']
        },
        {
          id: '4',
          name: 'Notice_Scrutiny_001.pdf',
          type: 'NOTICE',
          filePath: '/documents/notices/Scrutiny_Notice_001.pdf',
          fileSize: 768000,
          mimeType: 'application/pdf',
          uploadedAt: '2024-10-15',
          client: {
            id: '3',
            businessName: 'Tech Solutions Pvt Ltd',
            gstin: '29VWXYZ7890I5Z9'
          },
          category: 'Notices',
          tags: ['Notice', 'Scrutiny', 'Tech Solutions']
        },
        {
          id: '5',
          name: 'Bank_Statement_Sep_2024.pdf',
          type: 'BANK_STATEMENT',
          filePath: '/documents/bank/Bank_Statement_Sep_2024.pdf',
          fileSize: 2048000,
          mimeType: 'application/pdf',
          uploadedAt: '2024-10-20',
          client: {
            id: '2',
            businessName: 'XYZ Traders',
            gstin: '27FGHIJ5678G2Z6'
          },
          category: 'Financial',
          tags: ['Bank Statement', 'September 2024', 'XYZ Traders']
        },
        {
          id: '6',
          name: 'Business_Registration_Certificate.jpg',
          type: 'BUSINESS_CERTIFICATE',
          filePath: '/documents/registration/Business_Cert.jpg',
          fileSize: 128000,
          mimeType: 'image/jpeg',
          uploadedAt: '2024-10-25',
          client: {
            id: '3',
            businessName: 'Tech Solutions Pvt Ltd',
            gstin: '29VWXYZ7890I5Z9'
          },
          category: 'Registration',
          tags: ['Business Registration', 'Certificate', 'Tech Solutions']
        }
      ]
      setDocuments(mockData)
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.client.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = typeFilter === 'all' || doc.type === typeFilter
    const matchesClient = clientFilter === 'all' || doc.client.id === clientFilter
    
    return matchesSearch && matchesType && matchesClient
  })

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <LucideImage className="h-8 w-8 text-blue-600" />
    } else if (mimeType.startsWith('video/')) {
      return <FileVideo className="h-8 w-8 text-purple-600" />
    } else if (mimeType.includes('pdf')) {
      return <FileText className="h-8 w-8 text-red-600" />
    } else if (mimeType.includes('zip') || mimeType.includes('rar')) {
      return <FileArchive className="h-8 w-8 text-yellow-600" />
    } else {
      return <FileText className="h-8 w-8 text-gray-600" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'PAN_CARD': 'bg-blue-100 text-blue-800',
      'AADHAR_CARD': 'bg-green-100 text-green-800',
      'BUSINESS_CERTIFICATE': 'bg-purple-100 text-purple-800',
      'GST_CERTIFICATE': 'bg-orange-100 text-orange-800',
      'INVOICE': 'bg-yellow-100 text-yellow-800',
      'NOTICE': 'bg-red-100 text-red-800',
      'BANK_STATEMENT': 'bg-indigo-100 text-indigo-800',
      'OTHER': 'bg-gray-100 text-gray-800',
    }
    return colors[type] || colors.OTHER
  }

  const getStats = () => {
    const total = documents.length
    const totalSize = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0)
    const clients = new Set(documents.map(doc => doc.client.id)).size
    const types = new Set(documents.map(doc => doc.type)).size

    return { total, totalSize, clients, types }
  }

  const stats = getStats()

  const clients = Array.from(new Set(documents.map(doc => doc.client)))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
            <p className="text-gray-600 mt-2">Organize and manage all client documents in one place</p>
          </div>
          <div className="flex space-x-3">
            <div className="flex rounded-md shadow-sm">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload Documents</DialogTitle>
                  <DialogDescription>
                    Upload and organize documents for your clients
                  </DialogDescription>
                </DialogHeader>
                <DocumentUpload onSuccess={() => setShowUploadDialog(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Documents
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Storage Used
              </CardTitle>
              <Folder className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Clients
              </CardTitle>
              <User className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.clients}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Document Types
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.types}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Document Library</CardTitle>
            <CardDescription>View and manage all uploaded documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search documents by name, client, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Clients</option>
                  {clients.map((client: any) => (
                    <option key={client.id} value={client.id}>
                      {client.businessName}
                    </option>
                  ))}
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="PAN_CARD">PAN Card</option>
                  <option value="AADHAR_CARD">Aadhar Card</option>
                  <option value="BUSINESS_CERTIFICATE">Business Certificate</option>
                  <option value="GST_CERTIFICATE">GST Certificate</option>
                  <option value="INVOICE">Invoice</option>
                  <option value="NOTICE">Notice</option>
                  <option value="BANK_STATEMENT">Bank Statement</option>
                  <option value="OTHER">Other</option>
                </select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Documents Grid/List View */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading documents...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No documents found</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        {getFileIcon(doc.mimeType || 'application/pdf')}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedDocument(doc)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm line-clamp-2" title={doc.name}>
                          {doc.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={getTypeColor(doc.type)}>
                            {doc.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatFileSize(doc.fileSize || 0)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className="text-xs">
                              {doc.client.businessName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-600 truncate">
                            {doc.client.businessName}
                          </span>
                        </div>
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {doc.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                            {doc.tags.length > 2 && (
                              <span className="text-xs text-gray-500">+{doc.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {getFileIcon(doc.mimeType || 'application/pdf')}
                            <div>
                              <div className="font-medium">{doc.name}</div>
                              {doc.tags && doc.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {doc.tags.slice(0, 3).map((tag, index) => (
                                    <span key={index} className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {doc.client.businessName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{doc.client.businessName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(doc.type)}>
                            {doc.type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{formatFileSize(doc.fileSize || 0)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedDocument(doc)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Document Detail Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
            <DialogDescription>
              View document information and metadata
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                {getFileIcon(selectedDocument.mimeType || 'application/pdf')}
                <div className="ml-4">
                  <h3 className="font-medium">{selectedDocument.name}</h3>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedDocument.fileSize || 0)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Document Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Type:</span> 
                      <Badge className={getTypeColor(selectedDocument.type)}>
                        {selectedDocument.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div><span className="text-gray-600">Size:</span> {formatFileSize(selectedDocument.fileSize || 0)}</div>
                    <div><span className="text-gray-600">Uploaded:</span> {new Date(selectedDocument.uploadedAt).toLocaleDateString()}</div>
                    <div><span className="text-gray-600">MIME Type:</span> {selectedDocument.mimeType || 'Unknown'}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Client Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Name:</span> {selectedDocument.client.businessName}</div>
                    <div><span className="text-gray-600">GSTIN:</span> {selectedDocument.client.gstin || 'Not available'}</div>
                  </div>
                </div>
              </div>

              {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.tags.map((tag, index) => (
                      <span key={index} className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button>
                  <Eye className="h-4 w-4 mr-2" />
                  Open Document
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}