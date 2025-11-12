import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'

// GET all payments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')

    let whereClause: any = {}
    
    if (search) {
      whereClause.OR = [
        { challanNo: { contains: search, mode: 'insensitive' } },
        { bankReference: { contains: search, mode: 'insensitive' } },
        { client: { businessName: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (status && status !== 'all') {
      whereClause.status = status
    }

    if (clientId) {
      whereClause.clientId = clientId
    }

    const payments = await db.gSTPayment.findMany({
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
        gstReturn: {
          select: {
            id: true,
            returnType: true,
            period: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

// POST create new payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      clientId,
      returnId,
      challanNo,
      paymentType,
      amount,
      status,
      bankReference,
      paidAt,
    } = body

    // Validate required fields
    if (!clientId || !paymentType || !amount || !status) {
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

    // If returnId is provided, check if return exists
    if (returnId) {
      const gstReturn = await db.gSTReturn.findUnique({
        where: { id: returnId }
      })

      if (!gstReturn) {
        return NextResponse.json({ error: 'GST return not found' }, { status: 404 })
      }
    }

    const payment = await db.gSTPayment.create({
      data: {
        clientId,
        returnId,
        challanNo,
        paymentType,
        amount: parseFloat(amount),
        status,
        bankReference,
        paidAt: status === 'PAID' && paidAt ? new Date(paidAt) : null,
      }
    })

    // Update return status if payment is paid and linked to a return
    if (status === 'PAID' && returnId) {
      await db.gSTReturn.update({
        where: { id: returnId },
        data: { status: 'Filed' }
      })
    }

    const createdPayment = await db.gSTPayment.findUnique({
      where: { id: payment.id },
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
        gstReturn: {
          select: {
            id: true,
            returnType: true,
            period: true,
          }
        }
      }
    })

    return NextResponse.json(createdPayment, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}