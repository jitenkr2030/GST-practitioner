import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoices = await db.invoice.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        client: {
          select: {
            id: true,
            businessName: true,
            gstin: true,
            email: true,
            phone: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { clientId, amount, description, dueDate, services } = body

    if (!clientId || !amount || !description || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate invoice number
    const currentYear = new Date().getFullYear()
    const invoiceCount = await db.invoice.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: new Date(`${currentYear}-01-01`)
        }
      }
    })
    
    const invoiceNo = `INV-${currentYear}-${String(invoiceCount + 1).padStart(3, '0')}`

    const invoice = await db.invoice.create({
      data: {
        invoiceNo,
        amount,
        description,
        issuedAt: new Date(),
        dueDate: new Date(dueDate),
        status: 'DRAFT',
        clientId,
        userId: session.user.id
      },
      include: {
        client: {
          select: {
            id: true,
            businessName: true,
            gstin: true,
            email: true,
            phone: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}