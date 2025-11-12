'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { CalendarIcon, Save, X, Upload, FileText, Download, Plus, Trash2 } from 'lucide-react'

interface NoticeFormProps {
  notice?: any
  onSuccess?: () => void
  onCancel?: () => void
}

interface Document {
  id: string
  name: string
  type: string
  uploadedAt: string
}

export default function NoticeForm({ notice, onSuccess, onCancel }: NoticeFormProps) {
  const [formData, setFormData] = useState({
    clientId: notice?.clientId || '',
    noticeNo: notice?.noticeNo || '',
    noticeType: notice?.noticeType || '',
    subject: notice?.subject || '',
    receivedAt: notice?.receivedAt ? new Date(notice.receivedAt).toISOString().split('T')[0] : '',
    dueDate: notice?.dueDate ? new Date(notice.dueDate).toISOString().split('T')[0] : '',
    status: notice?.status || 'RECEIVED',
    description: notice?.description || '',
    replyDraft: notice?.replyDraft || '',
  })

  const [clients, setClients] = useState([])
  const [documents, setDocuments] = useState<Document[]>(notice?.documents || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      // Simulate file upload - in real app, upload to cloud storage
      const newDocuments = Array.from(files).map((file, index) => ({
        id: `doc-${Date.now()}-${index}`,
        name: file.name,
        type: 'NOTICE', // Default to NOTICE type for notice documents
        uploadedAt: new Date().toISOString(),
      }))
      
      setDocuments(prev => [...prev, ...newDocuments])
    } catch (error) {
      setError('Failed to upload files')
    } finally {
      setUploading(false)
    }
  }

  const removeDocument = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = notice ? `/api/notices/${notice.id}` : '/api/notices'
      const method = notice ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        documents: documents.map(doc => ({
          name: doc.name,
          type: doc.type,
          filePath: `/uploads/${doc.name}`, // Simulated file path
        })),
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save notice')
      }

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getDocumentTypeColor = (type: string) => {
    const typeColors: { [key: string]: string } = {
      'NOTICE': 'bg-red-100 text-red-800',
      'REPLY': 'bg-blue-100 text-blue-800',
      'OTHER': 'bg-gray-100 text-gray-800',
    }
    return typeColors[type] || typeColors.OTHER
  }

  const isOverdue = () => {
    if (!formData.dueDate) return false
    return new Date(formData.dueDate) < new Date()
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter notice details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Client *</Label>
                <Select 
                  value={formData.clientId} 
                  onValueChange={(value) => handleInputChange('clientId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.businessName} - {client.pan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="noticeType">Notice Type *</Label>
                <Select 
                  value={formData.noticeType} 
                  onValueChange={(value) => handleInputChange('noticeType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select notice type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCRUTINY">Scrutiny Notice</SelectItem>
                    <SelectItem value="ASSESSMENT">Assessment Order</SelectItem>
                    <SelectItem value="DEMAND">Demand Notice</SelectItem>
                    <SelectItem value="RECOVERY">Recovery Notice</SelectItem>
                    <SelectItem value="INVESTIGATION">Investigation Notice</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="noticeNo">Notice Number</Label>
                <Input
                  id="noticeNo"
                  value={formData.noticeNo}
                  onChange={(e) => handleInputChange('noticeNo', e.target.value)}
                  placeholder="Enter notice number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RECEIVED">Received</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="REPLIED">Replied</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receivedAt">Received Date *</Label>
                <Input
                  id="receivedAt"
                  type="date"
                  value={formData.receivedAt}
                  onChange={(e) => handleInputChange('receivedAt', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className={isOverdue() ? 'border-red-500' : ''}
                />
                {isOverdue() && (
                  <p className="text-sm text-red-600">This notice is overdue!</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Enter notice subject"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter notice description"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Reply Draft */}
        <Card>
          <CardHeader>
            <CardTitle>Reply Draft</CardTitle>
            <CardDescription>Prepare a response to the notice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="replyDraft">Reply Content</Label>
              <Textarea
                id="replyDraft"
                value={formData.replyDraft}
                onChange={(e) => handleInputChange('replyDraft', e.target.value)}
                placeholder="Draft your reply to the notice..."
                rows={6}
              />
            </div>
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Notice Documents</CardTitle>
            <CardDescription>Upload the notice document and any supporting materials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload documents
                    </span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </Label>
                  <p className="mt-1 text-sm text-gray-500">
                    PDF, JPG, PNG up to 10MB each
                  </p>
                </div>
              </div>
            </div>

            {uploading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                <span>Uploading files...</span>
              </div>
            )}

            {/* Document List */}
            {documents.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Uploaded Documents</h4>
                <div className="border rounded-lg divide-y">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getDocumentTypeColor(doc.type)}>
                          {doc.type.replace('_', ' ')}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
            <Save className="h-4 w-4 mr-2" />
            {notice ? 'Update Notice' : 'Create Notice'}
          </Button>
        </div>
      </form>
    </div>
  )
}