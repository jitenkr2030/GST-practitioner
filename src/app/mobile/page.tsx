'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Smartphone, 
  QrCode, 
  Download, 
  Upload, 
  Camera,
  FileText,
  Calendar,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  AlertTriangle,
  Clock,
  Plus,
  Search,
  Filter,
  Bell,
  User,
  BarChart3
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface MobileFeature {
  title: string
  description: string
  icon: any
  status: 'available' | 'coming-soon' | 'in-development'
  priority: 'high' | 'medium' | 'low'
}

export default function MobileAppPage() {
  const [selectedFeature, setSelectedFeature] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')

  const features: MobileFeature[] = [
    {
      title: 'Client Onboarding',
      description: 'Add new clients and capture GST details using mobile camera',
      icon: User,
      status: 'available',
      priority: 'high'
    },
    {
      title: 'Document Scanner',
      description: 'Scan PAN cards, GST certificates, and other documents',
      icon: Camera,
      status: 'available',
      priority: 'high'
    },
    {
      title: 'Return Filing',
      description: 'File GST returns on-the-go with mobile-optimized forms',
      icon: FileText,
      status: 'available',
      priority: 'high'
    },
    {
      title: 'Notice Management',
      description: 'Receive instant notifications and respond to notices',
      icon: Bell,
      status: 'available',
      priority: 'high'
    },
    {
      title: 'Payment Tracking',
      description: 'Track GST payments and generate challans from mobile',
      icon: BarChart3,
      status: 'in-development',
      priority: 'medium'
    },
    {
      title: 'Location Services',
      description: 'Auto-capture client location during field visits',
      icon: MapPin,
      status: 'in-development',
      priority: 'medium'
    },
    {
      title: 'Offline Mode',
      description: 'Work offline and sync data when internet is available',
      icon: Smartphone,
      status: 'coming-soon',
      priority: 'medium'
    },
    {
      title: 'Biometric Auth',
      description: 'Secure login with fingerprint and face recognition',
      icon: CheckCircle,
      status: 'coming-soon',
      priority: 'low'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'in-development':
        return 'bg-yellow-100 text-yellow-800'
      case 'coming-soon':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50'
      case 'medium':
        return 'border-yellow-200 bg-yellow-50'
      case 'low':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const filteredFeatures = features.filter(feature =>
    feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feature.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mobile Companion App</h1>
              <p className="text-gray-600 mt-2">Field-ready mobile application for GST practitioners</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <QrCode className="h-4 w-4 mr-2" />
                Download QR
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Get App
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Features</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {features.filter(f => f.status === 'available').length}
              </div>
              <p className="text-xs text-gray-600">Ready to use</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Development</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {features.filter(f => f.status === 'in-development').length}
              </div>
              <p className="text-xs text-gray-600">Coming soon</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {features.filter(f => f.priority === 'high').length}
              </div>
              <p className="text-xs text-gray-600">Critical features</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Support</CardTitle>
              <Smartphone className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">2</div>
              <p className="text-xs text-gray-600">iOS & Android</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Mobile App Features</CardTitle>
            <CardDescription>Comprehensive field capabilities for GST practitioners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in-development">In Development</SelectItem>
                  <SelectItem value="coming-soon">Coming Soon</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredFeatures.map((feature, index) => (
            <Card key={index} className={`hover:shadow-lg transition-shadow ${getPriorityColor(feature.priority)}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <div className="flex space-x-2 mt-1">
                        <Badge className={getStatusColor(feature.status)}>
                          {feature.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {feature.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {feature.description}
                </CardDescription>
                <div className="space-y-2">
                  {feature.status === 'available' && (
                    <Button size="sm" className="w-full">
                      <Smartphone className="h-4 w-4 mr-2" />
                      Use Feature
                    </Button>
                  )}
                  {feature.status === 'in-development' && (
                    <Button size="sm" variant="outline" className="w-full">
                      <Clock className="h-4 w-4 mr-2" />
                      In Development
                    </Button>
                  )}
                  {feature.status === 'coming-soon' && (
                    <Button size="sm" variant="outline" className="w-full" disabled>
                      <Bell className="h-4 w-4 mr-2" />
                      Coming Soon
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* App Download Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Download Mobile App</CardTitle>
            <CardDescription>Get the mobile companion app on your device</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">iOS App</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">i</span>
                    </div>
                    <div>
                      <p className="font-medium">Download from App Store</p>
                      <p className="text-sm text-gray-600">iOS 14.0 or later</p>
                    </div>
                    <Button className="ml-auto">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Android App</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">A</span>
                    </div>
                    <div>
                      <p className="font-medium">Download from Google Play</p>
                      <p className="text-sm text-gray-600">Android 8.0 or later</p>
                    </div>
                    <Button className="ml-auto">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Key Benefits</CardTitle>
            <CardDescription>Why use our mobile companion app</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Camera className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Document Scanning</h4>
                  <p className="text-sm text-gray-600">Capture and upload documents directly from your phone</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Location Tracking</h4>
                  <p className="text-sm text-gray-600">Auto-capture client locations during field visits</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bell className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium">Real-time Alerts</h4>
                  <p className="text-sm text-gray-600">Get instant notifications for important deadlines</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium">Offline Mode</h4>
                  <p className="text-sm text-gray-600">Work without internet and sync when connected</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <h4 className="font-medium">Secure Access</h4>
                  <p className="text-sm text-gray-600">Biometric authentication for enhanced security</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-medium">Analytics on Go</h4>
                  <p className="text-sm text-gray-600">Access practice analytics from anywhere</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}