import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'

// GET single payment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payment = await db.gSTPayment.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        gstReturn: true,
      }
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error fetching payment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    )
  }
}

// PUT update payment by ID
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
      clientId,
      returnId,
      challanNo,
      paymentType,
      amount,
      status,
      bankReference,
      paidAt,
    } = body

    // Check if payment exists
    const existingPayment = await db.gSTPayment.findUnique({
      where: { id: params.id },
      include: { client: true }
    })

    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Update payment
    const updateData: any = {
      ...(clientId !== undefined && { clientId }),
      ...(returnId !== undefined && { returnId }),
      ...(challanNo !== undefined && { challanNo }),
      ...(paymentType !== undefined && { paymentType }),
      ...(amount !== undefined && { amount: parseFloat(amount) }),
      ...(status && { status }),
      ...(bankReference !== undefined && { bankReference }),
      ...(paidAt !== undefined && { paidAt: paidAt ? new Date(paidAt) : null }),
    }

    // Update paidAt based on status change
    if (status && status === 'PAID' && status !== existingPayment.status) {
      updateData.paidAt = new Date()
    } else if (status && status !== 'PAID') {
      updateData.paidAt = null
    }

    const payment = await db.gSTPayment.update({
      where: { id: params.id },
      data: updateData
    })

    // Update return status if payment is paid and linked to a return
    if (status === 'PAID' && returnId) {
      await db.gSTReturn.update({
        where: { id: returnId },
        data: { status: 'Filed' }
      })
    }

    const updatedPayment = await db.gSTPayment.findUnique({
      where: { id: params.id },
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

    return NextResponse.json(updatedPayment)
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    )
  }
}

// DELETE payment by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if payment exists
    const existingPayment = await db.gSTPayment.findUnique({
      where: { id: params.id }
    })

    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Delete payment
    await db.gSTPayment.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Payment deleted successfully' })
  } catch (error) {
    console.error('Error deleting payment:', error)
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    )
  }
}