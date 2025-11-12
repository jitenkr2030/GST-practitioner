import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { gstPortalService } from '@/lib/services/gst-portal/gst-portal-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { gstin, username, password, fromYear, toYear } = body

    if (!gstin || !username || !password || !fromYear || !toYear) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Authenticate with GST portal
    const authSuccess = await gstPortalService.authenticate(username, password)
    
    if (!authSuccess) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    // Fetch returns history
    const returnsHistory = await gstPortalService.getReturnsHistory(gstin, fromYear, toYear)

    return NextResponse.json(returnsHistory)
  } catch (error) {
    console.error('Error fetching GST portal returns history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch returns history' },
      { status: 500 }
    )
  }
}