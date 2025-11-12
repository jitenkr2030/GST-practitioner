import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { NotificationService } from '@/lib/services/notification-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Run all notification checks
    await NotificationService.runAllChecks()

    return NextResponse.json({ 
      success: true, 
      message: 'Notification checks completed' 
    })
  } catch (error) {
    console.error('Error running notification checks:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}