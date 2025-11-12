'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { CalendarIcon, IndianRupee } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.date({
    required_error: 'Due date is required',
  }),
  services: z.array(z.object({
    type: z.string(),
    description: z.string(),
    quantity: z.number().min(1),
    rate: z.number().min(0),
    amount: z.number().min(0)
  })).min(1, 'At least one service is required')
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

interface ServiceItem {
  type: string
  description: string
  quantity: number
  rate: number
  amount: number
}

interface InvoiceFormProps {
  invoiceData?: any
  onSuccess: () => void
  onCancel: () => void
}

const serviceTypes = [
  'GST_REGISTRATION',
  'RETURN_FILING',
  'NOTICE_REPLY',
  'AUDIT_SUPPORT',
  'ITC_RECONCILIATION',
  'REFUND_APPLICATION',
  'CONSULTATION',
  'OTHER'
]

const serviceLabels = {
  'GST_REGISTRATION': 'GST Registration',
  'RETURN_FILING': 'Return Filing',
  'NOTICE_REPLY': 'Notice Reply',
  'AUDIT_SUPPORT': 'Audit Support',
  'ITC_RECONCILIATION': 'ITC Reconciliation',
  'REFUND_APPLICATION': 'Refund Application',
  'CONSULTATION': 'Consultation',
  'OTHER': 'Other Services'
}

export default function InvoiceForm({ invoiceData, onSuccess, onCancel }: InvoiceFormProps) {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<ServiceItem[]>([
    { type: '', description: '', quantity: 1, rate: 0, amount: 0 }
  ])

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: invoiceData?.clientId || '',
      amount: invoiceData?.amount || 0,
      description: invoiceData?.description || '',
      dueDate: invoiceData?.dueDate ? new Date(invoiceData.dueDate) : new Date(),
      services: []
    }
  })

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

  const addService = () => {
    setServices([...services, { type: '', description: '', quantity: 1, rate: 0, amount: 0 }])
  }

  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index))
    }
  }

  const updateService = (index: number, field: keyof ServiceItem, value: any) => {
    const updatedServices = [...services]
    updatedServices[index] = { ...updatedServices[index], [field]: value }
    
    // Calculate amount if quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      updatedServices[index].amount = updatedServices[index].quantity * updatedServices[index].rate
    }
    
    setServices(updatedServices)
    
    // Update total amount
    const totalAmount = updatedServices.reduce((sum, service) => sum + service.amount, 0)
    form.setValue('amount', totalAmount)
  }

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      setLoading(true)
      
      const invoicePayload = {
        ...data,
        services,
        dueDate: data.dueDate.toISOString()
      }

      const url = invoiceData ? `/api/invoices/${invoiceData.id}` : '/api/invoices'
      const method = invoiceData ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoicePayload),
      })

      if (response.ok) {
        onSuccess()
      } else {
        throw new Error('Failed to save invoice')
      }
    } catch (error) {
      console.error('Error saving invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.businessName} ({client.gstin})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter invoice description..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Services Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Services</h3>
            <Button type="button" variant="outline" onClick={addService}>
              Add Service
            </Button>
          </div>

          {services.map((service, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Service {index + 1}</h4>
                {services.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeService(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Service Type</label>
                  <Select
                    value={service.type}
                    onValueChange={(value) => updateService(index, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(serviceLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={service.description}
                    onChange={(e) => updateService(index, 'description', e.target.value)}
                    placeholder="Service description"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    min="1"
                    value={service.quantity}
                    onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Rate (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={service.rate}
                    onChange={(e) => updateService(index, 'rate', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="flex justify-end items-center space-x-2">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="font-semibold">₹{service.amount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Total Amount */}
        <div className="border-t pt-4">
          <div className="flex justify-end items-center space-x-4">
            <span className="text-lg font-semibold">Total Amount:</span>
            <div className="flex items-center text-2xl font-bold text-blue-600">
              <IndianRupee className="h-6 w-6 mr-1" />
              {form.watch('amount').toLocaleString()}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : invoiceData ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </Form>
  )
}