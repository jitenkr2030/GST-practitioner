import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'

// GET all returns
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    let whereClause: any = {}
    
    if (search) {
      whereClause.OR = [
        { period: { contains: search, mode: 'insensitive' } },
        { acknowledgementNo: { contains: search, mode: 'insensitive' } },
        { client: { businessName: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (status && status !== 'all') {
      whereClause.status = status
    }

    if (type && type !== 'all') {
      whereClause.returnType = type
    }

    const returns = await db.gSTReturn.findMany({
      where: whereClause,
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
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            paidAt: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(returns)
  } catch (error) {
    console.error('Error fetching returns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch returns' },
      { status: 500 }
    )
  }
}

// POST create new return
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      clientId,
      returnType,
      period,
      status,
      dueDate,
      acknowledgementNo,
      documents,
      payments,
    } = body

    // Validate required fields
    if (!clientId || !returnType || !period || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if client exists
    const client = await db.client.findUnique({
      where: { id: clientId }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const returnData = await db.gSTReturn.create({
      data: {
        clientId,
        returnType,
        period,
        status: status || 'Draft',
        dueDate: new Date(dueDate),
        acknowledgementNo,
        filedAt: status === 'Filed' ? new Date() : null,
        processedAt: status === 'Processed' ? new Date() : null,
      }
    })

    // Create documents if provided
    if (documents && documents.length > 0) {
      await db.document.createMany({
        data: documents.map((doc: any) => ({
          clientId,
          returnId: returnData.id,
          name: doc.name,
          type: doc.type,
          filePath: doc.filePath,
          mimeType: doc.mimeType,
          fileSize: doc.fileSize,
        }))
      })
    }

    // Create payments if provided
    if (payments && payments.length > 0) {
      await db.gSTPayment.createMany({
        data: payments.map((payment: any) => ({
          clientId,
          returnId: returnData.id,
          amount: payment.amount,
          status: payment.status,
          paidAt: payment.status === 'PAID' ? new Date() : null,
        }))
      })
    }

    const createdReturn = await db.gSTReturn.findUnique({
      where: { id: returnData.id },
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
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            paidAt: true,
          }
        }
      }
    })

    return NextResponse.json(createdReturn, { status: 201 })
  } catch (error) {
    console.error('Error creating return:', error)
    return NextResponse.json(
      { error: 'Failed to create return' },
      { status: 500 }
    )
  }
}