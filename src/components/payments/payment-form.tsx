'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, X, FileText, Download, Plus, CreditCard } from 'lucide-react'

interface PaymentFormProps {
  paymentData?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export default function PaymentForm({ paymentData, onSuccess, onCancel }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    clientId: paymentData?.clientId || '',
    returnId: paymentData?.returnId || '',
    challanNo: paymentData?.challanNo || '',
    paymentType: paymentData?.paymentType || 'GST',
    amount: paymentData?.amount || '',
    status: paymentData?.status || 'PENDING',
    bankReference: paymentData?.bankReference || '',
    paidAt: paymentData?.paidAt ? new Date(paymentData.paidAt).toISOString().split('T')[0] : '',
  })

  const [clients, setClients] = useState([])
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchClients()
    if (formData.clientId) {
      fetchReturns(formData.clientId)
    }
  }, [formData.clientId])

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

  const fetchReturns = async (clientId: string) => {
    try {
      const response = await fetch(`/api/returns?clientId=${clientId}`)
      if (response.ok) {
        const data = await response.json()
        // Filter returns that don't have payments or have pending payments
        const availableReturns = data.filter((ret: any) => {
          return !ret.payments?.some((p: any) => p.status === 'PAID')
        })
        setReturns(availableReturns)
      }
    } catch (error) {
      console.error('Error fetching returns:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (field === 'clientId') {
      setReturns([])
      setFormData(prev => ({ ...prev, returnId: '' }))
      if (value) {
        fetchReturns(value)
      }
    }
  }

  const generateChallanNo = () => {
    const timestamp = Date.now().toString()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const challanNo = `PMT${timestamp.slice(-6)}${random}`
    setFormData(prev => ({ ...prev, challanNo }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = paymentData ? `/api/payments/${paymentData.id}` : '/api/payments'
      const method = paymentData ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        paidAt: formData.status === 'PAID' && formData.paidAt ? new Date(formData.paidAt) : null,
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
        throw new Error(data.error || 'Failed to save payment')
      }

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getPaymentTypeInfo = (type: string) => {
    const types: { [key: string]: { description: string; color: string } } = {
      'GST': { description: 'GST Tax Payment', color: 'bg-blue-100 text-blue-800' },
      'INTEREST': { description: 'Interest Payment', color: 'bg-yellow-100 text-yellow-800' },
      'PENALTY': { description: 'Penalty Payment', color: 'bg-red-100 text-red-800' },
      'LATE FEE': { description: 'Late Fee Payment', color: 'bg-purple-100 text-purple-800' },
      'OTHERS': { description: 'Other Payment', color: 'bg-gray-100 text-gray-800' },
    }
    return types[type] || types.OTHERS
  }

  const paymentTypeInfo = getPaymentTypeInfo(formData.paymentType)

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
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>Enter GST payment details</CardDescription>
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
                <Label htmlFor="returnId">GST Return (Optional)</Label>
                <Select 
                  value={formData.returnId} 
                  onValueChange={(value) => handleInputChange('returnId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select return (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific return</SelectItem>
                    {returns.map((ret: any) => (
                      <SelectItem key={ret.id} value={ret.id}>
                        {ret.returnType} - {ret.period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentType">Payment Type *</Label>
                <Select 
                  value={formData.paymentType} 
                  onValueChange={(value) => handleInputChange('paymentType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GST">GST Tax</SelectItem>
                    <SelectItem value="INTEREST">Interest</SelectItem>
                    <SelectItem value="PENALTY">Penalty</SelectItem>
                    <SelectItem value="LATE FEE">Late Fee</SelectItem>
                    <SelectItem value="OTHERS">Others</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">{paymentTypeInfo.description}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="challanNo">Challan Number</Label>
                <div className="flex space-x-2">
                  <Input
                    id="challanNo"
                    value={formData.challanNo}
                    onChange={(e) => handleInputChange('challanNo', e.target.value)}
                    placeholder="Enter challan number"
                  />
                  <Button type="button" variant="outline" onClick={generateChallanNo}>
                    Generate
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.status === 'PAID' && (
                <div className="space-y-2">
                  <Label htmlFor="paidAt">Payment Date</Label>
                  <Input
                    id="paidAt"
                    type="date"
                    value={formData.paidAt}
                    onChange={(e) => handleInputChange('paidAt', e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="bankReference">Bank Reference</Label>
                <Input
                  id="bankReference"
                  value={formData.bankReference}
                  onChange={(e) => handleInputChange('bankReference', e.target.value)}
                  placeholder="Enter bank reference number"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
            <CardDescription>Review payment details before saving</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment Type:</span>
                  <Badge className={paymentTypeInfo.color}>
                    {formData.paymentType}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="font-bold">₹{parseFloat(formData.amount || '0').toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={
                    formData.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    formData.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                    formData.status === 'REFUNDED' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }>
                    {formData.status}
                  </Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Challan No:</span>
                  <span className="font-mono text-sm">{formData.challanNo || 'Not generated'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bank Reference:</span>
                  <span className="text-sm">{formData.bankReference || 'Not provided'}</span>
                </div>
                {formData.status === 'PAID' && formData.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Paid Date:</span>
                    <span className="text-sm">{new Date(formData.paidAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
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
            {paymentData ? 'Update Payment' : 'Create Payment'}
          </Button>
        </div>
      </form>
    </div>
  )
}