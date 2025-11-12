import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'

// GET all notices
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

    const [notices, total] = await Promise.all([
      db.notice.findMany({
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
        orderBy: { receivedAt: 'desc' },
        skip,
        take: limit
      }),
      db.notice.count({ where })
    ])

    return NextResponse.json({
      notices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching notices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notices' },
      { status: 500 }
    )
  }
}

// POST create new notice
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      clientId,
      noticeNo,
      noticeType,
      subject,
      receivedAt,
      dueDate,
      description,
      documents,
    } = body

    // Validate required fields
    if (!clientId || !noticeType || !subject || !receivedAt || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if client exists
    const client = await db.client.findUnique({
      where: { id: clientId }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Create notice
    const notice = await db.notice.create({
      data: {
        clientId,
        noticeNo,
        noticeType,
        subject,
        receivedAt: new Date(receivedAt),
        dueDate: new Date(dueDate),
        description,
      }
    })

    // Create documents if provided
    if (documents && documents.length > 0) {
      await db.document.createMany({
        data: documents.map((doc: any) => ({
          clientId,
          noticeId: notice.id,
          name: doc.name,
          type: doc.type,
          filePath: doc.filePath,
          mimeType: doc.mimeType,
          fileSize: doc.fileSize,
        }))
      })
    }

    const createdNotice = await db.notice.findUnique({
      where: { id: notice.id },
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

    return NextResponse.json(createdNotice, { status: 201 })
  } catch (error) {
    console.error('Error creating notice:', error)
    return NextResponse.json(
      { error: 'Failed to create notice' },
      { status: 500 }
    )
  }
}