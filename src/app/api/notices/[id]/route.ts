import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'

// GET single notice by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notice = await db.notice.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        documents: true,
      }
    })

    if (!notice) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 })
    }

    return NextResponse.json(notice)
  } catch (error) {
    console.error('Error fetching notice:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notice' },
      { status: 500 }
    )
  }
}

// PUT update notice by ID
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
      noticeNo,
      noticeType,
      subject,
      receivedAt,
      dueDate,
      status,
      description,
      replyDraft,
      documents,
    } = body

    // Check if notice exists
    const existingNotice = await db.notice.findUnique({
      where: { id: params.id },
      include: { client: true }
    })

    if (!existingNotice) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 })
    }

    // Update notice
    const updateData: any = {
      ...(noticeNo !== undefined && { noticeNo }),
      ...(noticeType && { noticeType }),
      ...(subject && { subject }),
      ...(receivedAt !== undefined && { receivedAt: receivedAt ? new Date(receivedAt) : existingNotice.receivedAt }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : existingNotice.dueDate }),
      ...(status && { status }),
      ...(description !== undefined && { description }),
      ...(replyDraft !== undefined && { replyDraft }),
    }

    // Update repliedAt timestamp if status changed to REPLIED
    if (status === 'REPLIED' && existingNotice.status !== 'REPLIED') {
      updateData.repliedAt = new Date()
    }

    const notice = await db.notice.update({
      where: { id: params.id },
      data: updateData
    })

    // Handle documents if provided
    if (documents && documents.length > 0) {
      // Delete existing documents
      await db.document.deleteMany({
        where: { noticeId: params.id }
      })

      // Create new documents
      await db.document.createMany({
        data: documents.map((doc: any) => ({
          clientId: existingNotice.clientId,
          noticeId: params.id,
          name: doc.name,
          type: doc.type,
          filePath: doc.filePath,
          mimeType: doc.mimeType,
          fileSize: doc.fileSize,
        }))
      })
    }

    const updatedNotice = await db.notice.findUnique({
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

    return NextResponse.json(updatedNotice)
  } catch (error) {
    console.error('Error updating notice:', error)
    return NextResponse.json(
      { error: 'Failed to update notice' },
      { status: 500 }
    )
  }
}

// DELETE notice by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if notice exists
    const existingNotice = await db.notice.findUnique({
      where: { id: params.id }
    })

    if (!existingNotice) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 })
    }

    // Delete associated documents
    await db.document.deleteMany({
      where: { noticeId: params.id }
    })

    // Delete notice
    await db.notice.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Notice deleted successfully' })
  } catch (error) {
    console.error('Error deleting notice:', error)
    return NextResponse.json(
      { error: 'Failed to delete notice' },
      { status: 500 }
    )
  }
}