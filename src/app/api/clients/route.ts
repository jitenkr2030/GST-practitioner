import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'

// GET all clients
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    let whereClause: any = {}
    
    if (search) {
      whereClause.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { gstin: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status && status !== 'all') {
      whereClause.gstStatus = status.toUpperCase()
    }

    const clients = await db.client.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            gstReturns: true,
            gstRegistrations: true,
            notices: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

// POST create new client
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      businessName,
      gstin,
      pan,
      email,
      phone,
      address,
      state,
      businessType,
    } = body

    // Validate required fields
    if (!businessName || !pan || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if client with same email or PAN already exists
    const existingClient = await db.client.findFirst({
      where: {
        OR: [
          { email },
          { pan },
          ...(gstin ? [{ gstin }] : [])
        ]
      }
    })

    if (existingClient) {
      return NextResponse.json(
        { error: 'Client with this email, PAN, or GSTIN already exists' },
        { status: 400 }
      )
    }

    const client = await db.client.create({
      data: {
        businessName,
        gstin,
        pan,
        email,
        phone,
        address,
        state,
        businessType,
        gstStatus: gstin ? 'ACTIVE' : 'INACTIVE',
        createdBy: session.user.id,
        userId: session.user.id,
      }
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    )
  }
}