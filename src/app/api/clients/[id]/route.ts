import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'

// GET single client by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await db.client.findUnique({
      where: { id: params.id },
      include: {
        gstRegistrations: {
          orderBy: { createdAt: 'desc' }
        },
        gstReturns: {
          orderBy: { createdAt: 'desc' }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        },
        notices: {
          orderBy: { createdAt: 'desc' }
        },
        documents: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    )
  }
}

// PUT update client by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      gstStatus,
    } = body

    // Check if client exists
    const existingClient = await db.client.findUnique({
      where: { id: params.id }
    })

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Check for duplicate email, PAN, or GSTIN (excluding current client)
    const duplicateClient = await db.client.findFirst({
      where: {
        OR: [
          { email, id: { not: params.id } },
          { pan, id: { not: params.id } },
          ...(gstin ? [{ gstin, id: { not: params.id } }] : [])
        ]
      }
    })

    if (duplicateClient) {
      return NextResponse.json(
        { error: 'Client with this email, PAN, or GSTIN already exists' },
        { status: 400 }
      )
    }

    const client = await db.client.update({
      where: { id: params.id },
      data: {
        ...(businessName && { businessName }),
        ...(gstin !== undefined && { gstin }),
        ...(pan && { pan }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(address !== undefined && { address }),
        ...(state !== undefined && { state }),
        ...(businessType !== undefined && { businessType }),
        ...(gstStatus && { gstStatus }),
      }
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    )
  }
}

// DELETE client by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if client exists
    const existingClient = await db.client.findUnique({
      where: { id: params.id }
    })

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    await db.client.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Client deleted successfully' })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    )
  }
}