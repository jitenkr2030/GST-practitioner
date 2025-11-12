'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { 
  Menu, 
  Home, 
  Users, 
  FileText, 
  Bell, 
  BarChart3, 
  Settings,
  LogOut,
  ChevronRight,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MobileLayoutProps {
  children: React.ReactNode
}

const menuItems = [
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/clients', icon: Users, label: 'Clients' },
  { href: '/registrations', icon: FileText, label: 'Registrations' },
  { href: '/returns', icon: FileText, label: 'Returns' },
  { href: '/notices', icon: Bell, label: 'Notices' },
  { href: '/reports', icon: BarChart3, label: 'Reports' },
  { href: '/gst-portal', icon: Search, label: 'GST Portal' },
  { href: '/settings', icon: Settings, label: 'Settings' }
]

export default function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname()
  const [unreadNotices, setUnreadNotices] = useState(3)
  const [overdueTasks, setOverdueTasks] = useState(2)

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  {/* Logo */}
                  <div className="p-4 border-b">
                    <h1 className="text-xl font-bold text-blue-600">MyGSTDesk</h1>
                    <p className="text-xs text-gray-500">Mobile App</p>
                  </div>

                  {/* Navigation */}
                  <nav className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-2">
                      {menuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </div>
                            {isActive && <ChevronRight className="h-4 w-4" />}
                          </Link>
                        )
                      })}
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Quick Actions
                      </h3>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Client
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <FileText className="h-4 w-4 mr-2" />
                          File Return
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Bell className="h-4 w-4 mr-2" />
                          Add Notice
                        </Button>
                      </div>
                    </div>
                  </nav>

                  {/* Footer */}
                  <div className="p-4 border-t">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">MyGSTDesk</h1>
              <p className="text-xs text-gray-500">Mobile</p>
            </div>
          </div>
          
          {/* Notifications */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {unreadNotices > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {unreadNotices}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="sticky bottom-0 z-50 bg-white border-t border-gray-200 px-2 py-1">
        <div className="flex justify-around">
          {menuItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center p-2 rounded-lg min-w-[60px] ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <Button size="lg" className="rounded-full h-14 w-14 shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Quick Stats Bar */}
      <div className="sticky top-16 z-40 bg-blue-600 text-white px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4" />
              <span>12 Tasks</span>
            </div>
            <div className="flex items-center space-x-1">
              <AlertTriangle className="h-4 w-4" />
              <span>{overdueTasks} Overdue</span>
            </div>
          </div>
          <div className="text-xs">
            Today: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  )
}