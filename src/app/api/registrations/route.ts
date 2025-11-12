import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'

// GET all registrations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (clientId) {
      where.clientId = clientId
    }

    const [registrations, total] = await Promise.all([
      db.gSTRegistration.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              businessName: true,
              gstin: true,
              pan: true,
              email: true,
              phone: true,
            }
          },
          documents: {
            select: {
              id: true,
              name: true,
              type: true,
              uploadedAt: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.gSTRegistration.count({ where })
    ])

    return NextResponse.json({
      registrations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}

// POST create new registration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      clientId,
      applicationNo,
      referenceNo,
      status = 'Draft',
      arn,
      effectiveDate,
      documents,
    } = body

    // Validate required fields
    if (!clientId) {
      return NextResponse.json({ error: 'Client is required' }, { status: 400 })
    }

    // Check if client exists
    const client = await db.client.findUnique({
      where: { id: clientId }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Create registration
    const registrationData: any = {
      clientId,
      applicationNo,
      referenceNo,
      status,
      arn,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
    }

    // Set timestamps based on status
    if (status === 'Submitted') {
      registrationData.submittedAt = new Date()
    }
    if (status === 'Approved') {
      registrationData.approvedAt = new Date()
    }

    const registration = await db.gSTRegistration.create({
      data: registrationData
    })

    // Create documents if provided
    if (documents && documents.length > 0) {
      await db.document.createMany({
        data: documents.map((doc: any) => ({
          clientId,
          registrationId: registration.id,
          name: doc.name,
          type: doc.type,
          filePath: doc.filePath,
          mimeType: doc.mimeType,
          fileSize: doc.fileSize,
        }))
      })
    }

    // Update client GST status if registration is approved
    if (status === 'Approved') {
      await db.client.update({
        where: { id: clientId },
        data: { gstStatus: 'ACTIVE' }
      })
    }

    const createdRegistration = await db.gSTRegistration.findUnique({
      where: { id: registration.id },
      include: {
        client: {
          select: {
            id: true,
            businessName: true,
            gstin: true,
            pan: true,
            email: true,
            phone: true,
          }
        },
        documents: {
          select: {
            id: true,
            name: true,
            type: true,
            uploadedAt: true,
          }
        }
      }
    })

    return NextResponse.json(createdRegistration, { status: 201 })
  } catch (error) {
    console.error('Error creating registration:', error)
    return NextResponse.json(
      { error: 'Failed to create registration' },
      { status: 500 }
    )
  }
}