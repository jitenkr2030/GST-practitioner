'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, X, Upload, FileText, CheckCircle, AlertTriangle } from 'lucide-react'

interface ReconciliationFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ReconciliationForm({ onSuccess, onCancel }: ReconciliationFormProps) {
  const [formData, setFormData] = useState({
    clientId: '',
    period: '',
    fileType: 'excel',
  })

  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [uploadResults, setUploadResults] = useState<any>(null)

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
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    setUploadStatus('processing')

    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock processing results
      const mockResults = {
        totalInvoices: 150,
        matched: 120,
        unmatched: 25,
        partialMatch: 5,
        totalITC: 2250000,
        availableITC: 2100000,
        discrepancies: [
          { type: 'Missing in GSTR-2B', count: 20 },
          { type: 'Tax Amount Mismatch', count: 8 },
          { type: 'Supplier GSTIN Mismatch', count: 2 },
        ]
      }

      setUploadResults(mockResults)
      setUploadStatus('success')
    } catch (error) {
      setError('Failed to process file')
      setUploadStatus('error')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
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
            <CardTitle>Upload Purchase Register</CardTitle>
            <CardDescription>Select client and upload purchase data for ITC reconciliation</CardDescription>
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
                <Label htmlFor="period">Period *</Label>
                <Select 
                  value={formData.period} 
                  onValueChange={(value) => handleInputChange('period', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Oct 2024">October 2024</SelectItem>
                    <SelectItem value="Sep 2024">September 2024</SelectItem>
                    <SelectItem value="Aug 2024">August 2024</SelectItem>
                    <SelectItem value="Jul 2024">July 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fileType">File Type</Label>
                <Select 
                  value={formData.fileType} 
                  onValueChange={(value) => handleInputChange('fileType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                    <SelectItem value="json">JSON (.json)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Purchase Data</CardTitle>
            <CardDescription>
              Upload your purchase register file for automatic reconciliation with GSTR-2B
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload purchase register
                    </span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".xlsx,.xls,.csv,.json"
                      onChange={handleFileUpload}
                      disabled={uploading || !formData.clientId || !formData.period}
                    />
                  </Label>
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.fileType === 'excel' ? 'XLSX, XLS' : 
                     formData.fileType === 'csv' ? 'CSV' : 'JSON'} up to 10MB
                  </p>
                </div>
              </div>
            </div>

            {uploading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Processing file and reconciling with GSTR-2B...</span>
              </div>
            )}

            {/* Upload Results */}
            {uploadStatus === 'success' && uploadResults && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="text-sm font-medium text-green-800">Reconciliation Complete!</h4>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{uploadResults.totalInvoices}</div>
                    <div className="text-xs text-gray-600">Total Invoices</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{uploadResults.matched}</div>
                    <div className="text-xs text-gray-600">Matched</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{uploadResults.unmatched}</div>
                    <div className="text-xs text-gray-600">Unmatched</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{uploadResults.partialMatch}</div>
                    <div className="text-xs text-gray-600">Partial Match</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">ITC Summary</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total ITC:</span>
                        <span className="font-medium">₹{uploadResults.totalITC.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Available ITC:</span>
                        <span className="font-medium text-green-600">₹{uploadResults.availableITC.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lost ITC:</span>
                        <span className="font-medium text-red-600">
                          ₹{(uploadResults.totalITC - uploadResults.availableITC).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h5 className="text-sm font-medium text-orange-900 mb-2">Discrepancies</h5>
                    <div className="space-y-1 text-sm">
                      {uploadResults.discrepancies.map((disc: any, index: number) => (
                        <div key={index} className="flex justify-between">
                          <span>{disc.type}:</span>
                          <Badge variant="outline" className="text-xs">
                            {disc.count} invoices
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <h4 className="text-sm font-medium text-red-800">Upload Failed</h4>
                </div>
                <p className="mt-2 text-sm text-red-700">
                  Please check your file format and try again. Make sure the file contains the required columns: Invoice No, Invoice Date, Supplier Name, Supplier GSTIN, Invoice Value, Tax Amount.
                </p>
              </div>
            )}

            {/* File Format Requirements */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-900 mb-3">Required File Format:</h5>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Required Columns:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Invoice Number</li>
                  <li>Invoice Date (DD/MM/YYYY)</li>
                  <li>Supplier Name</li>
                  <li>Supplier GSTIN</li>
                  <li>Invoice Value</li>
                  <li>Tax Amount</li>
                </ul>
                <p className="mt-2"><strong>Optional Columns:</strong> HSN Code, Place of Supply</p>
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
          <Button type="submit" disabled={loading || uploadStatus !== 'success'}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save Reconciliation
          </Button>
        </div>
      </form>
    </div>
  )
}