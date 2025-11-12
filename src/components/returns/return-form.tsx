'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, X, Upload, FileText, Download, Plus, Trash2, Calculator } from 'lucide-react'

interface ReturnFormProps {
  returnData?: any
  onSuccess?: () => void
  onCancel?: () => void
}

interface Payment {
  id: string
  amount: number
  status: string
  paidAt?: string
}

export default function ReturnForm({ returnData, onSuccess, onCancel }: ReturnFormProps) {
  const [formData, setFormData] = useState({
    clientId: returnData?.clientId || '',
    returnType: returnData?.returnType || 'GSTR-3B',
    period: returnData?.period || '',
    status: returnData?.status || 'Draft',
    dueDate: returnData?.dueDate ? new Date(returnData.dueDate).toISOString().split('T')[0] : '',
    acknowledgementNo: returnData?.acknowledgementNo || '',
  })

  const [clients, setClients] = useState([])
  const [documents, setDocuments] = useState(returnData?.documents || [])
  const [payments, setPayments] = useState<Payment[]>(returnData?.payments || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchClients()
    if (!formData.dueDate) {
      setDefaultDueDate()
    }
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

  const setDefaultDueDate = () => {
    const today = new Date()
    const dueDate = new Date(today.getFullYear(), today.getMonth() + 1, 20) // 20th of next month
    setFormData(prev => ({
      ...prev,
      dueDate: dueDate.toISOString().split('T')[0]
    }))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const newDocuments = Array.from(files).map((file, index) => ({
        id: `doc-${Date.now()}-${index}`,
        name: file.name,
        type: 'INVOICE',
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

  const addPayment = () => {
    const newPayment: Payment = {
      id: `payment-${Date.now()}`,
      amount: 0,
      status: 'PENDING',
    }
    setPayments(prev => [...prev, newPayment])
  }

  const updatePayment = (paymentId: string, field: string, value: any) => {
    setPayments(prev => prev.map(payment => 
      payment.id === paymentId 
        ? { ...payment, [field]: value }
        : payment
    ))
  }

  const removePayment = (paymentId: string) => {
    setPayments(prev => prev.filter(payment => payment.id !== paymentId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = returnData ? `/api/returns/${returnData.id}` : '/api/returns'
      const method = returnData ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        documents: documents.map(doc => ({
          name: doc.name,
          type: doc.type,
          filePath: `/uploads/${doc.name}`,
        })),
        payments: payments.map(payment => ({
          amount: payment.amount,
          status: payment.status,
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
        throw new Error(data.error || 'Failed to save return')
      }

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getReturnTypeInfo = (returnType: string) => {
    const types: { [key: string]: { description: string; dueDay: number } } = {
      'GSTR-1': { description: 'Details of outward supplies', dueDay: 11 },
      'GSTR-3B': { description: 'Monthly return and payment', dueDay: 20 },
      'GSTR-4': { description: 'Quarterly return for composition taxpayers', dueDay: 18 },
      'GSTR-9': { description: 'Annual return', dueDay: 31 },
    }
    return types[returnType] || { description: 'GST Return', dueDay: 20 }
  }

  const returnTypeInfo = getReturnTypeInfo(formData.returnType)

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
            <CardTitle>Return Information</CardTitle>
            <CardDescription>Enter GST return details</CardDescription>
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
                        {client.businessName} - {client.gstin || 'No GSTIN'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="returnType">Return Type *</Label>
                <Select 
                  value={formData.returnType} 
                  onValueChange={(value) => handleInputChange('returnType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select return type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GSTR-1">GSTR-1 - Outward Supplies</SelectItem>
                    <SelectItem value="GSTR-3B">GSTR-3B - Monthly Return</SelectItem>
                    <SelectItem value="GSTR-4">GSTR-4 - Composition</SelectItem>
                    <SelectItem value="GSTR-9">GSTR-9 - Annual Return</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">{returnTypeInfo.description}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">Period *</Label>
                <Input
                  id="period"
                  value={formData.period}
                  onChange={(e) => handleInputChange('period', e.target.value)}
                  placeholder="MM-YYYY or YYYY"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  {formData.returnType} is due by {returnTypeInfo.dueDay}{returnTypeInfo.dueDay === 1 ? 'st' : returnTypeInfo.dueDay === 2 ? 'nd' : returnTypeInfo.dueDay === 3 ? 'rd' : 'th'} of the month
                </p>
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
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Filed">Filed</SelectItem>
                    <SelectItem value="Processed">Processed</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="acknowledgementNo">Acknowledgement Number</Label>
                <Input
                  id="acknowledgementNo"
                  value={formData.acknowledgementNo}
                  onChange={(e) => handleInputChange('acknowledgementNo', e.target.value)}
                  placeholder="Enter acknowledgement number"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Payment Details
              <Button type="button" variant="outline" size="sm" onClick={addPayment}>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </CardTitle>
            <CardDescription>Manage tax payments for this return</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {payments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calculator className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>No payments added yet</p>
                <Button type="button" variant="outline" className="mt-2" onClick={addPayment}>
                  Add Payment
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium">Payment</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePayment(payment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label>Amount (₹)</Label>
                        <Input
                          type="number"
                          value={payment.amount}
                          onChange={(e) => updatePayment(payment.id, 'amount', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select 
                          value={payment.status} 
                          onValueChange={(value) => updatePayment(payment.id, 'status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="FAILED">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Paid Date</Label>
                        <Input
                          type="date"
                          value={payment.paidAt ? new Date(payment.paidAt).toISOString().split('T')[0] : ''}
                          onChange={(e) => updatePayment(payment.id, 'paidAt', e.target.value)}
                          disabled={payment.status !== 'PAID'}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Supporting Documents</CardTitle>
            <CardDescription>Upload supporting documents for this return</CardDescription>
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
                      accept=".pdf,.jpg,.jpeg,.png,.json,.xlsx"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </Label>
                  <p className="mt-1 text-sm text-gray-500">
                    PDF, JPG, PNG, JSON, Excel up to 10MB each
                  </p>
                </div>
              </div>
            </div>

            {uploading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            {returnData ? 'Update Return' : 'Create Return'}
          </Button>
        </div>
      </form>
    </div>
  )
}