import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'

// GET single return by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const returnData = await db.gSTReturn.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        documents: true,
        payments: true,
      }
    })

    if (!returnData) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 })
    }

    return NextResponse.json(returnData)
  } catch (error) {
    console.error('Error fetching return:', error)
    return NextResponse.json(
      { error: 'Failed to fetch return' },
      { status: 500 }
    )
  }
}

// PUT update return by ID
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
      returnType,
      period,
      status,
      dueDate,
      acknowledgementNo,
      documents,
      payments,
    } = body

    // Check if return exists
    const existingReturn = await db.gSTReturn.findUnique({
      where: { id: params.id },
      include: { client: true }
    })

    if (!existingReturn) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 })
    }

    // Update return
    const updateData: any = {
      ...(clientId !== undefined && { clientId }),
      ...(returnType !== undefined && { returnType }),
      ...(period !== undefined && { period }),
      ...(status && { status }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(acknowledgementNo !== undefined && { acknowledgementNo }),
    }

    // Update timestamps based on status change
    if (status && status !== existingReturn.status) {
      if (status === 'Filed' && !existingReturn.filedAt) {
        updateData.filedAt = new Date()
      }
      if (status === 'Processed' && !existingReturn.processedAt) {
        updateData.processedAt = new Date()
      }
    }

    const returnUpdated = await db.gSTReturn.update({
      where: { id: params.id },
      data: updateData
    })

    // Handle documents if provided
    if (documents && documents.length > 0) {
      // Delete existing documents
      await db.document.deleteMany({
        where: { returnId: params.id }
      })

      // Create new documents
      await db.document.createMany({
        data: documents.map((doc: any) => ({
          clientId: existingReturn.clientId,
          returnId: params.id,
          name: doc.name,
          type: doc.type,
          filePath: doc.filePath,
          mimeType: doc.mimeType,
          fileSize: doc.fileSize,
        }))
      })
    }

    // Handle payments if provided
    if (payments && payments.length > 0) {
      // Delete existing payments
      await db.gSTPayment.deleteMany({
        where: { returnId: params.id }
      })

      // Create new payments
      await db.gSTPayment.createMany({
        data: payments.map((payment: any) => ({
          clientId: existingReturn.clientId,
          returnId: params.id,
          amount: payment.amount,
          status: payment.status,
          paidAt: payment.status === 'PAID' ? new Date() : null,
        }))
      })
    }

    const updatedReturn = await db.gSTReturn.findUnique({
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

    return NextResponse.json(updatedReturn)
  } catch (error) {
    console.error('Error updating return:', error)
    return NextResponse.json(
      { error: 'Failed to update return' },
      { status: 500 }
    )
  }
}

// DELETE return by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if return exists
    const existingReturn = await db.gSTReturn.findUnique({
      where: { id: params.id }
    })

    if (!existingReturn) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 })
    }

    // Delete associated documents
    await db.document.deleteMany({
      where: { returnId: params.id }
    })

    // Delete associated payments
    await db.gSTPayment.deleteMany({
      where: { returnId: params.id }
    })

    // Delete return
    await db.gSTReturn.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Return deleted successfully' })
  } catch (error) {
    console.error('Error deleting return:', error)
    return NextResponse.json(
      { error: 'Failed to delete return' },
      { status: 500 }
    )
  }
}