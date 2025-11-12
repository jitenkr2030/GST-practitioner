import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'

// GET single registration by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const registration = await db.gSTRegistration.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        documents: true,
      }
    })

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error('Error fetching registration:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registration' },
      { status: 500 }
    )
  }
}

// PUT update registration by ID
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
      applicationNo,
      referenceNo,
      status,
      arn,
      effectiveDate,
      documents,
    } = body

    // Check if registration exists
    const existingRegistration = await db.gSTRegistration.findUnique({
      where: { id: params.id },
      include: { client: true }
    })

    if (!existingRegistration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Update registration
    const updateData: any = {
      ...(applicationNo !== undefined && { applicationNo }),
      ...(referenceNo !== undefined && { referenceNo }),
      ...(status && { status }),
      ...(arn !== undefined && { arn }),
      ...(effectiveDate !== undefined && { effectiveDate: effectiveDate ? new Date(effectiveDate) : null }),
    }

    // Update timestamps based on status change
    if (status && status !== existingRegistration.status) {
      if (status === 'Submitted' && !existingRegistration.submittedAt) {
        updateData.submittedAt = new Date()
      }
      if (status === 'Approved' && !existingRegistration.approvedAt) {
        updateData.approvedAt = new Date()
      }
    }

    const registration = await db.gSTRegistration.update({
      where: { id: params.id },
      data: updateData
    })

    // Handle documents if provided
    if (documents && documents.length > 0) {
      // Delete existing documents
      await db.document.deleteMany({
        where: { registrationId: params.id }
      })

      // Create new documents
      await db.document.createMany({
        data: documents.map((doc: any) => ({
          clientId: existingRegistration.clientId,
          registrationId: params.id,
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
        where: { id: existingRegistration.clientId },
        data: { gstStatus: 'ACTIVE' }
      })
    }

    const updatedRegistration = await db.gSTRegistration.findUnique({
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
        }
      }
    })

    return NextResponse.json(updatedRegistration)
  } catch (error) {
    console.error('Error updating registration:', error)
    return NextResponse.json(
      { error: 'Failed to update registration' },
      { status: 500 }
    )
  }
}

// DELETE registration by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if registration exists
    const existingRegistration = await db.gSTRegistration.findUnique({
      where: { id: params.id }
    })

    if (!existingRegistration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Delete associated documents
    await db.document.deleteMany({
      where: { registrationId: params.id }
    })

    // Delete registration
    await db.gSTRegistration.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Registration deleted successfully' })
  } catch (error) {
    console.error('Error deleting registration:', error)
    return NextResponse.json(
      { error: 'Failed to delete registration' },
      { status: 500 }
    )
  }
}