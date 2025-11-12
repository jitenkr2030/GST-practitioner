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
    const { gstin, username, password } = body

    if (!gstin || !username || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Authenticate with GST portal
    const authSuccess = await gstPortalService.authenticate(username, password)
    
    if (!authSuccess) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    // Fetch client details
    const clientDetails = await gstPortalService.getClientDetails(gstin)

    if (!clientDetails) {
      return NextResponse.json({ error: 'Failed to fetch client details' }, { status: 404 })
    }

    return NextResponse.json(clientDetails)
  } catch (error) {
    console.error('Error fetching GST portal client details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch client details' },
      { status: 500 }
    )
  }
}